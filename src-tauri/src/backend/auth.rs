//! Kullanıcı kaydı ve girişi (Laravel Auth karşılığı). Parolalar Argon2id ile özetlenir.
//! İlk kayıt olan kullanıcı `admin` rolünü alır (yerel kurulum açılışı); sonrakiler rolsüz kalır
//! ve bir yönetici tarafından rol alır (`sync_roles`).
use crate::backend::error::{AppError, AppResult, FieldError};
use crate::backend::rbac::{self, ModelRef, SUPER_ADMIN_ROLE};
use crate::backend::util::NOW_SQL;
use argon2::password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::Argon2;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub status: String,
    pub last_login_at: Option<String>,
    pub created_at: String,
}

fn hash_password(password: &str) -> AppResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| AppError::Internal(format!("parola özetlenemedi: {e}")))
}

fn verify_password(password: &str, hash: &str) -> bool {
    match PasswordHash::new(hash) {
        Ok(parsed) => Argon2::default().verify_password(password.as_bytes(), &parsed).is_ok(),
        Err(_) => false,
    }
}

fn valid_email(e: &str) -> bool {
    let len = e.chars().count();
    (5..=254).contains(&len) && !e.contains(char::is_whitespace) && e.matches('@').count() == 1 && {
        let (local, domain) = e.split_once('@').unwrap_or(("", ""));
        !local.is_empty() && domain.contains('.') && !domain.starts_with('.') && !domain.ends_with('.')
    }
}

fn field(field: &str, message: &str) -> FieldError {
    FieldError { field: field.into(), message: message.into() }
}

fn validate(name: Option<&str>, email: &str, password: Option<&str>) -> AppResult<()> {
    let mut errors = Vec::new();
    if let Some(n) = name {
        let len = n.trim().chars().count();
        if !(2..=80).contains(&len) {
            errors.push(field("name", "Ad soyad 2–80 karakter olmalı."));
        }
    }
    if !valid_email(email) {
        errors.push(field("email", "Geçerli bir e-posta adresi gir."));
    }
    if let Some(p) = password {
        let len = p.chars().count();
        if !(8..=128).contains(&len) {
            errors.push(field("password", "Parola 8–128 karakter olmalı."));
        }
    }
    if errors.is_empty() { Ok(()) } else { Err(AppError::Validation(errors)) }
}

fn row_to_user(r: &rusqlite::Row<'_>) -> rusqlite::Result<User> {
    Ok(User { id: r.get(0)?, name: r.get(1)?, email: r.get(2)?, status: r.get(3)?, last_login_at: r.get(4)?, created_at: r.get(5)? })
}

const USER_COLS: &str = "id, name, email, status, last_login_at, created_at";
pub const OWNER_EMAIL: &str = "harunekici@gmail.com";

pub fn user_by_id(conn: &Connection, id: i64) -> AppResult<User> {
    conn.query_row(&format!("SELECT {USER_COLS} FROM users WHERE id = ?1"), [id], row_to_user)
        .optional()?
        .ok_or_else(|| AppError::NotFound("Kullanıcı bulunamadı.".into()))
}

/// `POST /register`. İlk kullanıcı `admin` olur.
pub fn register(conn: &Connection, name: &str, email: &str, password: &str) -> AppResult<User> {
    let email = email.trim().to_lowercase();
    validate(Some(name), &email, Some(password))?;
    let first: bool = conn.query_row("SELECT NOT EXISTS(SELECT 1 FROM users)", [], |r| r.get(0))?;
    let hash = hash_password(password)?;
    let res = conn.execute(
        &format!("INSERT INTO users (name, email, password, status, created_at, updated_at) VALUES (?1, ?2, ?3, 'active', {NOW_SQL}, {NOW_SQL})"),
        params![name.trim(), email, hash],
    );
    if let Err(rusqlite::Error::SqliteFailure(f, _)) = &res {
        if f.code == rusqlite::ErrorCode::ConstraintViolation {
            return Err(AppError::Conflict("Bu e-posta ile bir hesap mevcut.".into()));
        }
    }
    res?;
    let id = conn.last_insert_rowid();
    if first {
        rbac::role_find_or_create(conn, SUPER_ADMIN_ROLE)?;
        rbac::assign_role(conn, ModelRef::user(id), &[SUPER_ADMIN_ROLE])?;
    } else if let Some(default_role) = crate::backend::schema::DEFAULT_ROLE {
        // Uygulamanın son kullanıcı rolü (örn. `customer`); rol yoksa rolsüz kalır.
        if rbac::role_find_by_name(conn, default_role)?.is_some() {
            rbac::assign_role(conn, ModelRef::user(id), &[default_role])?;
        }
    }
    user_by_id(conn, id)
}

/// `POST /login`. Hata mesajı kullanıcı yokluğunu belli etmez.
pub fn attempt(conn: &Connection, email: &str, password: &str) -> AppResult<User> {
    let email = email.trim().to_lowercase();
    let row: Option<(i64, String, String)> = conn
        .query_row("SELECT id, password, status FROM users WHERE email = ?1", [&email], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))
        .optional()?;
    let bad = || AppError::validation("email", "E-posta veya parola hatalı.");
    let Some((id, hash, status)) = row else {
        // Zamanlama farkını azaltmak için var olmayan kullanıcıda da bir özetleme yapılır.
        let _ = hash_password(password);
        return Err(bad());
    };
    if !verify_password(password, &hash) {
        return Err(bad());
    }
    if status != "active" {
        return Err(AppError::Forbidden("Hesabın askıya alınmış ya da engellenmiş.".into()));
    }
    conn.execute(&format!("UPDATE users SET last_login_at = {NOW_SQL} WHERE id = ?1"), [id])?;
    user_by_id(conn, id)
}

pub fn owner_password_setup_required(conn: &Connection) -> AppResult<bool> {
    Ok(conn.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM users u
            JOIN model_has_roles mr ON mr.model_id = u.id AND mr.model_type = 'User'
            JOIN roles r ON r.id = mr.role_id
            WHERE u.email = ?1 AND u.status = 'active' AND u.password = ''
              AND r.name = 'owner' AND r.guard_name = 'web'
        )",
        [OWNER_EMAIL],
        |row| row.get(0),
    )?)
}

pub fn set_owner_initial_password(conn: &mut Connection, password: &str) -> AppResult<User> {
    validate(None, OWNER_EMAIL, Some(password))?;
    let password_hash = hash_password(password)?;
    let tx = conn.transaction()?;
    let is_pending: bool = tx.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM users u
            JOIN model_has_roles mr ON mr.model_id = u.id AND mr.model_type = 'User'
            JOIN roles r ON r.id = mr.role_id
            WHERE u.email = ?1 AND u.status = 'active' AND u.password = ''
              AND r.name = 'owner' AND r.guard_name = 'web'
        )",
        [OWNER_EMAIL],
        |row| row.get(0),
    )?;
    if !is_pending {
        return Err(AppError::Conflict("Owner ilk parola kurulumu tamamlanmış veya kullanılamıyor.".into()));
    }

    let changed = tx.execute(
        &format!("UPDATE users SET password = ?1, updated_at = {NOW_SQL} WHERE email = ?2 AND status = 'active' AND password = ''"),
        params![password_hash, OWNER_EMAIL],
    )?;
    if changed != 1 {
        return Err(AppError::Conflict("Owner parolası başka bir işlemde ayarlanmış.".into()));
    }
    let user_id: i64 = tx.query_row("SELECT id FROM users WHERE email = ?1", [OWNER_EMAIL], |row| row.get(0))?;
    tx.commit()?;
    user_by_id(conn, user_id)
}

/// Komut satırı yönetici aracının karşılığı (`qtoefl:admin`): kullanıcıyı oluşturur ya da günceller, rol atar.
/// Rol önceden var olmalıdır (yoksa `NotFound`).
pub fn create_admin(conn: &Connection, email: &str, role: &str, name: &str, password: Option<&str>) -> AppResult<User> {
    let email = email.trim().to_lowercase();
    validate(Some(name), &email, password)?;
    rbac::role_find_by_name(conn, role)?.ok_or_else(|| AppError::NotFound(format!("`{role}` adında bir rol yok.")))?;
    let existing: Option<i64> = conn.query_row("SELECT id FROM users WHERE email = ?1", [&email], |r| r.get(0)).optional()?;
    let id = match existing {
        Some(id) => {
            if let Some(p) = password {
                conn.execute(
                    &format!("UPDATE users SET name = ?1, password = ?2, updated_at = {NOW_SQL} WHERE id = ?3"),
                    params![name.trim(), hash_password(p)?, id],
                )?;
            } else {
                conn.execute(&format!("UPDATE users SET name = ?1, updated_at = {NOW_SQL} WHERE id = ?2"), params![name.trim(), id])?;
            }
            id
        }
        None => {
            let p = password.ok_or_else(|| AppError::validation("password", "Yeni kullanıcı için parola gerekli."))?;
            conn.execute(
                &format!("INSERT INTO users (name, email, password, status, created_at, updated_at) VALUES (?1, ?2, ?3, 'active', {NOW_SQL}, {NOW_SQL})"),
                params![name.trim(), email, hash_password(p)?],
            )?;
            conn.last_insert_rowid()
        }
    };
    rbac::assign_role(conn, ModelRef::user(id), &[role])?;
    user_by_id(conn, id)
}

/// Oturumdaki kullanıcı + rolleri + tüm izinleri (ön yüz menü/buton görünürlüğü için).
pub fn user_with_access(conn: &Connection, id: i64) -> AppResult<Value> {
    let user = user_by_id(conn, id)?;
    let m = ModelRef::user(id);
    let roles = rbac::role_names(conn, m)?;
    let super_admin = roles.iter().any(|r| r == SUPER_ADMIN_ROLE);
    Ok(json!({
        "user": user,
        "roles": roles,
        "superAdmin": super_admin,
        "permissions": rbac::all_permissions(conn, m)?,
    }))
}

/// Yönetici listesi (`AdminUser` biçimi: `role` = ilk rol, `roles` = tümü).
pub fn list_users(conn: &Connection) -> AppResult<Vec<Value>> {
    let mut st = conn.prepare(&format!("SELECT {USER_COLS} FROM users ORDER BY id"))?;
    let users: Vec<User> = st.query_map([], row_to_user)?.collect::<Result<Vec<_>, _>>()?;
    let mut out = Vec::new();
    for u in users {
        let roles = rbac::role_names(conn, ModelRef::user(u.id))?;
        out.push(json!({
            "id": u.id, "name": u.name, "email": u.email,
            "role": roles.first().cloned(), "roles": roles,
            "active": u.status == "active", "status": u.status,
            "lastLoginAt": u.last_login_at, "createdAt": u.created_at,
        }));
    }
    Ok(out)
}

pub fn set_status(conn: &Connection, id: i64, status: &str) -> AppResult<User> {
    if !["active", "suspended", "banned"].contains(&status) {
        return Err(AppError::validation("status", "Durum active, suspended veya banned olmalı."));
    }
    user_by_id(conn, id)?;
    if status != "active" && rbac::has_role(conn, ModelRef::user(id), SUPER_ADMIN_ROLE)? {
        let admins: i64 = conn.query_row(
            "SELECT COUNT(*) FROM model_has_roles mr JOIN roles r ON r.id = mr.role_id JOIN users u ON u.id = mr.model_id
             WHERE r.name = ?1 AND mr.model_type = 'User' AND u.status = 'active'",
            [SUPER_ADMIN_ROLE],
            |r| r.get(0),
        )?;
        if admins <= 1 {
            return Err(AppError::Conflict("Son etkin süper yönetici askıya alınamaz.".into()));
        }
    }
    conn.execute(&format!("UPDATE users SET status = ?1, updated_at = {NOW_SQL} WHERE id = ?2"), params![status, id])?;
    user_by_id(conn, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn owner_setup_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                status TEXT NOT NULL,
                last_login_at TEXT,
                created_at TEXT,
                updated_at TEXT
            );
            CREATE TABLE roles (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                guard_name TEXT NOT NULL
            );
            CREATE TABLE model_has_roles (
                role_id INTEGER NOT NULL,
                model_type TEXT NOT NULL,
                model_id INTEGER NOT NULL
            );
            INSERT INTO users (id, name, email, password, status, created_at)
            VALUES (1, 'Harun Ekici', 'harunekici@gmail.com', '', 'active', 'now');
            INSERT INTO roles (id, name, guard_name) VALUES (1, 'owner', 'web');
            INSERT INTO model_has_roles (role_id, model_type, model_id)
            VALUES (1, 'User', 1);",
        )
        .unwrap();
        conn
    }

    #[test]
    fn email_checks() {
        assert!(valid_email("ad@ornek.com"));
        assert!(!valid_email("ad@ornek"));
        assert!(!valid_email("ad ornek@x.com"));
        assert!(!valid_email("@x.com"));
    }

    #[test]
    fn hash_roundtrip() {
        let h = hash_password("gizli-parola").unwrap();
        assert!(verify_password("gizli-parola", &h));
        assert!(!verify_password("yanlis", &h));
    }

    #[test]
    fn owner_initial_password_is_single_use_and_logs_in() {
        let mut conn = owner_setup_db();
        assert!(owner_password_setup_required(&conn).unwrap());

        let user = set_owner_initial_password(&mut conn, "harun-parola-123").unwrap();
        assert_eq!(user.email, OWNER_EMAIL);
        assert!(!owner_password_setup_required(&conn).unwrap());
        assert!(attempt(&conn, OWNER_EMAIL, "harun-parola-123").is_ok());
        assert!(matches!(
            set_owner_initial_password(&mut conn, "farkli-parola-123"),
            Err(AppError::Conflict(_))
        ));
    }

    #[test]
    fn owner_initial_password_requires_active_owner_record() {
        let mut conn = owner_setup_db();
        conn.execute("UPDATE users SET status = 'suspended'", []).unwrap();

        assert!(!owner_password_setup_required(&conn).unwrap());
        assert!(matches!(
            set_owner_initial_password(&mut conn, "harun-parola-123"),
            Err(AppError::Conflict(_))
        ));
    }
}

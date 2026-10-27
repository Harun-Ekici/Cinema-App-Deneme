//! CineQ iş işlevleri: koltuk haritası, seans çakışma denetimi, koltuk tutma, bilet + büfe siparişi (PNR üretimi),
//! kapıda bilet doğrulama, iade, seans iptali, salon yayını ve panel özeti.
//! Bilet kodu biçimi (eğitmen önerisi): `CNQ-<salon>-<seans saati>-<6 haneli rastgele>`, örn. `CNQ-S3-2130-7F4K2Q`.
use crate::backend::audit;
use crate::backend::crud;
use crate::backend::error::{AppError, AppResult, FieldError};
use crate::backend::policy::authorize;
use crate::backend::schema;
use crate::backend::state::AppState;
use crate::backend::util::{new_id, now_iso, random_from, NOW_SQL};
use rusqlite::{params, Connection, OptionalExtension};
use serde_json::{json, Value};
use tauri::State;

pub const ALFA: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
pub const TEMIZLIK_DK: i64 = 15;
pub const TUTMA_DK: i64 = 10;

// ───────────────────────── Koltuk haritası ─────────────────────────

pub fn koltuk_adi(satir: i64, sutun: i64) -> String {
    format!("{}{}", (b'A' + satir as u8) as char, sutun + 1)
}

fn liste_i64(v: &Value) -> Vec<i64> {
    v.as_array().map(|a| a.iter().filter_map(Value::as_i64).collect()).unwrap_or_default()
}

/// Satış için kullanılabilir koltuklar: koridor sütunları ve "kullanılamaz" işaretliler hariç.
pub fn kullanilabilir_koltuklar(harita: &Value) -> Vec<(i64, i64)> {
    let (satir, sutun) = (harita["satir"].as_i64().unwrap_or(0), harita["sutun"].as_i64().unwrap_or(0));
    let koridor = liste_i64(&harita["koridorSutunlari"]);
    let yok: Vec<(i64, i64)> = harita["kullanilamaz"].as_array().map(|a| a.iter().map(|k| (k["satir"].as_i64().unwrap_or(-1), k["sutun"].as_i64().unwrap_or(-1))).collect()).unwrap_or_default();
    let mut out = Vec::new();
    for r in 0..satir {
        for col in 0..sutun {
            if !koridor.contains(&col) && !yok.contains(&(r, col)) {
                out.push((r, col));
            }
        }
    }
    out
}

pub fn kapasite(harita: &Value) -> usize {
    kullanilabilir_koltuklar(harita).len()
}

pub fn koltuk_kategorisi(harita: &Value, satir: i64) -> &'static str {
    if liste_i64(&harita["vipSatirlari"]).contains(&satir) { "vip" } else { "standart" }
}

/// Yayın öncesi harita denetimi
pub fn harita_dogrula(h: &Value) -> AppResult<()> {
    let (satir, sutun) = (h["satir"].as_i64().unwrap_or(0), h["sutun"].as_i64().unwrap_or(0));
    let mut e = Vec::new();
    if !(1..=40).contains(&satir) || !(1..=60).contains(&sutun) {
        e.push(FieldError { field: "harita".into(), message: "Satır 1–40, sütun 1–60 olmalı.".into() });
    }
    if liste_i64(&h["koridorSutunlari"]).iter().any(|c| *c < 0 || *c >= sutun) {
        e.push(FieldError { field: "koridorSutunlari".into(), message: "Koridor sütunu harita dışında.".into() });
    }
    if liste_i64(&h["vipSatirlari"]).iter().any(|r| *r < 0 || *r >= satir) {
        e.push(FieldError { field: "vipSatirlari".into(), message: "VIP satırı harita dışında.".into() });
    }
    if kapasite(h) == 0 {
        e.push(FieldError { field: "harita".into(), message: "Kullanılabilir koltuk yok.".into() });
    }
    if e.is_empty() { Ok(()) } else { Err(AppError::Validation(e)) }
}

// ───────────────────────── Zaman ve PNR ─────────────────────────

/// `YYYY-MM-DDTHH:mm` → 1970'ten itibaren dakika (medeni takvim → gün sayısı; Hinnant algoritması)
pub fn dakika(z: &str) -> Option<i64> {
    let y: i64 = z.get(0..4)?.parse().ok()?;
    let m: i64 = z.get(5..7)?.parse().ok()?;
    let d: i64 = z.get(8..10)?.parse().ok()?;
    let hh: i64 = z.get(11..13)?.parse().ok()?;
    let mm: i64 = z.get(14..16)?.parse().ok()?;
    if !(1..=12).contains(&m) || !(1..=31).contains(&d) || hh > 23 || mm > 59 {
        return None;
    }
    let y = if m <= 2 { y - 1 } else { y };
    let era = y.div_euclid(400);
    let yoe = y - era * 400;
    let doy = (153 * (if m > 2 { m - 3 } else { m + 9 }) + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    Some((era * 146097 + doe - 719468) * 1440 + hh * 60 + mm)
}

/// `CNQ-S3-2130-7F4K2Q`
pub fn pnr_uret(salon_no: i64, baslangic: &str) -> String {
    let saat = format!("{}{}", baslangic.get(11..13).unwrap_or("00"), baslangic.get(14..16).unwrap_or("00"));
    format!("CNQ-S{salon_no}-{saat}-{}", random_from(ALFA, 6))
}

pub fn pnr_gecerli_mi(s: &str) -> bool {
    let p: Vec<&str> = s.split('-').collect();
    p.len() == 4
        && p[0] == "CNQ"
        && p[1].len() >= 2 && p[1].len() <= 16 && p[1].starts_with('S')
        && p[1][1..].bytes().all(|b| b.is_ascii_alphanumeric())
        && p[2].len() == 4
        && p[2].get(0..2).and_then(|hh| hh.parse::<u8>().ok()).is_some_and(|hh| hh <= 23)
        && p[2].get(2..4).and_then(|mm| mm.parse::<u8>().ok()).is_some_and(|mm| mm <= 59)
        && p[3].len() == 6 && p[3].bytes().all(|b| b.is_ascii_alphanumeric())
}

fn musteri_kimligi(uid: i64) -> String {
    format!("u{uid}")
}

// ───────────────────────── Seanslar ─────────────────────────

/// Aynı salonda `[baslangic, baslangic + süre + temizlik)` aralıkları kesişen seans var mı?
fn cakisan_seans(c: &Connection, salon_id: &str, baslangic: i64, sure_dk: i64, haric: Option<&str>) -> AppResult<Option<String>> {
    let mut st = c.prepare("SELECT s.id, s.baslangic, f.sureDk FROM seanslar s JOIN filmler f ON f.id = s.filmId WHERE s.salonId = ?1 AND s.iptal IS NULL")?;
    let rows = st.query_map([salon_id], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?, r.get::<_, i64>(2)?)))?;
    for r in rows {
        let (id, b, sure) = r?;
        if Some(id.as_str()) == haric {
            continue;
        }
        if let Some(b0) = dakika(&b) {
            let (a_bit, b_bit) = (baslangic + sure_dk + TEMIZLIK_DK, b0 + sure + TEMIZLIK_DK);
            if baslangic < b_bit && b0 < a_bit {
                return Ok(Some(b));
            }
        }
    }
    Ok(None)
}

fn bilet_fiyatlarini_normalize_et(fiyat: &Value) -> AppResult<Value> {
    let tam = fiyat["tam"].as_f64().or_else(|| fiyat["standart"].as_f64());
    let ogrenci = fiyat["ogrenci"].as_f64();
    let vip = fiyat["vip"].as_f64();
    let (Some(tam), Some(vip)) = (tam, vip) else {
        return Err(AppError::validation("fiyat", "Tam ve VIP bilet fiyatları belirtilmeli."));
    };
    let ogrenci = ogrenci.unwrap_or(tam * 0.8);
    if [tam, ogrenci, vip].iter().any(|value| !value.is_finite() || *value < 0.0) {
        return Err(AppError::validation("fiyat", "Bilet fiyatları sıfır veya daha büyük olmalı."));
    }
    Ok(json!({ "standart": tam, "tam": tam, "ogrenci": ogrenci, "vip": vip }))
}

/// Seans oluştur (`Create:Seans`): film ve yayınlanmış salon var olmalı, salonda çakışma olmamalı.
/// `fiyat`: tam, öğrenci ve VIP değerleri; `standart` eski kayıtlarla uyumludur.
pub fn do_seans_olustur(app: &AppState, girdi: &Value) -> AppResult<Value> {
    app.db.with(|c| {
        let uid = authorize(c, app.user(), "Create:Seans")?;
        let film_id = girdi.get("filmId").and_then(Value::as_i64).ok_or_else(|| AppError::validation("filmId", "Film seçilmeli."))?;
        let salon_id = girdi.get("salonId").and_then(Value::as_str).ok_or_else(|| AppError::validation("salonId", "Salon seçilmeli."))?;
        let baslangic = girdi.get("baslangic").and_then(Value::as_str).ok_or_else(|| AppError::validation("baslangic", "Başlangıç gerekli."))?;
        let b = dakika(baslangic).ok_or_else(|| AppError::validation("baslangic", "Tarih YYYY-MM-DDTHH:mm biçiminde olmalı."))?;
        let film = crud::find(c, &schema::FILM, &json!(film_id))?;
        let salon = crud::find(c, &schema::SALON, &json!(salon_id))?;
        if salon["durum"] != json!("yayinda") {
            return Err(AppError::Conflict("Seans yalnız yayınlanmış salona eklenir.".into()));
        }
        let fiyat = bilet_fiyatlarini_normalize_et(&girdi["fiyat"])?;
        if let Some(cakisan) = cakisan_seans(c, salon_id, b, film["sureDk"].as_i64().unwrap_or(0), None)? {
            return Err(AppError::Conflict(format!("Salonda {cakisan} başlangıçlı seansla çakışıyor (film süresi + {TEMIZLIK_DK} dk temizlik).")));
        }
        let kayit = json!({
            "id": new_id(), "filmId": film_id, "salonId": salon_id, "baslangic": baslangic,
            "dil": girdi.get("dil").cloned().unwrap_or(json!("tr")), "altyazi": girdi.get("altyazi"), "fiyat": fiyat,
        });
        let s = crud::insert(c, &schema::SEANS, &kayit)?;
        audit::record(c, Some(uid), "Seans.create", "Seans", s["id"].as_str().unwrap_or(""), None, None, Some(&s))?;
        Ok(s)
    })
}

pub fn do_seans_guncelle(app: &AppState, id: &str, girdi: &Value) -> AppResult<Value> {
    app.db.with(|c| {
        let uid = authorize(c, app.user(), "Update:Seans")?;
        let once = crud::find(c, &schema::SEANS, &json!(id))?;
        if !once["iptal"].is_null() {
            return Err(AppError::Conflict("İptal edilmiş seans düzenlenemez.".into()));
        }
        let film_id = girdi.get("filmId").and_then(Value::as_i64).or_else(|| once["filmId"].as_i64())
            .ok_or_else(|| AppError::validation("filmId", "Film seçilmeli."))?;
        let salon_id = girdi.get("salonId").and_then(Value::as_str).or_else(|| once["salonId"].as_str())
            .ok_or_else(|| AppError::validation("salonId", "Salon seçilmeli."))?;
        let baslangic = girdi.get("baslangic").and_then(Value::as_str).or_else(|| once["baslangic"].as_str())
            .ok_or_else(|| AppError::validation("baslangic", "Başlangıç gerekli."))?;
        let start = dakika(baslangic).ok_or_else(|| AppError::validation("baslangic", "Tarih YYYY-MM-DDTHH:mm biçiminde olmalı."))?;
        let film = crud::find(c, &schema::FILM, &json!(film_id))?;
        let salon = crud::find(c, &schema::SALON, &json!(salon_id))?;
        if salon["durum"] != json!("yayinda") {
            return Err(AppError::Conflict("Seans yalnız yayınlanmış salona eklenir.".into()));
        }
        if let Some(conflict) = cakisan_seans(c, salon_id, start, film["sureDk"].as_i64().unwrap_or(120), Some(id))? {
            return Err(AppError::Conflict(format!("Salonda {conflict} başlangıçlı seansla çakışıyor (film süresi + {TEMIZLIK_DK} dk temizlik).")));
        }
        let fiyat = bilet_fiyatlarini_normalize_et(girdi.get("fiyat").unwrap_or(&once["fiyat"]))?;
        let mut updates = json!({
            "filmId": film_id,
            "salonId": salon_id,
            "baslangic": baslangic,
            "fiyat": fiyat,
        });
        for field in ["dil", "altyazi"] {
            if let Some(value) = girdi.get(field) {
                updates[field] = value.clone();
            }
        }
        let sonra = crud::update(c, &schema::SEANS, &json!(id), &updates)?;
        audit::record(c, Some(uid), "Seans.update", "Seans", id, None, Some(&once), Some(&sonra))?;
        Ok(sonra)
    })
}

fn restore_concession_stock(conn: &Connection, value: &Value) -> AppResult<()> {
    let items = match value {
        Value::String(serialized) => serde_json::from_str::<Value>(serialized)?,
        Value::Array(_) => value.clone(),
        _ => return Err(AppError::Internal("Sipariş büfe bilgisi liste biçiminde değil.".into())),
    };
    for item in items.as_array().ok_or_else(|| AppError::Internal("Sipariş büfe bilgisi geçersiz.".into()))? {
        let quantity = item["adet"].as_i64().filter(|amount| *amount > 0)
            .ok_or_else(|| AppError::Internal("Sipariş büfe adedi geçersiz.".into()))?;
        if let Some(product_id) = item["urunId"].as_str() {
            let changed = conn.execute("UPDATE bufe_urunleri SET stok = stok + ?2 WHERE id = ?1", params![product_id, quantity])?;
            if changed != 1 {
                return Err(AppError::Internal(format!("`{product_id}` büfe ürünü stok iadesinde bulunamadı.")));
            }
        } else if let Some(menu_id) = item["menuId"].as_str() {
            let contents: String = conn.query_row("SELECT icerik FROM bufe_menuleri WHERE id = ?1", [menu_id], |row| row.get(0))?;
            let menu_items: Value = serde_json::from_str(&contents)?;
            for component in menu_items.as_array().ok_or_else(|| AppError::Internal("Menü içeriği geçersiz.".into()))? {
                let product_id = component["urunId"].as_str()
                    .ok_or_else(|| AppError::Internal("Menü ürün kimliği eksik.".into()))?;
                let count = component["adet"].as_i64().filter(|amount| *amount > 0)
                    .ok_or_else(|| AppError::Internal("Menü ürün adedi geçersiz.".into()))? * quantity;
                let changed = conn.execute(
                    "UPDATE bufe_urunleri SET stok = stok + ?2 WHERE id = ?1",
                    params![product_id, count],
                )?;
                if changed != 1 {
                    return Err(AppError::Internal(format!("`{product_id}` menü ürünü stok iadesinde bulunamadı.")));
                }
            }
        } else {
            return Err(AppError::Internal("Sipariş büfe kaleminde ürün veya menü kimliği eksik.".into()));
        }
    }
    Ok(())
}

/// Seansı iptal eder (`Update:Seans`). Satılmış bilet varsa `otomatik_iade` onayı gerekir; onaylanırsa siparişler iade olur.
pub fn do_seans_iptal(app: &AppState, id: &str, neden: &str, otomatik_iade: bool) -> AppResult<Value> {
    app.db.with(|c| {
        let uid = authorize(c, app.user(), "Update:Seans")?;
        if neden.trim().is_empty() {
            return Err(AppError::validation("neden", "İptal nedeni zorunlu."));
        }
        let s = crud::find(c, &schema::SEANS, &json!(id))?;
        if !s["iptal"].is_null() {
            return Err(AppError::Conflict("Seans zaten iptal edilmiş.".into()));
        }
        let etkilenen: i64 = c.query_row(
            "SELECT COUNT(*) FROM biletler b JOIN siparisler p ON p.id = b.siparisId WHERE b.seansId = ?1 AND p.durum IN ('odendi', 'kullanildi')",
            [id],
            |r| r.get(0),
        )?;
        if etkilenen > 0 && !otomatik_iade {
            return Err(AppError::Conflict(format!("Bu seansta {etkilenen} satılmış bilet var; iptal için otomatik iade onayı gerekir.")));
        }
        let tx = c.unchecked_transaction()?;
        if etkilenen > 0 {
            let order_ids = {
                let mut statement = tx.prepare(
                    "SELECT DISTINCT p.id FROM siparisler p
                     JOIN biletler b ON b.siparisId = p.id
                     WHERE b.seansId = ?1 AND p.durum IN ('odendi', 'kullanildi')",
                )?;
                let rows = statement.query_map([id], |row| row.get::<_, String>(0))?;
                rows.collect::<Result<Vec<_>, _>>()?
            };
            for order_id in order_ids {
                let buffet: String = tx.query_row("SELECT bufe FROM siparisler WHERE id = ?1", [&order_id], |row| row.get(0))?;
                restore_concession_stock(&tx, &Value::String(buffet))?;
            }
            tx.execute(
                "UPDATE siparisler SET durum = 'iade' WHERE id IN (SELECT DISTINCT siparisId FROM biletler WHERE seansId = ?1) AND durum IN ('odendi', 'kullanildi')",
                [id],
            )?;
        }
        tx.execute("DELETE FROM koltuk_rezervasyonlari WHERE seansId = ?1", [id])?;
        let sonra = crud::update(&tx, &schema::SEANS, &json!(id), &json!({ "iptal": { "neden": neden.trim(), "at": now_iso(&tx)? } }))?;
        tx.commit()?;
        audit::record(c, Some(uid), "Seans.cancel", "Seans", id, Some(neden.trim()), Some(&s), Some(&json!({ "etkilenenBilet": etkilenen })))?;
        Ok(sonra)
    })
}

/// Salonu yayınlar (`Publish:Salon`): harita doğrulanır.
pub fn do_salon_yayinla(app: &AppState, id: &str) -> AppResult<Value> {
    app.db.with(|c| {
        let uid = authorize(c, app.user(), "Publish:Salon")?;
        let s = crud::find(c, &schema::SALON, &json!(id))?;
        harita_dogrula(&s["harita"])?;
        let sonra = crud::update(c, &schema::SALON, &json!(id), &json!({ "durum": "yayinda" }))?;
        audit::record(c, Some(uid), "Salon.publish", "Salon", id, None, Some(&s), Some(&sonra))?;
        Ok(sonra)
    })
}

// ───────────────────────── Koltuk ve sipariş ─────────────────────────

fn koltuklar_oku(girdi: &Value) -> AppResult<Vec<(i64, i64)>> {
    let a = girdi.as_array().filter(|a| !a.is_empty() && a.len() <= 10).ok_or_else(|| AppError::validation("koltuklar", "1–10 koltuk seçilmeli."))?;
    let mut out = Vec::new();
    for k in a {
        let (r, s) = (k["satir"].as_i64(), k["sutun"].as_i64());
        match (r, s) {
            (Some(r), Some(s)) if !out.contains(&(r, s)) => out.push((r, s)),
            _ => return Err(AppError::validation("koltuklar", "Koltuk bilgisi geçersiz ya da tekrarlı.")),
        }
    }
    Ok(out)
}

fn seans_hazirla(c: &Connection, seans_id: &str) -> AppResult<(Value, Value, Value)> {
    let seans = crud::find(c, &schema::SEANS, &json!(seans_id))?;
    if !seans["iptal"].is_null() {
        return Err(AppError::Conflict("Seans iptal edilmiş.".into()));
    }
    let salon = crud::find(c, &schema::SALON, &seans["salonId"])?;
    let film = crud::find(c, &schema::FILM, &seans["filmId"])?;
    Ok((seans, salon, film))
}

fn suresi_dolan_tutmalari_sil(c: &Connection) -> AppResult<()> {
    c.execute(&format!("DELETE FROM koltuk_rezervasyonlari WHERE durum = 'secili' AND tutmaBitis IS NOT NULL AND tutmaBitis < {NOW_SQL}"), [])?;
    Ok(())
}

/// Koltukları 10 dk geçici tutar (ödeme sırasında başkası alamaz). Dolu/tutulu koltuk seçilemez.
pub fn do_koltuk_sec(app: &AppState, seans_id: &str, koltuklar: &Value) -> AppResult<Value> {
    app.user().ok_or(AppError::Unauthenticated)?;
    let secim = koltuklar_oku(koltuklar)?;
    app.db.with(|c| {
        let (_, salon, _) = seans_hazirla(c, seans_id)?;
        let uygun = kullanilabilir_koltuklar(&salon["harita"]);
        suresi_dolan_tutmalari_sil(c)?;
        let tx = c.unchecked_transaction()?;
        for (r, s) in &secim {
            if !uygun.contains(&(*r, *s)) {
                return Err(AppError::validation("koltuklar", &format!("{} satışa açık değil.", koltuk_adi(*r, *s))));
            }
            let var: bool = tx.query_row("SELECT EXISTS(SELECT 1 FROM koltuk_rezervasyonlari WHERE seansId = ?1 AND satir = ?2 AND sutun = ?3)", params![seans_id, r, s], |x| x.get(0))?;
            if var {
                return Err(AppError::Conflict(format!("{} dolu ya da başkası tarafından tutuluyor.", koltuk_adi(*r, *s))));
            }
            tx.execute(
                &format!("INSERT INTO koltuk_rezervasyonlari (seansId, satir, sutun, durum, tutmaBitis) VALUES (?1, ?2, ?3, 'secili', strftime('%Y-%m-%dT%H:%M:%SZ','now','+{TUTMA_DK} minutes'))"),
                params![seans_id, r, s],
            )?;
        }
        tx.commit()?;
        Ok(json!({ "seansId": seans_id, "tutulan": secim.iter().map(|(r, s)| koltuk_adi(*r, *s)).collect::<Vec<_>>(), "dakika": TUTMA_DK }))
    })
}

/// Bilet + büfe siparişi; kullanıcı oturumu ya da yerel misafir profili için tek transaction kullanır.
/// `rezervasyonlar`: `[{ seansId, koltuklar: [{ satir, sutun, biletTuru? }] }]`.
fn siparis_olustur(app: &AppState, girdi: &Value, uid: Option<i64>) -> AppResult<Value> {
    let reservations = if let Some(items) = girdi.get("rezervasyonlar").and_then(Value::as_array) {
        items.clone()
    } else if let Some(session_id) = girdi.get("seansId").and_then(Value::as_str) {
        vec![json!({ "seansId": session_id, "koltuklar": girdi.get("koltuklar").cloned().unwrap_or(Value::Null) })]
    } else {
        Vec::new()
    };
    let mut parsed_reservations = Vec::new();
    let mut total_seats = 0usize;
    for reservation in reservations {
        let session_id = reservation.get("seansId").and_then(Value::as_str)
            .ok_or_else(|| AppError::validation("seansId", "Seans seçilmeli."))?.to_string();
        let seats = reservation.get("koltuklar").and_then(Value::as_array)
            .filter(|seats| !seats.is_empty() && seats.len() <= 10)
            .ok_or_else(|| AppError::validation("koltuklar", "Her seans için 1–10 koltuk seçilmeli."))?;
        let mut parsed_seats = Vec::new();
        for seat in seats {
            let row = seat["satir"].as_i64().filter(|value| *value >= 0);
            let column = seat["sutun"].as_i64().filter(|value| *value >= 0);
            let ticket_type = seat.get("biletTuru").and_then(Value::as_str).unwrap_or("tam");
            let (Some(row), Some(column)) = (row, column) else {
                return Err(AppError::validation("koltuklar", "Koltuk bilgisi geçersiz."));
            };
            if !["tam", "ogrenci"].contains(&ticket_type) || parsed_seats.iter().any(|(r, c, _)| *r == row && *c == column) {
                return Err(AppError::validation("koltuklar", "Bilet türü geçersiz ya da koltuk tekrarlı."));
            }
            parsed_seats.push((row, column, ticket_type.to_string()));
        }
        total_seats += parsed_seats.len();
        parsed_reservations.push((session_id, parsed_seats));
    }
    if total_seats > 10 {
        return Err(AppError::validation("koltuklar", "Bir siparişte en fazla 10 bilet alınabilir."));
    }
    let buffet_input = girdi.get("bufe").and_then(Value::as_array).cloned().unwrap_or_default();
    if parsed_reservations.is_empty() && buffet_input.is_empty() {
        return Err(AppError::validation("siparis", "En az bir bilet veya büfe ürünü seçilmeli."));
    }
    app.db.with(|c| {
        let now = now_iso(c)?;
        let now_minute = dakika(now.get(..16).ok_or_else(|| AppError::Internal("Sistem saati biçimi geçersiz.".into()))?)
            .ok_or_else(|| AppError::Internal("Sistem saati biçimi geçersiz.".into()))?;
        let mut session_data = Vec::new();
        for (session_id, seats) in &parsed_reservations {
            let (session, hall, _) = seans_hazirla(c, session_id)?;
            let session_start = session["baslangic"].as_str()
                .and_then(dakika)
                .ok_or_else(|| AppError::Conflict("Seans başlangıç zamanı geçersiz.".into()))?;
            if session_start < now_minute {
                return Err(AppError::Conflict("Başlamış seansa bilet satılamaz.".into()));
            }
            let available = kullanilabilir_koltuklar(&hall["harita"]);
            for (row, column, _) in seats {
                if !available.contains(&(*row, *column)) {
                    return Err(AppError::validation("koltuklar", &format!("{} satışa açık değil.", koltuk_adi(*row, *column))));
                }
            }
            session_data.push((session_id.clone(), seats.clone(), session, hall));
        }
        suresi_dolan_tutmalari_sil(c)?;
        let tx = c.unchecked_transaction()?;
        let order_id = new_id();
        let mut buffet_lines = Vec::new();
        let mut buffet_total = 0.0;
        for item in &buffet_input {
            let quantity = item.get("adet").and_then(Value::as_i64).filter(|amount| (1..=20).contains(amount))
                .ok_or_else(|| AppError::validation("bufe", "Adet 1–20 olmalı."))?;
            if let Some(product_id) = item.get("urunId").and_then(Value::as_str) {
                let (price, stock, active): (f64, i64, bool) = tx
                    .query_row("SELECT fiyat, stok, aktif FROM bufe_urunleri WHERE id = ?1", [product_id], |row| Ok((row.get(0)?, row.get(1)?, row.get::<_, i64>(2)? != 0)))
                    .optional()?.ok_or_else(|| AppError::validation("bufe", "Büfe ürünü bulunamadı."))?;
                if !active || stock < quantity {
                    return Err(AppError::Conflict(format!("`{product_id}` yeterli stokta değil.")));
                }
                tx.execute("UPDATE bufe_urunleri SET stok = stok - ?2 WHERE id = ?1", params![product_id, quantity])?;
                buffet_total += price * quantity as f64;
                buffet_lines.push(json!({ "urunId": product_id, "adet": quantity, "birimFiyat": price }));
            } else if let Some(menu_id) = item.get("menuId").and_then(Value::as_str) {
                let (price, active, contents, status): (f64, bool, String, String) = tx
                    .query_row("SELECT fiyat, aktif, icerik, durum FROM bufe_menuleri WHERE id = ?1", [menu_id], |row| Ok((row.get(0)?, row.get::<_, i64>(1)? != 0, row.get(2)?, row.get::<_, String>(3)?)))
                    .optional()?.ok_or_else(|| AppError::validation("bufe", "Büfe menüsü bulunamadı."))?;
                if !active || status != "aktif" {
                    return Err(AppError::Conflict(format!("`{menu_id}` menüsü kapalı.")));
                }
                let menu_items: Value = serde_json::from_str(&contents)?;
                for component in menu_items.as_array().ok_or_else(|| AppError::Internal("Büfe menüsü içeriği geçersiz.".into()))? {
                    let component_id = component["urunId"].as_str().ok_or_else(|| AppError::Internal("Menü ürünü kimliği eksik.".into()))?;
                    let component_count = component["adet"].as_i64().filter(|amount| *amount > 0)
                        .ok_or_else(|| AppError::Internal("Menü ürün adedi geçersiz.".into()))? * quantity;
                    let changed = tx.execute(
                        "UPDATE bufe_urunleri SET stok = stok - ?2 WHERE id = ?1 AND aktif = 1 AND stok >= ?2",
                        params![component_id, component_count],
                    )?;
                    if changed != 1 {
                        return Err(AppError::Conflict(format!("`{component_id}` menü içeriği için yeterli stokta değil.")));
                    }
                }
                buffet_total += price * quantity as f64;
                buffet_lines.push(json!({ "menuId": menu_id, "adet": quantity, "birimFiyat": price }));
            } else {
                return Err(AppError::validation("bufe", "Kalemde urunId ya da menuId olmalı."));
            }
        }
        let customer_id: Option<String> = if let Some(user_id) = uid {
            let (name, email): (String, String) = tx.query_row("SELECT name, email FROM users WHERE id = ?1", [user_id], |row| Ok((row.get(0)?, row.get(1)?)))?;
            let id = musteri_kimligi(user_id);
            tx.execute("INSERT OR IGNORE INTO musteriler (id, ad, eposta) VALUES (?1, ?2, ?3)", params![id, name, email])?;
            Some(id)
        } else {
            None
        };
        tx.execute(
            "INSERT INTO siparisler (id, musteriId, biletler, bufe, toplam, durum) VALUES (?1, ?2, '[]', ?3, 0, 'odendi')",
            params![order_id, customer_id, json!(buffet_lines).to_string()],
        )?;
        if uid.is_none() {
            tx.execute("INSERT INTO guest_orders (orderId) VALUES (?1)", [&order_id])?;
        }
        let mut tickets = Vec::new();
        let mut ticket_total = 0.0;
        for (session_id, seats, session, hall) in &session_data {
            let hall_number = hall["numara"].as_i64().unwrap_or(0);
            let start = session["baslangic"].as_str().unwrap_or_default();
            for (row, column, ticket_type) in seats {
                let seat_category = koltuk_kategorisi(&hall["harita"], *row);
                let price = if seat_category == "vip" {
                    session["fiyat"]["vip"].as_f64()
                } else if ticket_type == "ogrenci" {
                    session["fiyat"]["ogrenci"].as_f64()
                } else {
                    session["fiyat"]["tam"].as_f64().or_else(|| session["fiyat"]["standart"].as_f64())
                }.ok_or_else(|| AppError::Internal("Seans bilet fiyatı eksik.".into()))?;
                tx.execute(
                    "INSERT INTO koltuk_rezervasyonlari (seansId, satir, sutun, durum, siparisId) VALUES (?1, ?2, ?3, 'dolu', ?4)",
                    params![session_id, row, column, order_id],
                ).map_err(|_| AppError::Conflict(format!("{} dolu ya da başka bir işlemde satın alınıyor.", koltuk_adi(*row, *column))))?;
                let code = pnr_uret(hall_number, start);
                tx.execute(
                    "INSERT INTO biletler (kod, siparisId, seansId, satir, sutun, kategori, fiyat, biletTuru) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![code, order_id, session_id, row, column, seat_category, price, ticket_type],
                )?;
                ticket_total += price;
                tickets.push(json!({
                    "kod": code, "seansId": session_id, "satir": row, "sutun": column,
                    "kategori": seat_category, "biletTuru": ticket_type, "fiyat": price,
                }));
            }
        }
        let coupon = girdi.get("indirimKodu").and_then(Value::as_str).unwrap_or("").trim().to_uppercase();
        let discount = match coupon.as_str() {
            "" => 0.0,
            "CINEQ10" => 0.10,
            "OGRENCI20" => 0.20,
            "ILKBILET" => 0.15,
            _ => return Err(AppError::validation("indirimKodu", "İndirim kodu geçersiz.")),
        };
        let raw_total = ticket_total + buffet_total;
        let final_total = ((raw_total * (1.0 - discount) * 100.0).round()) / 100.0;
        tx.execute(
            "UPDATE siparisler SET biletler = ?2, toplam = ?3 WHERE id = ?1",
            params![order_id, json!(tickets).to_string(), final_total],
        )?;
        if let Some(customer_id) = customer_id {
            tx.execute("UPDATE musteriler SET siparisSayisi = siparisSayisi + 1 WHERE id = ?1", [customer_id])?;
        }
        tx.commit()?;
        let order = crud::find(c, &schema::SIPARIS, &json!(order_id))?;
        audit::record(c, uid, "Siparis.create", "Siparis", &order_id, None, None, Some(&order))?;
        Ok(order)
    })
}

pub fn do_siparis_olustur(app: &AppState, girdi: &Value) -> AppResult<Value> {
    let user_id = app.user().ok_or(AppError::Unauthenticated)?;
    siparis_olustur(app, girdi, Some(user_id))
}

pub fn do_misafir_siparis_olustur(app: &AppState, girdi: &Value) -> AppResult<Value> {
    siparis_olustur(app, girdi, None)
}

pub fn do_misafir_biletlerim(app: &AppState) -> AppResult<Vec<Value>> {
    app.db.with(|c| {
        let mut statement = c.prepare(
            "SELECT b.kod, b.siparisId, b.seansId, b.satir, b.sutun, b.kategori, b.biletTuru, b.fiyat,
                    b.kullanildi, b.kullanimZamani, p.durum, p.olusturma, s.baslangic,
                    f.id, json_extract(f.ad, '$.tr'), sa.ad, sa.numara, si.ad, si.sehir
             FROM guest_orders g
             JOIN siparisler p ON p.id = g.orderId
             JOIN biletler b ON b.siparisId = p.id
             JOIN seanslar s ON s.id = b.seansId
             JOIN filmler f ON f.id = s.filmId
             JOIN salonlar sa ON sa.id = s.salonId
             JOIN sinemalar si ON si.id = sa.sinemaId
             ORDER BY p.olusturma DESC, b.kod",
        )?;
        let rows = statement.query_map([], |row| {
            Ok(json!({
                "kod": row.get::<_, String>(0)?,
                "siparisId": row.get::<_, String>(1)?,
                "seansId": row.get::<_, String>(2)?,
                "satir": row.get::<_, i64>(3)?,
                "sutun": row.get::<_, i64>(4)?,
                "kategori": row.get::<_, String>(5)?,
                "biletTuru": row.get::<_, String>(6)?,
                "fiyat": row.get::<_, f64>(7)?,
                "kullanildi": row.get::<_, bool>(8)?,
                "kullanimZamani": row.get::<_, Option<String>>(9)?,
                "durum": row.get::<_, String>(10)?,
                "tarih": row.get::<_, String>(11)?,
                "baslangic": row.get::<_, String>(12)?,
                "filmId": row.get::<_, i64>(13)?,
                "film": row.get::<_, String>(14)?,
                "salon": row.get::<_, String>(15)?,
                "salonNo": row.get::<_, i64>(16)?,
                "sinema": row.get::<_, String>(17)?,
                "sehir": row.get::<_, String>(18)?,
            }))
        })?;
        rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
    })
}

pub fn do_misafir_siparis_iptal(app: &AppState, order_id: &str) -> AppResult<Value> {
    app.db.with(|c| {
        let is_guest_order: bool = c.query_row(
            "SELECT EXISTS(SELECT 1 FROM guest_orders WHERE orderId = ?1)",
            [order_id],
            |row| row.get(0),
        )?;
        if !is_guest_order {
            return Err(AppError::NotFound("Misafir siparişi bulunamadı.".into()));
        }
        let order = crud::find(c, &schema::SIPARIS, &json!(order_id))?;
        if order["durum"] != json!("odendi") {
            return Err(AppError::Conflict("Yalnız ödenmiş ve kullanılmamış siparişler iptal edilebilir.".into()));
        }
        let used_tickets: i64 = c.query_row(
            "SELECT COUNT(*) FROM biletler WHERE siparisId = ?1 AND kullanildi = 1",
            [order_id],
            |row| row.get(0),
        )?;
        if used_tickets > 0 {
            return Err(AppError::Conflict("Kullanılmış bileti içeren sipariş iptal edilemez.".into()));
        }
        let started_sessions: i64 = c.query_row(
            "SELECT COUNT(*) FROM biletler b JOIN seanslar s ON s.id = b.seansId
             WHERE b.siparisId = ?1 AND s.baslangic <= strftime('%Y-%m-%dT%H:%M', 'now', 'localtime')",
            [order_id],
            |row| row.get(0),
        )?;
        if started_sessions > 0 {
            return Err(AppError::Conflict("Başlamış seansa ait sipariş iptal edilemez.".into()));
        }
        let tx = c.unchecked_transaction()?;
        restore_concession_stock(&tx, &order["bufe"])?;
        tx.execute(
            "UPDATE siparisler SET durum = 'iptal' WHERE id = ?1 AND durum = 'odendi'",
            [order_id],
        )?;
        tx.execute("DELETE FROM koltuk_rezervasyonlari WHERE siparisId = ?1", [order_id])?;
        tx.commit()?;
        let canceled = crud::find(c, &schema::SIPARIS, &json!(order_id))?;
        audit::record(c, None, "Siparis.guestCancel", "Siparis", order_id, None, Some(&order), Some(&canceled))?;
        Ok(canceled)
    })
}

/// Kapıda bilet doğrulama (`Validate:Bilet`). Sonuç: `bicim-hatali | bulunamadi | iptal | kullanilmis | gecerli`.
/// `kullan` true ve bilet geçerliyse bilet kullanıldı işaretlenir; siparişin tüm biletleri kullanıldıysa sipariş "kullanildi" olur.
pub fn do_bilet_dogrula(app: &AppState, kod: &str, kullan: bool) -> AppResult<Value> {
    app.db.with(|c| {
        let uid = authorize(c, app.user(), "Validate:Bilet")?;
        let kod = kod.trim().to_uppercase();
        if !pnr_gecerli_mi(&kod) {
            return Ok(json!({ "sonuc": "bicim-hatali" }));
        }
        let b = match crud::find(c, &schema::BILET, &json!(kod)) {
            Ok(ticket) => ticket,
            Err(AppError::NotFound(_)) => return Ok(json!({ "sonuc": "bulunamadi" })),
            Err(error) => return Err(error),
        };
        let sip = crud::find(c, &schema::SIPARIS, &b["siparisId"])?;
        let seans = crud::find(c, &schema::SEANS, &b["seansId"])?;
        let sonuc = if sip["durum"] == json!("iade") || sip["durum"] == json!("iptal") || !seans["iptal"].is_null() {
            "iptal"
        } else if b["kullanildi"] == json!(true) {
            "kullanilmis"
        } else {
            "gecerli"
        };
        if sonuc == "gecerli" && kullan {
            c.execute(&format!("UPDATE biletler SET kullanildi = 1, kullanimZamani = {NOW_SQL} WHERE kod = ?1"), [&kod])?;
            let kalan: i64 = c.query_row("SELECT COUNT(*) FROM biletler WHERE siparisId = ?1 AND kullanildi = 0", [b["siparisId"].as_str()], |r| r.get(0))?;
            if kalan == 0 {
                c.execute(&format!("UPDATE siparisler SET durum = 'kullanildi', kullanimZamani = {NOW_SQL} WHERE id = ?1"), [b["siparisId"].as_str()])?;
            }
            audit::record(c, Some(uid), "Bilet.use", "Bilet", &kod, None, None, None)?;
        }
        Ok(json!({ "sonuc": sonuc, "bilet": b, "koltuk": koltuk_adi(b["satir"].as_i64().unwrap_or(0), b["sutun"].as_i64().unwrap_or(0)), "seansBaslangic": seans["baslangic"] }))
    })
}

/// Sipariş iadesi (`Refund:Siparis`): koltuklar boşalır, büfe stoğu geri eklenir. Kullanılmış sipariş iade edilemez.
pub fn do_siparis_iade(app: &AppState, id: &str, neden: &str) -> AppResult<Value> {
    app.db.with(|c| {
        let uid = authorize(c, app.user(), "Refund:Siparis")?;
        if neden.trim().is_empty() {
            return Err(AppError::validation("neden", "İade nedeni zorunlu."));
        }
        let s = crud::find(c, &schema::SIPARIS, &json!(id))?;
        if s["durum"] != json!("odendi") {
            return Err(AppError::Conflict("Yalnız ödenmiş ve henüz kullanılmamış sipariş iade edilir.".into()));
        }
        let tx = c.unchecked_transaction()?;
        tx.execute("DELETE FROM koltuk_rezervasyonlari WHERE siparisId = ?1", [id])?;
        restore_concession_stock(&tx, &s["bufe"])?;
        let sonra = crud::update(&tx, &schema::SIPARIS, &json!(id), &json!({ "durum": "iade" }))?;
        tx.commit()?;
        audit::record(c, Some(uid), "Siparis.refund", "Siparis", id, Some(neden.trim()), Some(&s), Some(&sonra))?;
        Ok(sonra)
    })
}

/// Panel özeti: satılan bilet, ciro (bilet + büfe), seans doluluğu, en çok bilet satan filmler.
pub fn do_cineq_dashboard(app: &AppState, from: Option<&str>, to: Option<&str>) -> AppResult<Value> {
    app.db.with(|c| {
        authorize(c, app.user(), "ViewAny:Siparis")?;
        let (lo, hi) = (from.unwrap_or("0000"), to.unwrap_or("9999"));
        let (bilet, ciro): (i64, f64) = c.query_row(
            "SELECT (SELECT COUNT(*) FROM biletler b JOIN siparisler p ON p.id = b.siparisId WHERE p.durum IN ('odendi','kullanildi') AND p.olusturma >= ?1 AND p.olusturma <= ?2),
                    COALESCE((SELECT SUM(toplam) FROM siparisler WHERE durum IN ('odendi','kullanildi') AND olusturma >= ?1 AND olusturma <= ?2), 0)",
            params![lo, hi],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )?;
        let mut doluluk = Vec::new();
        {
            let mut st = c.prepare("SELECT s.id, s.baslangic, sa.harita, (SELECT COUNT(*) FROM koltuk_rezervasyonlari k WHERE k.seansId = s.id AND k.durum = 'dolu') FROM seanslar s JOIN salonlar sa ON sa.id = s.salonId WHERE s.iptal IS NULL AND s.baslangic >= ?1 AND s.baslangic <= ?2 ORDER BY s.baslangic")?;
            let rows = st.query_map(params![lo, hi], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?, r.get::<_, i64>(3)?)))?;
            for r in rows {
                let (id, b, h, dolu) = r?;
                let kap = kapasite(&serde_json::from_str(&h)?) as f64;
                doluluk.push(json!({ "seansId": id, "baslangic": b, "dolu": dolu, "yuzde": if kap == 0.0 { 0.0 } else { (dolu as f64 / kap * 1000.0).round() / 10.0 } }));
            }
        }
        let ort = if doluluk.is_empty() { 0.0 } else { doluluk.iter().map(|d| d["yuzde"].as_f64().unwrap_or(0.0)).sum::<f64>() / doluluk.len() as f64 };
        let filmler: Vec<Value> = {
            let mut st = c.prepare(
                "SELECT f.id, json_extract(f.ad, '$.tr'), COUNT(*) AS n FROM biletler b JOIN siparisler p ON p.id = b.siparisId JOIN seanslar s ON s.id = b.seansId JOIN filmler f ON f.id = s.filmId
                 WHERE p.durum IN ('odendi','kullanildi') AND p.olusturma >= ?1 AND p.olusturma <= ?2 GROUP BY f.id ORDER BY n DESC LIMIT 5",
            )?;
            let rows = st.query_map(params![lo, hi], |r| Ok(json!({ "filmId": r.get::<_, i64>(0)?, "ad": r.get::<_, Option<String>>(1)?, "bilet": r.get::<_, i64>(2)? })))?;
            rows.collect::<Result<Vec<_>, _>>()?
        };
        Ok(json!({ "bilet": bilet, "ciro": ciro, "ortalamaDoluluk": ort, "seansDoluluk": doluluk, "enCokIzlenen": filmler }))
    })
}

/// Public storefront data excludes private customer/order fields and needs no admin CRUD permission.
pub fn do_vitrin_katalog(app: &AppState) -> AppResult<Value> {
    app.db.with(|c| {
        let mut filmler = Vec::new();
        {
            let mut st = c.prepare(
                "SELECT f.id, f.ad, f.afis, f.gradyan, f.sinopsis, f.yonetmen, f.oyuncular, f.sureDk, f.turler, f.imdb, f.yasSiniri, f.durum
                 FROM filmler f
                 WHERE f.durum IN ('vizyonda', 'yakinda')
                 ORDER BY f.id DESC",
            )?;
            let rows = st.query_map([], |r| {
                Ok((
                    r.get::<_, i64>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, Option<String>>(2)?,
                    r.get::<_, Option<String>>(3)?,
                    r.get::<_, Option<String>>(4)?,
                    r.get::<_, Option<String>>(5)?,
                    r.get::<_, Option<String>>(6)?,
                    r.get::<_, i64>(7)?,
                    r.get::<_, Option<String>>(8)?,
                    r.get::<_, Option<f64>>(9)?,
                    r.get::<_, Option<i64>>(10)?,
                    r.get::<_, String>(11)?,
                ))
            })?;
            for row in rows {
                let (id, ad, afis, gradyan, sinopsis, yonetmen, oyuncular, sure, turler, imdb, yas, durum) = row?;
                filmler.push(json!({
                    "id": id,
                    "ad": serde_json::from_str::<Value>(&ad)?,
                    "afis": afis,
                    "gradyan": gradyan.unwrap_or_default(),
                    "sinopsis": sinopsis.unwrap_or_default(),
                    "yonetmen": yonetmen.unwrap_or_default(),
                    "oyuncular": oyuncular.map(|value| serde_json::from_str::<Value>(&value)).transpose()?.unwrap_or(json!([])),
                    "sureDk": sure,
                    "turler": turler.map(|value| serde_json::from_str::<Value>(&value)).transpose()?.unwrap_or(json!([])),
                    "imdb": imdb,
                    "yasSiniri": yas.unwrap_or(0),
                    "durum": durum,
                    "seanslar": [],
                }));
            }
        }

        let mut film_index = std::collections::HashMap::new();
        for (index, film) in filmler.iter().enumerate() {
            film_index.insert(film["id"].as_i64().unwrap_or_default(), index);
        }
        {
            let mut st = c.prepare(
                "SELECT s.id, s.filmId, s.salonId, s.baslangic, s.dil, s.altyazi, s.fiyat,
                        sa.numara, sa.ad, sa.tip, sa.harita, si.ad, si.sehir,
                        COALESCE((
                            SELECT json_group_array(json_object('satir', occupied.satir, 'sutun', occupied.sutun))
                            FROM (
                                SELECT k.satir, k.sutun
                                FROM koltuk_rezervasyonlari k
                                WHERE k.seansId = s.id AND k.durum = 'secili'
                                  AND k.tutmaBitis > strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
                                UNION
                                SELECT b.satir, b.sutun
                                FROM biletler b JOIN siparisler p ON p.id = b.siparisId
                                WHERE b.seansId = s.id AND p.durum IN ('odendi', 'kullanildi')
                            ) occupied
                        ), '[]')
                 FROM seanslar s
                 JOIN salonlar sa ON sa.id = s.salonId
                 JOIN sinemalar si ON si.id = sa.sinemaId
                 WHERE s.iptal IS NULL AND sa.durum = 'yayinda'
                   AND s.baslangic >= strftime('%Y-%m-%dT%H:%M', 'now', 'localtime')
                 ORDER BY s.baslangic",
            )?;
            let rows = st.query_map([], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, i64>(1)?,
                    r.get::<_, String>(2)?,
                    r.get::<_, String>(3)?,
                    r.get::<_, Option<String>>(4)?,
                    r.get::<_, Option<String>>(5)?,
                    r.get::<_, String>(6)?,
                    r.get::<_, i64>(7)?,
                    r.get::<_, String>(8)?,
                    r.get::<_, Option<String>>(9)?,
                    r.get::<_, String>(10)?,
                    r.get::<_, String>(11)?,
                    r.get::<_, String>(12)?,
                    r.get::<_, String>(13)?,
                ))
            })?;
            for row in rows {
                let (id, film_id, salon_id, baslangic, dil, altyazi, fiyat, numara, ad, tip, harita, sinema_adi, sehir, dolu_koltuklar) = row?;
                let Some(index) = film_index.get(&film_id).copied() else { continue };
                filmler[index]["seanslar"].as_array_mut().expect("seanslar dizi olarak başlatıldı").push(json!({
                    "id": id,
                    "salonId": salon_id,
                    "baslangic": baslangic,
                    "dil": dil.unwrap_or_else(|| "tr".into()),
                    "altyazi": altyazi,
                    "fiyat": serde_json::from_str::<Value>(&fiyat)?,
                    "salon": {
                        "id": salon_id,
                        "numara": numara,
                        "ad": ad,
                        "tip": tip.unwrap_or_else(|| "2D".into()),
                        "harita": serde_json::from_str::<Value>(&harita)?,
                        "sinema": sinema_adi,
                        "sehir": sehir,
                    },
                    "doluKoltuklar": serde_json::from_str::<Value>(&dolu_koltuklar)?,
                }));
            }
        }
        let bufe = {
            let mut statement = c.prepare(
                "SELECT id, ad, kategori, boyut, fiyat, stok
                 FROM bufe_urunleri WHERE aktif = 1
                 ORDER BY kategori, id",
            )?;
            let rows = statement.query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, Option<String>>(3)?,
                    row.get::<_, f64>(4)?,
                    row.get::<_, i64>(5)?,
                ))
            })?;
            let mut products = Vec::new();
            for row in rows {
                let (id, name, category, size, price, stock) = row?;
                products.push(json!({
                    "id": id,
                    "ad": serde_json::from_str::<Value>(&name)?,
                    "kategori": category,
                    "boyut": size,
                    "fiyat": price,
                    "stok": stock,
                }));
            }
            products
        };
        let menuler = {
            let mut statement = c.prepare(
                "SELECT id, ad, icerik, fiyat FROM bufe_menuleri WHERE aktif = 1 AND durum = 'aktif' ORDER BY ad",
            )?;
            let rows = statement.query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, f64>(3)?,
                ))
            })?;
            let mut menus = Vec::new();
            for row in rows {
                let (id, name, contents, price) = row?;
                menus.push(json!({
                    "id": id,
                    "ad": name,
                    "icerik": serde_json::from_str::<Value>(&contents)?,
                    "fiyat": price,
                }));
            }
            menus
        };
        Ok(json!({ "films": filmler, "bufe": bufe, "menuler": menuler }))
    })
}

// ───────────────────────── Tauri komutları ─────────────────────────

#[tauri::command]
pub fn seans_olustur(state: State<'_, AppState>, girdi: Value) -> AppResult<Value> {
    do_seans_olustur(&state, &girdi)
}
#[tauri::command]
pub fn seans_guncelle(state: State<'_, AppState>, id: String, girdi: Value) -> AppResult<Value> {
    do_seans_guncelle(&state, &id, &girdi)
}
#[tauri::command]
pub fn seans_iptal(state: State<'_, AppState>, id: String, neden: String, otomatik_iade: Option<bool>) -> AppResult<Value> {
    do_seans_iptal(&state, &id, &neden, otomatik_iade.unwrap_or(false))
}
#[tauri::command]
pub fn salon_yayinla(state: State<'_, AppState>, id: String) -> AppResult<Value> {
    do_salon_yayinla(&state, &id)
}
#[tauri::command]
pub fn koltuk_sec(state: State<'_, AppState>, seans_id: String, koltuklar: Value) -> AppResult<Value> {
    do_koltuk_sec(&state, &seans_id, &koltuklar)
}
#[tauri::command]
pub fn bilet_siparisi_olustur(state: State<'_, AppState>, girdi: Value) -> AppResult<Value> {
    do_siparis_olustur(&state, &girdi)
}
#[tauri::command]
pub fn misafir_siparis_olustur(state: State<'_, AppState>, girdi: Value) -> AppResult<Value> {
    do_misafir_siparis_olustur(&state, &girdi)
}
#[tauri::command]
pub fn misafir_biletlerim(state: State<'_, AppState>) -> AppResult<Vec<Value>> {
    do_misafir_biletlerim(&state)
}
#[tauri::command]
pub fn misafir_siparis_iptal(state: State<'_, AppState>, order_id: String) -> AppResult<Value> {
    do_misafir_siparis_iptal(&state, &order_id)
}
#[tauri::command]
pub fn bilet_dogrula(state: State<'_, AppState>, kod: String, kullan: Option<bool>) -> AppResult<Value> {
    do_bilet_dogrula(&state, &kod, kullan.unwrap_or(false))
}
#[tauri::command]
pub fn siparis_iade(state: State<'_, AppState>, id: String, neden: String) -> AppResult<Value> {
    do_siparis_iade(&state, &id, &neden)
}
#[tauri::command]
pub fn cineq_dashboard(state: State<'_, AppState>, from: Option<String>, to: Option<String>) -> AppResult<Value> {
    do_cineq_dashboard(&state, from.as_deref(), to.as_deref())
}
#[tauri::command]
pub fn vitrin_katalog(state: State<'_, AppState>) -> AppResult<Value> {
    do_vitrin_katalog(&state)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::backend::boot_memory;
    use crate::backend::controllers as c;

    fn harita() -> Value {
        json!({ "satir": 10, "sutun": 14, "koridorSutunlari": [6], "vipSatirlari": [8, 9], "kullanilamaz": [{ "satir": 0, "sutun": 0 }, { "satir": 0, "sutun": 13 }] })
    }

    #[test]
    fn harita_ve_pnr() {
        assert_eq!(kapasite(&harita()), 128); // 10×13 − 2
        assert_eq!(koltuk_kategorisi(&harita(), 9), "vip");
        assert_eq!(koltuk_kategorisi(&harita(), 0), "standart");
        assert_eq!(koltuk_adi(1, 6), "B7");
        let k = pnr_uret(3, "2026-10-18T21:30");
        assert!(k.starts_with("CNQ-S3-2130-"), "{k}");
        assert!(pnr_gecerli_mi(&k));
        assert!(pnr_gecerli_mi("CNQ-SALON3-2130-04511E"));
        assert!(!pnr_gecerli_mi("CNQ-S3-2560-7F4K2Q"));
        assert!(!pnr_gecerli_mi("CNQ-S3-2130-7F4K"));
        assert!(pnr_gecerli_mi("CNQ-S3-2130-7F4K2Q"));
        assert!(harita_dogrula(&harita()).is_ok());
        assert!(harita_dogrula(&json!({ "satir": 0, "sutun": 5, "koridorSutunlari": [], "vipSatirlari": [], "kullanilamaz": [] })).is_err());
        assert_eq!(dakika("1970-01-02T00:00"), Some(1440));
        assert!(dakika("2026-13-01T00:00").is_none());
    }

    #[test]
    fn seans_siparis_ve_kapi() {
        let app = boot_memory().unwrap();
        assert!(c::auth_owner_setup_required(&app).unwrap());
        c::auth_owner_set_initial_password(&app, "gizli-parola-1").unwrap();
        assert_eq!(c::auth_session_index(&app).unwrap().len(), 1);
        c::crud_store(&app, "Sinema", &json!({ "id": "s1", "ad": "Örnek Sinema", "sehir": "İstanbul" })).unwrap();
        c::crud_store(&app, "Salon", &json!({ "id": "salon-3", "sinemaId": "s1", "numara": 3, "ad": "Salon 3", "tip": "2D", "harita": harita() })).unwrap();
        let film = c::crud_store(&app, "Film", &json!({ "ad": { "tr": "Örnek Film" }, "sureDk": 120 })).unwrap();
        let sans = json!({ "filmId": film["id"], "salonId": "salon-3", "baslangic": "2099-10-18T21:30", "fiyat": { "standart": 220, "vip": 340 } });
        assert_eq!(do_seans_olustur(&app, &sans).unwrap_err().code(), "conflict"); // salon taslak
        do_salon_yayinla(&app, "salon-3").unwrap();
        let s = do_seans_olustur(&app, &sans).unwrap();
        let sid = s["id"].as_str().unwrap().to_string();
        let yeni_film = c::crud_store(&app, "Film", &json!({ "ad": { "tr": "Seanssız Vitrin Filmi" }, "sureDk": 90 })).unwrap();
        let vitrin = do_vitrin_katalog(&app).unwrap();
        let vitrindeki_film = vitrin["films"].as_array().unwrap().iter()
            .find(|listed| listed["id"] == film["id"]).unwrap();
        assert_eq!(vitrindeki_film["seanslar"][0]["salon"]["harita"]["satir"], json!(10));
        let seanssiz_film = vitrin["films"].as_array().unwrap().iter()
            .find(|listed| listed["id"] == yeni_film["id"]).unwrap();
        assert_eq!(seanssiz_film["seanslar"], json!([]));
        // çakışma: film 120 dk + 15 temizlik → 23:45'e kadar dolu
        let cakisan = json!({ "filmId": film["id"], "salonId": "salon-3", "baslangic": "2099-10-18T23:00", "fiyat": { "standart": 220, "vip": 340 } });
        assert_eq!(do_seans_olustur(&app, &cakisan).unwrap_err().code(), "conflict");
        let sonra = json!({ "filmId": film["id"], "salonId": "salon-3", "baslangic": "2099-10-19T00:00", "fiyat": { "standart": 220, "vip": 340 } });
        assert!(do_seans_olustur(&app, &sonra).is_ok());
        // büfe
        c::crud_store(&app, "BufeUrunu", &json!({ "id": "b1", "ad": { "tr": "Mısır" }, "kategori": "misir", "fiyat": 120, "stok": 5 })).unwrap();
        // müşteri: koltuk, sipariş
        c::auth_logout(&app).unwrap();
        c::auth_register(&app, "Müşteri", "m@ornek.com", "gizli-parola-2").unwrap();
        let koltuklar = json!([{ "satir": 1, "sutun": 1 }, { "satir": 9, "sutun": 2 }]);
        assert_eq!(do_siparis_olustur(&app, &json!({ "seansId": sid, "koltuklar": [{ "satir": 0, "sutun": 0 }] })).unwrap_err().code(), "validation"); // kullanılamaz koltuk
        let sip = do_siparis_olustur(&app, &json!({ "seansId": sid, "koltuklar": koltuklar, "bufe": [{ "urunId": "b1", "adet": 2 }] })).unwrap();
        assert_eq!(sip["toplam"], json!(220.0 + 340.0 + 240.0));
        let kod = sip["biletler"][0]["kod"].as_str().unwrap().to_string();
        assert!(pnr_gecerli_mi(&kod));
        // aynı koltuk tekrar satılmaz
        assert_eq!(do_siparis_olustur(&app, &json!({ "seansId": sid, "koltuklar": [{ "satir": 1, "sutun": 1 }] })).unwrap_err().code(), "conflict");
        // stok yetersiz
        assert!(do_siparis_olustur(&app, &json!({ "seansId": sid, "koltuklar": [{ "satir": 2, "sutun": 2 }], "bufe": [{ "urunId": "b1", "adet": 4 }] })).is_err());
        let dolu: i64 = app.db.with(|cn| Ok(cn.query_row("SELECT COUNT(*) FROM koltuk_rezervasyonlari WHERE durum = 'dolu'", [], |r| r.get(0))?)).unwrap();
        assert_eq!(dolu, 2);
        let stok: i64 = app.db.with(|cn| Ok(cn.query_row("SELECT stok FROM bufe_urunleri WHERE id = 'b1'", [], |r| r.get(0))?)).unwrap();
        assert_eq!(stok, 3); // başarısız sipariş stoğu düşürmedi (işlem geri alındı)
        // kapı: izinsiz
        assert_eq!(do_bilet_dogrula(&app, &kod, true).unwrap_err().code(), "forbidden");
        c::auth_logout(&app).unwrap();
        c::auth_login(&app, "harunekici@gmail.com", "gizli-parola-1").unwrap();
        assert_eq!(do_bilet_dogrula(&app, "yanlis", false).unwrap()["sonuc"], json!("bicim-hatali"));
        assert_eq!(do_bilet_dogrula(&app, "CNQ-S3-2130-AAAAAA", false).unwrap()["sonuc"], json!("bulunamadi"));
        assert_eq!(do_bilet_dogrula(&app, &kod, true).unwrap()["sonuc"], json!("gecerli"));
        assert_eq!(do_bilet_dogrula(&app, &kod, true).unwrap()["sonuc"], json!("kullanilmis"));
        // kullanılmış sipariş iade edilmez; ikinci bilet kullanılınca sipariş "kullanildi"
        let kod2 = sip["biletler"][1]["kod"].as_str().unwrap().to_string();
        do_bilet_dogrula(&app, &kod2, true).unwrap();
        assert_eq!(c::crud_show(&app, "Siparis", &sip["id"]).unwrap()["durum"], json!("kullanildi"));
        assert_eq!(do_siparis_iade(&app, sip["id"].as_str().unwrap(), "x").unwrap_err().code(), "conflict");
        // seans iptali satılmış bilet için onay ister
        assert_eq!(do_seans_iptal(&app, &sid, "teknik arıza", false).unwrap_err().code(), "conflict");
        assert!(do_seans_iptal(&app, &sid, "teknik arıza", true).is_ok());
        let d = do_cineq_dashboard(&app, None, None).unwrap();
        assert_eq!(d["bilet"], json!(0)); // sipariş iade oldu (seans iptali)
    }

    #[test]
    fn guest_checkout_persists_tickets_and_releases_canceled_seats() {
        let app = boot_memory().unwrap();
        c::auth_owner_set_initial_password(&app, "owner-parola-123").unwrap();
        c::crud_store(&app, "Sinema", &json!({ "id": "guest-cinema", "ad": "CineQ Merkez", "sehir": "İstanbul" })).unwrap();
        c::crud_store(&app, "Salon", &json!({
            "id": "guest-hall", "sinemaId": "guest-cinema", "numara": 1, "ad": "Salon S1",
            "tip": "2D", "harita": harita()
        })).unwrap();
        do_salon_yayinla(&app, "guest-hall").unwrap();
        let film = c::crud_store(&app, "Film", &json!({ "ad": { "tr": "Misafir Filmi" }, "sureDk": 100 })).unwrap();
        let session = do_seans_olustur(&app, &json!({
            "filmId": film["id"],
            "salonId": "guest-hall",
            "baslangic": "2099-10-18T21:30",
            "fiyat": { "tam": 200, "ogrenci": 150, "vip": 300 }
        })).unwrap();
        c::crud_store(&app, "BufeUrunu", &json!({
            "id": "guest-popcorn", "ad": { "tr": "Mısır" }, "kategori": "misir",
            "boyut": "Orta", "fiyat": 20, "stok": 5, "aktif": true
        })).unwrap();
        c::crud_store(&app, "BufeMenusu", &json!({
            "id": "guest-menu", "ad": "İkili Mısır", "icerik": [{ "urunId": "guest-popcorn", "adet": 2 }],
            "fiyat": 35, "aktif": true, "durum": "aktif"
        })).unwrap();

        let order = do_misafir_siparis_olustur(&app, &json!({
            "rezervasyonlar": [{
                "seansId": session["id"],
                "koltuklar": [{ "satir": 1, "sutun": 1, "biletTuru": "ogrenci" }]
            }],
            "bufe": [{ "urunId": "guest-popcorn", "adet": 2 }],
            "indirimKodu": "CINEQ10"
        })).unwrap();
        assert_eq!(order["durum"], json!("odendi"));
        assert_eq!(order["toplam"], json!(171.0));

        let ticket_code = order["biletler"][0]["kod"].as_str().unwrap();
        let tickets = do_misafir_biletlerim(&app).unwrap();
        assert_eq!(tickets.len(), 1);
        assert_eq!(tickets[0]["biletTuru"], json!("ogrenci"));
        assert_eq!(tickets[0]["film"], json!("Misafir Filmi"));
        let catalog = do_vitrin_katalog(&app).unwrap();
        assert_eq!(catalog["films"][0]["seanslar"][0]["doluKoltuklar"], json!([{"satir": 1, "sutun": 1}]));
        assert_eq!(catalog["bufe"][0]["fiyat"], json!(20.0));
        assert_eq!(catalog["menuler"][0]["id"], json!("guest-menu"));

        c::auth_login(&app, "harunekici@gmail.com", "owner-parola-123").unwrap();
        assert_eq!(do_bilet_dogrula(&app, ticket_code, true).unwrap()["sonuc"], json!("gecerli"));
        assert!(matches!(
            do_misafir_siparis_iptal(&app, order["id"].as_str().unwrap()),
            Err(AppError::Conflict(_))
        ));

        let cancel_order = do_misafir_siparis_olustur(&app, &json!({
            "seansId": session["id"],
            "koltuklar": [{ "satir": 2, "sutun": 1 }],
            "bufe": [{ "urunId": "guest-popcorn", "adet": 1 }]
        })).unwrap();
        c::auth_logout(&app).unwrap();
        let canceled = do_misafir_siparis_iptal(&app, cancel_order["id"].as_str().unwrap()).unwrap();
        assert_eq!(canceled["durum"], json!("iptal"));
        let stock: i64 = app.db.with(|conn| Ok(conn.query_row(
            "SELECT stok FROM bufe_urunleri WHERE id = 'guest-popcorn'",
            [],
            |row| row.get(0),
        )?)).unwrap();
        assert_eq!(stock, 3);

        let menu_order = do_misafir_siparis_olustur(&app, &json!({
            "seansId": session["id"],
            "koltuklar": [{ "satir": 3, "sutun": 1 }],
            "bufe": [{ "menuId": "guest-menu", "adet": 1 }]
        })).unwrap();
        let stock_after_menu_sale: i64 = app.db.with(|conn| Ok(conn.query_row(
            "SELECT stok FROM bufe_urunleri WHERE id = 'guest-popcorn'",
            [],
            |row| row.get(0),
        )?)).unwrap();
        assert_eq!(stock_after_menu_sale, 1);
        do_misafir_siparis_iptal(&app, menu_order["id"].as_str().unwrap()).unwrap();
        let stock_after_menu_cancel: i64 = app.db.with(|conn| Ok(conn.query_row(
            "SELECT stok FROM bufe_urunleri WHERE id = 'guest-popcorn'",
            [],
            |row| row.get(0),
        )?)).unwrap();
        assert_eq!(stock_after_menu_cancel, 3);
    }
}

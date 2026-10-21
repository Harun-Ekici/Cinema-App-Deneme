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
        && p[1].len() >= 2 && p[1].len() <= 3 && p[1].starts_with('S') && p[1][1..].chars().all(|c| c.is_ascii_digit())
        && p[2].len() == 4 && p[2].chars().all(|c| c.is_ascii_digit())
        && p[3].len() == 6 && p[3].bytes().all(|b| ALFA.contains(&b))
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

/// Seans oluştur (`Create:Seans`): film ve yayınlanmış salon var olmalı, salonda çakışma olmamalı.
/// `girdi`: `{ filmId, salonId, baslangic, dil?, altyazi?, fiyat: { standart, vip } }`
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
        let fiyat = &girdi["fiyat"];
        if fiyat["standart"].as_f64().unwrap_or(-1.0) < 0.0 || fiyat["vip"].as_f64().unwrap_or(-1.0) < 0.0 {
            return Err(AppError::validation("fiyat", "Standart ve VIP fiyatı 0 ya da büyük olmalı."));
        }
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

/// Bilet + büfe siparişi (tek işlemde). `girdi`: `{ seansId, koltuklar: [{satir,sutun}], bufe?: [{ urunId | menuId, adet }] }`
/// Koltuklar boş ya da (süresi dolmuş) tutulmuş olmalı; ödeme bu sürümde simüle edilir (sipariş doğrudan "odendi").
pub fn do_siparis_olustur(app: &AppState, girdi: &Value) -> AppResult<Value> {
    let uid = app.user().ok_or(AppError::Unauthenticated)?;
    let seans_id = girdi.get("seansId").and_then(Value::as_str).ok_or_else(|| AppError::validation("seansId", "Seans seçilmeli."))?.to_string();
    let secim = koltuklar_oku(girdi.get("koltuklar").unwrap_or(&Value::Null))?;
    app.db.with(|c| {
        let (seans, salon, _) = seans_hazirla(c, &seans_id)?;
        if dakika(seans["baslangic"].as_str().unwrap_or("")).map(|b| b < dakika(&now_iso(c).unwrap_or_default()[..16]).unwrap_or(0)).unwrap_or(false) {
            return Err(AppError::Conflict("Başlamış seansa bilet satılamaz.".into()));
        }
        let uygun = kullanilabilir_koltuklar(&salon["harita"]);
        let no = salon["numara"].as_i64().unwrap_or(0);
        let baslangic = seans["baslangic"].as_str().unwrap_or("").to_string();
        suresi_dolan_tutmalari_sil(c)?;
        let tx = c.unchecked_transaction()?;
        let sip_id = new_id();
        // Büfe kalemleri (stok düşülür)
        let mut bufe_kalemleri = Vec::new();
        let mut bufe_toplam = 0.0;
        for k in girdi.get("bufe").and_then(Value::as_array).cloned().unwrap_or_default() {
            let adet = k.get("adet").and_then(Value::as_i64).filter(|a| (1..=20).contains(a)).ok_or_else(|| AppError::validation("bufe", "Adet 1–20 olmalı."))?;
            if let Some(uid_) = k.get("urunId").and_then(Value::as_str) {
                let (fiyat, stok, aktif): (f64, i64, bool) = tx
                    .query_row("SELECT fiyat, stok, aktif FROM bufe_urunleri WHERE id = ?1", [uid_], |r| Ok((r.get(0)?, r.get(1)?, r.get::<_, i64>(2)? != 0)))
                    .optional()?
                    .ok_or_else(|| AppError::validation("bufe", "Büfe ürünü bulunamadı."))?;
                if !aktif || stok < adet {
                    return Err(AppError::Conflict(format!("`{uid_}` yeterli stokta değil.")));
                }
                tx.execute("UPDATE bufe_urunleri SET stok = stok - ?2 WHERE id = ?1", params![uid_, adet])?;
                bufe_toplam += fiyat * adet as f64;
                bufe_kalemleri.push(json!({ "urunId": uid_, "adet": adet, "birimFiyat": fiyat }));
            } else if let Some(mid) = k.get("menuId").and_then(Value::as_str) {
                let (fiyat, aktif): (f64, bool) = tx
                    .query_row("SELECT fiyat, aktif FROM bufe_menuleri WHERE id = ?1", [mid], |r| Ok((r.get(0)?, r.get::<_, i64>(1)? != 0)))
                    .optional()?
                    .ok_or_else(|| AppError::validation("bufe", "Büfe menüsü bulunamadı."))?;
                if !aktif {
                    return Err(AppError::Conflict(format!("`{mid}` menüsü kapalı.")));
                }
                bufe_toplam += fiyat * adet as f64;
                bufe_kalemleri.push(json!({ "menuId": mid, "adet": adet, "birimFiyat": fiyat }));
            } else {
                return Err(AppError::validation("bufe", "Kalemde urunId ya da menuId olmalı."));
            }
        }
        // Siparişi önce yaz (koltuk ve bilet satırları ona bağlanır)
        let ad_eposta: (String, String) = tx.query_row("SELECT name, email FROM users WHERE id = ?1", [uid], |r| Ok((r.get(0)?, r.get(1)?)))?;
        tx.execute("INSERT OR IGNORE INTO musteriler (id, ad, eposta) VALUES (?1, ?2, ?3)", params![musteri_kimligi(uid), ad_eposta.0, ad_eposta.1])?;
        tx.execute("INSERT INTO siparisler (id, musteriId, biletler, bufe, toplam, durum) VALUES (?1, ?2, '[]', ?3, 0, 'odendi')", params![sip_id, musteri_kimligi(uid), json!(bufe_kalemleri).to_string()])?;
        let mut biletler = Vec::new();
        let mut bilet_toplam = 0.0;
        for (r, s) in &secim {
            if !uygun.contains(&(*r, *s)) {
                return Err(AppError::validation("koltuklar", &format!("{} satışa açık değil.", koltuk_adi(*r, *s))));
            }
            let kat = koltuk_kategorisi(&salon["harita"], *r);
            let fiyat = seans["fiyat"][kat].as_f64().unwrap_or(0.0);
            tx.execute(
                "INSERT INTO koltuk_rezervasyonlari (seansId, satir, sutun, durum, siparisId) VALUES (?1, ?2, ?3, 'dolu', ?4)",
                params![seans_id, r, s, sip_id],
            )
            .map_err(|_| AppError::Conflict(format!("{} dolu ya da başkası tarafından tutuluyor.", koltuk_adi(*r, *s))))?;
            let kod = pnr_uret(no, &baslangic);
            tx.execute(
                "INSERT INTO biletler (kod, siparisId, seansId, satir, sutun, kategori, fiyat) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![kod, sip_id, seans_id, r, s, kat, fiyat],
            )?;
            bilet_toplam += fiyat;
            biletler.push(json!({ "kod": kod, "seansId": seans_id, "satir": r, "sutun": s, "kategori": kat, "fiyat": fiyat }));
        }
        tx.execute("UPDATE siparisler SET biletler = ?2, toplam = ?3 WHERE id = ?1", params![sip_id, json!(biletler).to_string(), bilet_toplam + bufe_toplam])?;
        tx.execute("UPDATE musteriler SET siparisSayisi = siparisSayisi + 1 WHERE id = ?1", [musteri_kimligi(uid)])?;
        tx.commit()?;
        let s = crud::find(c, &schema::SIPARIS, &json!(sip_id))?;
        audit::record(c, Some(uid), "Siparis.create", "Siparis", &sip_id, None, None, Some(&s))?;
        Ok(s)
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
        let Some(b) = crud::find(c, &schema::BILET, &json!(kod)).ok() else {
            return Ok(json!({ "sonuc": "bulunamadi" }));
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
        for k in s["bufe"].as_array().cloned().unwrap_or_default() {
            if let Some(u) = k["urunId"].as_str() {
                tx.execute("UPDATE bufe_urunleri SET stok = stok + ?2 WHERE id = ?1", params![u, k["adet"].as_i64().unwrap_or(0)])?;
            }
        }
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

// ───────────────────────── Tauri komutları ─────────────────────────

#[tauri::command]
pub fn seans_olustur(state: State<'_, AppState>, girdi: Value) -> AppResult<Value> {
    do_seans_olustur(&state, &girdi)
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
        assert!(!pnr_gecerli_mi("CNQ-S3-2130-7F4K2I")); // I alfabede yok
        assert!(pnr_gecerli_mi("CNQ-S3-2130-7F4K2Q"));
        assert!(harita_dogrula(&harita()).is_ok());
        assert!(harita_dogrula(&json!({ "satir": 0, "sutun": 5, "koridorSutunlari": [], "vipSatirlari": [], "kullanilamaz": [] })).is_err());
        assert_eq!(dakika("1970-01-02T00:00"), Some(1440));
        assert!(dakika("2026-13-01T00:00").is_none());
    }

    #[test]
    fn seans_siparis_ve_kapi() {
        let app = boot_memory().unwrap();
        c::auth_register(&app, "Yönetici", "y@ornek.com", "gizli-parola-1").unwrap();
        c::crud_store(&app, "Sinema", &json!({ "id": "s1", "ad": "Örnek Sinema", "sehir": "İstanbul" })).unwrap();
        c::crud_store(&app, "Salon", &json!({ "id": "salon-3", "sinemaId": "s1", "numara": 3, "ad": "Salon 3", "tip": "2D", "harita": harita() })).unwrap();
        let film = c::crud_store(&app, "Film", &json!({ "ad": { "tr": "Örnek Film" }, "sureDk": 120 })).unwrap();
        let sans = json!({ "filmId": film["id"], "salonId": "salon-3", "baslangic": "2099-10-18T21:30", "fiyat": { "standart": 220, "vip": 340 } });
        assert_eq!(do_seans_olustur(&app, &sans).unwrap_err().code(), "conflict"); // salon taslak
        do_salon_yayinla(&app, "salon-3").unwrap();
        let s = do_seans_olustur(&app, &sans).unwrap();
        let sid = s["id"].as_str().unwrap().to_string();
        // çakışma: film 120 dk + 15 temizlik → 23:45'e kadar dolu
        let cakisan = json!({ "filmId": film["id"], "salonId": "salon-3", "baslangic": "2099-10-18T23:00", "fiyat": { "standart": 220, "vip": 340 } });
        assert_eq!(do_seans_olustur(&app, &cakisan).unwrap_err().code(), "conflict");
        let sonra = json!({ "filmId": film["id"], "salonId": "salon-3", "baslangic": "2099-10-19T00:00", "fiyat": { "standart": 220, "vip": 340 } });
        assert!(do_seans_olustur(&app, &sonra).is_ok());
        // büfe
        c::crud_store(&app, "BufeUrunu", &json!({ "id": "b1", "ad": { "tr": "Mısır" }, "kategori": "misir", "fiyat": 120, "stok": 5 })).unwrap();
        // müşteri: koltuk, sipariş
        c::auth_logout(&app);
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
        c::auth_logout(&app);
        c::auth_login(&app, "y@ornek.com", "gizli-parola-1").unwrap();
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
}

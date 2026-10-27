use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BiletGirdisi {
    film_adi: String,
    salon: String,
    seans: String,
    adet: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BiletSonucu {
    pnr_kodu: String,
    film_adi: String,
    salon: String,
    seans: String,
    adet: i32,
    dogrulama_ozeti: String,
}

#[derive(Debug, Serialize)]
#[serde(tag = "kod", rename_all = "snake_case")]
enum BiletHatasi {
    FilmAdiBos,
    SalonGecersiz,
    SeansGecersiz,
    BiletAdediGecersiz,
    SistemSaatiGecersiz,
}

#[tauri::command]
fn bilet_hesapla(girdi: BiletGirdisi) -> Result<BiletSonucu, BiletHatasi> {
    let film_adi = girdi.film_adi.trim();
    if film_adi.is_empty() {
        return Err(BiletHatasi::FilmAdiBos);
    }

    let salon = girdi.salon.trim();
    let salon_kodu: String = salon
        .chars()
        .filter(|karakter| karakter.is_ascii_alphanumeric())
        .map(|karakter| karakter.to_ascii_uppercase())
        .collect();
    if salon_kodu.is_empty() {
        return Err(BiletHatasi::SalonGecersiz);
    }

    let Some((saat, dakika)) = girdi.seans.split_once(':') else {
        return Err(BiletHatasi::SeansGecersiz);
    };
    let Ok(saat_sayi) = saat.parse::<u8>() else {
        return Err(BiletHatasi::SeansGecersiz);
    };
    let Ok(dakika_sayi) = dakika.parse::<u8>() else {
        return Err(BiletHatasi::SeansGecersiz);
    };
    if saat.len() != 2 || dakika.len() != 2 || saat_sayi > 23 || dakika_sayi > 59 {
        return Err(BiletHatasi::SeansGecersiz);
    }

    if girdi.adet <= 0 {
        return Err(BiletHatasi::BiletAdediGecersiz);
    }

    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| BiletHatasi::SistemSaatiGecersiz)?
        .as_nanos();
    let pnr_kodu = format!(
        "CNQ-{salon_kodu}-{saat}{dakika}-{:06X}",
        nanos % 0xFF_FFFF
    );
    let dogrulama_ozeti = format!(
        "Bilet doğrulama hazır: {film_adi} · {}:{dakika} · {} bilet.",
        saat, girdi.adet
    );

    Ok(BiletSonucu {
        pnr_kodu,
        film_adi: film_adi.to_string(),
        salon: salon.to_string(),
        seans: girdi.seans,
        adet: girdi.adet,
        dogrulama_ozeti,
    })
}

mod backend;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| backend::commands::setup(app))
        .invoke_handler(tauri::generate_handler![
            bilet_hesapla,
            backend::commands::auth_register,
            backend::commands::auth_login,
            backend::commands::auth_logout,
            backend::commands::auth_me,
            backend::commands::auth_owner_setup_required,
            backend::commands::auth_owner_set_initial_password,
            backend::commands::auth_session_index,
            backend::commands::user_index,
            backend::commands::user_store,
            backend::commands::user_sync_roles,
            backend::commands::user_sync_permissions,
            backend::commands::user_set_status,
            backend::commands::role_index,
            backend::commands::role_store,
            backend::commands::role_update,
            backend::commands::role_destroy,
            backend::commands::role_sync_permissions,
            backend::commands::permission_index,
            backend::commands::permission_generate,
            backend::commands::crud_resources,
            backend::commands::crud_index,
            backend::commands::crud_show,
            backend::commands::crud_store,
            backend::commands::crud_update,
            backend::commands::crud_destroy,
            backend::commands::crud_destroy_many,
            backend::commands::crud_aggregate,
            backend::commands::db_migrate_status,
            backend::commands::contact_submit,
            backend::domain::seans_olustur,
            backend::domain::seans_guncelle,
            backend::domain::seans_iptal,
            backend::domain::salon_yayinla,
            backend::domain::koltuk_sec,
            backend::domain::bilet_siparisi_olustur,
            backend::domain::misafir_siparis_olustur,
            backend::domain::misafir_biletlerim,
            backend::domain::misafir_siparis_iptal,
            backend::domain::bilet_dogrula,
            backend::domain::siparis_iade,
            backend::domain::cineq_dashboard,
            backend::domain::vitrin_katalog
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::{bilet_hesapla, BiletGirdisi, BiletHatasi};

    #[test]
    fn gecerli_girdi_tipli_bilet_sonucu_dondurur() {
        let sonuc = bilet_hesapla(BiletGirdisi {
            film_adi: "Yildizlar Arasi".to_string(),
            salon: "Salon 3".to_string(),
            seans: "21:30".to_string(),
            adet: 2,
        })
        .expect("gecerli bilet girdisi basarili olmali");

        assert!(sonuc.pnr_kodu.starts_with("CNQ-SALON3-2130-"));
        assert_eq!(sonuc.film_adi, "Yildizlar Arasi");
        assert_eq!(sonuc.adet, 2);
        assert!(sonuc.dogrulama_ozeti.contains("2 bilet"));
    }

    #[test]
    fn gecersiz_girdi_anlamli_hata_dondurur() {
        let sonuc = bilet_hesapla(BiletGirdisi {
            film_adi: "  ".to_string(),
            salon: "Salon 1".to_string(),
            seans: "21:30".to_string(),
            adet: 1,
        });

        assert!(matches!(sonuc, Err(BiletHatasi::FilmAdiBos)));
    }

    #[test]
    fn sifir_adet_ve_gecersiz_seans_reddedilir() {
        let sifir_adet = bilet_hesapla(BiletGirdisi {
            film_adi: "Yildizlar Arasi".to_string(),
            salon: "Salon 1".to_string(),
            seans: "21:30".to_string(),
            adet: 0,
        });
        let gecersiz_seans = bilet_hesapla(BiletGirdisi {
            film_adi: "Yildizlar Arasi".to_string(),
            salon: "Salon 1".to_string(),
            seans: "25:99".to_string(),
            adet: 1,
        });

        assert!(matches!(
            sifir_adet,
            Err(BiletHatasi::BiletAdediGecersiz)
        ));
        assert!(matches!(
            gecersiz_seans,
            Err(BiletHatasi::SeansGecersiz)
        ));
    }
}

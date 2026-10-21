use std::time::{SystemTime, UNIX_EPOCH};

// CineQ Bilet Kodu Üretici: CNQ-<salon>-<seans>-<6 haneli rastgele>
#[tauri::command]
fn bilet_olustur(salon: Option<String>, seans: Option<String>, etkinlik_id: Option<u32>) -> String {
    let salon_kodu = salon.unwrap_or_else(|| {
        etkinlik_id
            .map(|id| format!("S{}", id))
            .unwrap_or_else(|| "S1".to_string())
    });
    let seans_kodu = seans
        .map(|s| s.replace(':', ""))
        .unwrap_or_else(|| "2130".to_string());
    let zaman = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let rastgele = (zaman % 0xFF_FFFF) as u32;
    format!("CNQ-{}-{}-{:06X}", salon_kodu, seans_kodu, rastgele)
}

mod backend;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| backend::commands::setup(app))
        .invoke_handler(tauri::generate_handler![
            bilet_olustur,
            backend::commands::auth_register,
            backend::commands::auth_login,
            backend::commands::auth_logout,
            backend::commands::auth_me,
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
            backend::domain::seans_iptal,
            backend::domain::salon_yayinla,
            backend::domain::koltuk_sec,
            backend::domain::bilet_siparisi_olustur,
            backend::domain::bilet_dogrula,
            backend::domain::siparis_iade,
            backend::domain::cineq_dashboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bilet_olustur_bicimi() {
        let kod = bilet_olustur(Some("S3".to_string()), Some("21:30".to_string()), None);
        assert!(kod.starts_with("CNQ-S3-2130-"));
        assert_eq!(kod.len(), 18);
    }

    #[test]
    fn test_bilet_olustur_varsayilan() {
        let kod = bilet_olustur(None, None, None);
        assert!(kod.starts_with("CNQ-S1-2130-"));
    }
}

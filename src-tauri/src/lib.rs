use std::time::{SystemTime, UNIX_EPOCH};

// Adım 11: Rust komutu — ön yüz invoke("bilet_olustur", { etkinlikId }) ile çağırır
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn bilet_olustur(etkinlik_id: u32) -> String {
    let zaman = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("PSK-{:03}-{:07X}", etkinlik_id, zaman % 0xFFF_FFFF)
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

//! Migration listesi (sıra önemlidir). Yeni migration: `migrations/` altına bir SQL dosyası ekle ve buraya sona ekle.
use crate::backend::migrate::Migration;

pub const ALL: &[Migration] = &[
    Migration { name: "2026_10_14_000001_create_users_table", sql: include_str!("migrations/2026_10_14_000001_create_users_table.sql") },
    Migration { name: "2026_10_14_000002_create_permission_tables", sql: include_str!("migrations/2026_10_14_000002_create_permission_tables.sql") },
    Migration { name: "2026_10_14_000003_create_common_tables", sql: include_str!("migrations/2026_10_14_000003_create_common_tables.sql") },
    Migration { name: "2026_10_14_000010_create_cineq_tables", sql: include_str!("migrations/2026_10_14_000010_create_cineq_tables.sql") },
    Migration { name: "2026_10_14_000020_seed_roles_and_permissions", sql: include_str!("migrations/2026_10_14_000020_seed_roles_and_permissions.sql") },
    Migration { name: "2026_10_27_000030_seed_admin_demo_data", sql: include_str!("migrations/2026_10_27_000030_seed_admin_demo_data.sql") },
    Migration { name: "2026_10_27_000040_seed_owner_account", sql: include_str!("migrations/2026_10_27_000040_seed_owner_account.sql") },
    Migration { name: "2026_10_27_000050_guest_commerce_and_auth_sessions", sql: include_str!("migrations/2026_10_27_000050_guest_commerce_and_auth_sessions.sql") },
    Migration { name: "2026_10_27_000060_buffet_menu_status", sql: include_str!("migrations/2026_10_27_000060_buffet_menu_status.sql") },
    Migration { name: "2026_10_27_000070_correct_owner_email", sql: include_str!("migrations/2026_10_27_000070_correct_owner_email.sql") },
];

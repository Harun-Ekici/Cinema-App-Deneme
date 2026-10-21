-- Roller ve izinler (spatie/laravel-permission + Filament Shield düzeni). Veri-yalnız ve yinelenebilir.

INSERT OR IGNORE INTO roles (name, guard_name, created_at, updated_at) VALUES
    ('admin', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('cinema_manager', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('box_office', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('support', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('content', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('viewer', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('customer', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

WITH actions(action) AS (VALUES ('ViewAny'), ('View'), ('Create'), ('Update'), ('Delete'), ('DeleteAny')),
     resources(resource) AS (VALUES ('Film'), ('Sinema'), ('Salon'), ('Seans'), ('KoltukRezervasyonu'), ('BufeUrunu'), ('BufeMenusu'), ('Siparis'), ('Bilet'), ('Musteri'), ('Kampanya'), ('AbonelikPlani'), ('ContactMessage'), ('ContentPage'), ('AuditLog'), ('User'), ('Role'), ('Permission'))
INSERT OR IGNORE INTO permissions (name, guard_name, created_at, updated_at)
SELECT action || ':' || resource, 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now') FROM actions, resources;

INSERT OR IGNORE INTO permissions (name, guard_name, created_at, updated_at) VALUES
    ('Validate:Bilet', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('Refund:Siparis', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('Publish:Salon', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('Reveal:PII', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

-- cinema_manager
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'cinema_manager' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:Film', 'View:Film', 'Create:Film', 'Update:Film',
    'Delete:Film', 'DeleteAny:Film', 'ViewAny:Sinema', 'View:Sinema',
    'Create:Sinema', 'Update:Sinema', 'Delete:Sinema', 'DeleteAny:Sinema',
    'ViewAny:Salon', 'View:Salon', 'Create:Salon', 'Update:Salon',
    'Delete:Salon', 'DeleteAny:Salon', 'ViewAny:Seans', 'View:Seans',
    'Create:Seans', 'Update:Seans', 'Delete:Seans', 'DeleteAny:Seans',
    'ViewAny:BufeUrunu', 'View:BufeUrunu', 'Create:BufeUrunu', 'Update:BufeUrunu',
    'Delete:BufeUrunu', 'DeleteAny:BufeUrunu', 'ViewAny:BufeMenusu', 'View:BufeMenusu',
    'Create:BufeMenusu', 'Update:BufeMenusu', 'Delete:BufeMenusu', 'DeleteAny:BufeMenusu',
    'ViewAny:Kampanya', 'View:Kampanya', 'Create:Kampanya', 'Update:Kampanya',
    'Delete:Kampanya', 'DeleteAny:Kampanya', 'ViewAny:AbonelikPlani', 'View:AbonelikPlani',
    'Create:AbonelikPlani', 'Update:AbonelikPlani', 'Delete:AbonelikPlani', 'DeleteAny:AbonelikPlani',
    'ViewAny:Siparis', 'View:Siparis', 'ViewAny:Bilet', 'View:Bilet',
    'ViewAny:KoltukRezervasyonu', 'View:KoltukRezervasyonu', 'ViewAny:Musteri', 'View:Musteri',
    'Publish:Salon'
);

-- box_office
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'box_office' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:Film', 'View:Film', 'ViewAny:Seans', 'View:Seans',
    'ViewAny:Salon', 'View:Salon', 'ViewAny:Siparis', 'View:Siparis',
    'ViewAny:Bilet', 'View:Bilet', 'ViewAny:KoltukRezervasyonu', 'View:KoltukRezervasyonu',
    'ViewAny:BufeUrunu', 'View:BufeUrunu', 'ViewAny:BufeMenusu', 'View:BufeMenusu',
    'Validate:Bilet', 'Refund:Siparis'
);

-- support
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'support' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:ContactMessage', 'View:ContactMessage', 'Create:ContactMessage', 'Update:ContactMessage',
    'Delete:ContactMessage', 'DeleteAny:ContactMessage', 'ViewAny:Siparis', 'View:Siparis',
    'ViewAny:Bilet', 'View:Bilet', 'ViewAny:Musteri', 'View:Musteri'
);

-- content
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'content' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:ContentPage', 'View:ContentPage', 'Create:ContentPage', 'Update:ContentPage',
    'Delete:ContentPage', 'DeleteAny:ContentPage'
);

-- viewer
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'viewer' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:Film', 'View:Film', 'ViewAny:Sinema', 'View:Sinema',
    'ViewAny:Salon', 'View:Salon', 'ViewAny:Seans', 'View:Seans',
    'ViewAny:KoltukRezervasyonu', 'View:KoltukRezervasyonu', 'ViewAny:BufeUrunu', 'View:BufeUrunu',
    'ViewAny:BufeMenusu', 'View:BufeMenusu', 'ViewAny:Siparis', 'View:Siparis',
    'ViewAny:Bilet', 'View:Bilet', 'ViewAny:Musteri', 'View:Musteri',
    'ViewAny:Kampanya', 'View:Kampanya', 'ViewAny:AbonelikPlani', 'View:AbonelikPlani',
    'ViewAny:ContactMessage', 'View:ContactMessage', 'ViewAny:ContentPage', 'View:ContentPage'
);

INSERT OR IGNORE INTO roles (name, guard_name, created_at, updated_at)
VALUES ('owner', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

INSERT OR IGNORE INTO users (name, email, password, status, created_at, updated_at)
VALUES ('Harun Ekici', 'harunekici@gmail.com', '', 'active',
    strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

UPDATE users
SET name = 'Harun Ekici',
    status = 'active',
    updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE email = 'harunekici@gmail.com';

INSERT OR IGNORE INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id, 'User', u.id
FROM roles r CROSS JOIN users u
WHERE r.name = 'owner' AND r.guard_name = 'web' AND u.email = 'harunekici@gmail.com';

INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p CROSS JOIN roles r
WHERE p.guard_name = 'web' AND r.name = 'owner' AND r.guard_name = 'web';

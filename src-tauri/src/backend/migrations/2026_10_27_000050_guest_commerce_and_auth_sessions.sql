ALTER TABLE biletler
    ADD COLUMN biletTuru TEXT NOT NULL DEFAULT 'tam'
    CHECK (biletTuru IN ('tam', 'ogrenci'));

CREATE TABLE guest_orders (
    orderId TEXT PRIMARY KEY NOT NULL REFERENCES siparisler (id) ON DELETE CASCADE,
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE auth_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    userId INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    startedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    endedAt TEXT
);
CREATE INDEX auth_sessions_userId_startedAt_index ON auth_sessions (userId, startedAt);

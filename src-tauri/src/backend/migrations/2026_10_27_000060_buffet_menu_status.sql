ALTER TABLE bufe_menuleri
    ADD COLUMN durum TEXT NOT NULL DEFAULT 'taslak'
    CHECK (durum IN ('taslak', 'aktif', 'deaktif'));

UPDATE bufe_menuleri
SET durum = CASE WHEN aktif = 1 THEN 'aktif' ELSE 'taslak' END;

CREATE INDEX bufe_menuleri_durum_index ON bufe_menuleri (durum);

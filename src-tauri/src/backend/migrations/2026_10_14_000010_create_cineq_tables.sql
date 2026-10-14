-- cineq tabloları. Sütun adları ön yüz tipleriyle birebir (camelCase); tablo adları snake_case.

CREATE TABLE "filmler" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "afis" TEXT,
    "gradyan" TEXT NOT NULL DEFAULT '',
    "sinopsis" TEXT NOT NULL DEFAULT '',
    "yonetmen" TEXT NOT NULL DEFAULT '',
    "oyuncular" TEXT NOT NULL DEFAULT '[]',
    "sureDk" INTEGER NOT NULL,
    "turler" TEXT NOT NULL DEFAULT '[]',
    "imdb" REAL,
    "yasSiniri" INTEGER NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'yakinda' CHECK ("durum" IN ('vizyonda', 'yakinda', 'arsiv'))
);
CREATE INDEX filmler_durum_index ON "filmler" ("durum");

CREATE TABLE "sinemalar" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "sehir" TEXT NOT NULL,
    "adres" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE "salonlar" (
    "id" TEXT PRIMARY KEY,
    "sinemaId" TEXT NOT NULL REFERENCES "sinemalar" ("id") ON DELETE CASCADE,
    "numara" INTEGER NOT NULL,
    "ad" TEXT NOT NULL,
    "tip" TEXT NOT NULL DEFAULT '2D' CHECK ("tip" IN ('IMAX', '2D', '3D')),
    "harita" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'taslak' CHECK ("durum" IN ('taslak', 'yayinda')),
    UNIQUE ("sinemaId", "numara")
);

CREATE TABLE "seanslar" (
    "id" TEXT PRIMARY KEY,
    "filmId" INTEGER NOT NULL REFERENCES "filmler" ("id") ON DELETE RESTRICT,
    "salonId" TEXT NOT NULL REFERENCES "salonlar" ("id") ON DELETE RESTRICT,
    "baslangic" TEXT NOT NULL,
    "dil" TEXT NOT NULL DEFAULT 'tr' CHECK ("dil" IN ('tr', 'en', 'de', 'ar')),
    "altyazi" TEXT CHECK ("altyazi" IS NULL OR "altyazi" IN ('tr', 'en', 'de', 'ar')),
    "fiyat" TEXT NOT NULL,
    "iptal" TEXT
);
CREATE INDEX seanslar_filmId_index ON "seanslar" ("filmId");
CREATE INDEX seanslar_salonId_index ON "seanslar" ("salonId");
CREATE INDEX seanslar_baslangic_index ON "seanslar" ("baslangic");

CREATE TABLE "musteriler" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "eposta" TEXT NOT NULL,
    "favoriFilmler" TEXT NOT NULL DEFAULT '[]',
    "siparisSayisi" INTEGER NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'aktif' CHECK ("durum" IN ('aktif', 'engelli')),
    "kayit" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE "siparisler" (
    "id" TEXT PRIMARY KEY,
    "musteriId" TEXT REFERENCES "musteriler" ("id") ON DELETE SET NULL,
    "biletler" TEXT NOT NULL DEFAULT '[]',
    "bufe" TEXT NOT NULL DEFAULT '[]',
    "toplam" REAL NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor' CHECK ("durum" IN ('bekliyor', 'odendi', 'kullanildi', 'iptal', 'iade')),
    "olusturma" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    "kullanimZamani" TEXT
);
CREATE INDEX siparisler_durum_index ON "siparisler" ("durum");

CREATE TABLE "koltuk_rezervasyonlari" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "seansId" TEXT NOT NULL REFERENCES "seanslar" ("id") ON DELETE CASCADE,
    "satir" INTEGER NOT NULL,
    "sutun" INTEGER NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'secili' CHECK ("durum" IN ('secili', 'dolu')),
    "siparisId" TEXT REFERENCES "siparisler" ("id") ON DELETE SET NULL,
    "tutmaBitis" TEXT,
    UNIQUE ("seansId", "satir", "sutun")
);
CREATE INDEX koltuk_rezervasyonlari_seansId_index ON "koltuk_rezervasyonlari" ("seansId");

CREATE TABLE "bufe_urunleri" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "kategori" TEXT NOT NULL CHECK ("kategori" IN ('misir', 'icecek', 'atistirmalik', 'menu')),
    "boyut" TEXT CHECK ("boyut" IS NULL OR "boyut" IN ('Küçük', 'Orta', 'Büyük')),
    "fiyat" REAL NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "aktif" INTEGER NOT NULL DEFAULT 1 CHECK ("aktif" IN (0, 1))
);

CREATE TABLE "bufe_menuleri" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "fiyat" REAL NOT NULL,
    "aktif" INTEGER NOT NULL DEFAULT 1 CHECK ("aktif" IN (0, 1))
);

CREATE TABLE "biletler" (
    "kod" TEXT PRIMARY KEY,
    "siparisId" TEXT NOT NULL REFERENCES "siparisler" ("id") ON DELETE CASCADE,
    "seansId" TEXT NOT NULL REFERENCES "seanslar" ("id") ON DELETE RESTRICT,
    "satir" INTEGER NOT NULL,
    "sutun" INTEGER NOT NULL,
    "kategori" TEXT NOT NULL CHECK ("kategori" IN ('standart', 'vip')),
    "fiyat" REAL NOT NULL,
    "kullanildi" INTEGER NOT NULL DEFAULT 0 CHECK ("kullanildi" IN (0, 1)),
    "kullanimZamani" TEXT
);
CREATE INDEX biletler_siparisId_index ON "biletler" ("siparisId");
CREATE INDEX biletler_seansId_index ON "biletler" ("seansId");

CREATE TABLE "kampanyalar" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "tur" TEXT NOT NULL CHECK ("tur" IN ('yuzde', 'tutar', 'n-al-m-ode')),
    "deger" REAL NOT NULL,
    "kapsam" TEXT NOT NULL DEFAULT 'ikisi' CHECK ("kapsam" IN ('bilet', 'bufe', 'ikisi')),
    "baslangic" TEXT NOT NULL,
    "bitis" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'taslak' CHECK ("durum" IN ('taslak', 'aktif', 'bitti'))
);

CREATE TABLE "abonelik_planlari" (
    "id" TEXT PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "aylikFiyat" REAL NOT NULL,
    "ayricalik" TEXT NOT NULL DEFAULT '[]',
    "durum" TEXT NOT NULL DEFAULT 'taslak' CHECK ("durum" IN ('taslak', 'aktif', 'kapali'))
);

-- Minimal catalog data lets the admin prototype run against a fresh local database.
INSERT OR IGNORE INTO filmler
    (id, ad, gradyan, sinopsis, yonetmen, oyuncular, sureDk, turler, imdb, yasSiniri, durum)
VALUES
    (1001, '{"tr":"Kızıl Ufkun Ötesi","en":"Beyond the Red Horizon"}', '', 'Uzak bir yolculukta verilen kararlar.', 'Kurgu Yönetmen 1', '["Kurgu Oyuncu 1A","Kurgu Oyuncu 1B"]', 118, '["Bilim Kurgu","Aksiyon"]', 7.4, 13, 'vizyonda'),
    (1002, '{"tr":"Sessiz Liman","en":"Quiet Harbor"}', '', 'Küçük bir kıyı kasabasında başlayan hikaye.', 'Kurgu Yönetmen 2', '["Kurgu Oyuncu 2A","Kurgu Oyuncu 2B"]', 104, '["Dram"]', 7.1, 13, 'vizyonda'),
    (1003, '{"tr":"Bulutların Altında","en":"Beneath the Clouds"}', '', 'Bir aile, beklenmedik bir yolculuğa çıkar.', 'Kurgu Yönetmen 3', '["Kurgu Oyuncu 3A","Kurgu Oyuncu 3B"]', 96, '["Animasyon","Komedi"]', 7.8, 0, 'vizyonda'),
    (1004, '{"tr":"Son Perde","en":"The Final Scene"}', '', 'Tiyatro sahnesinde çözülen eski bir sır.', 'Kurgu Yönetmen 4', '["Kurgu Oyuncu 4A","Kurgu Oyuncu 4B"]', 121, '["Gerilim"]', 6.9, 16, 'vizyonda'),
    (1005, '{"tr":"Derin Zaman","en":"Deep Time"}', '', 'Bilim insanları zamanın sınırlarını araştırır.', 'Kurgu Yönetmen 5', '["Kurgu Oyuncu 5A","Kurgu Oyuncu 5B"]', 132, '["Bilim Kurgu","Dram"]', 7.6, 13, 'vizyonda'),
    (1006, '{"tr":"Kayıp Nota","en":"The Lost Note"}', '', 'Bir müzisyenin geçmişle yüzleşmesi.', 'Kurgu Yönetmen 6', '["Kurgu Oyuncu 6A","Kurgu Oyuncu 6B"]', 108, '["Dram"]', 7.0, 7, 'vizyonda'),
    (1007, '{"tr":"Yıldız Haritası","en":"Map of Stars"}', '', 'Genç bir ekip gökyüzünün ötesini keşfeder.', 'Kurgu Yönetmen 7', '["Kurgu Oyuncu 7A","Kurgu Oyuncu 7B"]', 116, '["Bilim Kurgu"]', 7.2, 13, 'vizyonda'),
    (1008, '{"tr":"Küçük Büyük Yolculuk","en":"A Small Big Journey"}', '', 'Beklenmedik dostlarla eğlenceli bir yolculuk.', 'Kurgu Yönetmen 8', '["Kurgu Oyuncu 8A","Kurgu Oyuncu 8B"]', 99, '["Animasyon","Komedi"]', 7.5, 0, 'vizyonda'),
    (1009, '{"tr":"Yarınki Şehir","en":"City of Tomorrow"}', '', 'Geleceğin şehrinde yeni bir hayat başlar.', 'Kurgu Yönetmen 9', '["Kurgu Oyuncu 9A","Kurgu Oyuncu 9B"]', 127, '["Bilim Kurgu"]', 6.8, 13, 'yakinda'),
    (1010, '{"tr":"Cam Orman","en":"Glass Forest"}', '', 'Bir araştırma ekibi gizemli bir ormana ulaşır.', 'Kurgu Yönetmen 10', '["Kurgu Oyuncu 10A","Kurgu Oyuncu 10B"]', 112, '["Gerilim","Aksiyon"]', 7.3, 16, 'yakinda'),
    (1011, '{"tr":"Mavi Frekans","en":"Blue Frequency"}', '', 'Bir radyo yayını iki farklı hayatı birleştirir.', 'Kurgu Yönetmen 11', '["Kurgu Oyuncu 11A","Kurgu Oyuncu 11B"]', 102, '["Dram"]', 6.7, 7, 'yakinda'),
    (1012, '{"tr":"Uzak İstasyon","en":"Far Station"}', '', 'Issız bir istasyonda alınan gizemli bir sinyal.', 'Kurgu Yönetmen 12', '["Kurgu Oyuncu 12A","Kurgu Oyuncu 12B"]', 123, '["Bilim Kurgu","Gerilim"]', 7.7, 13, 'yakinda');

INSERT OR IGNORE INTO sinemalar (id, ad, sehir, adres) VALUES
    ('demo-sinema-1', 'CineQ Merkez', 'İstanbul', 'Örnek Sinema Caddesi 10'),
    ('demo-sinema-2', 'CineQ Kıyı', 'İzmir', 'Örnek Kıyı Sokak 24');

INSERT OR IGNORE INTO salonlar (id, sinemaId, numara, ad, tip, harita, durum) VALUES
    ('demo-salon-1', 'demo-sinema-1', 1, 'Salon S1', 'IMAX', '{"satir":10,"sutun":14,"koridorSutunlari":[6],"vipSatirlari":[8,9],"kullanilamaz":[{"satir":0,"sutun":0},{"satir":0,"sutun":13}]}', 'yayinda'),
    ('demo-salon-2', 'demo-sinema-1', 2, 'Salon S2', '2D', '{"satir":10,"sutun":14,"koridorSutunlari":[6],"vipSatirlari":[8,9],"kullanilamaz":[{"satir":0,"sutun":0},{"satir":0,"sutun":13}]}', 'yayinda'),
    ('demo-salon-3', 'demo-sinema-1', 3, 'Salon S3', '3D', '{"satir":10,"sutun":14,"koridorSutunlari":[6],"vipSatirlari":[8,9],"kullanilamaz":[{"satir":0,"sutun":0},{"satir":0,"sutun":13}]}', 'yayinda'),
    ('demo-salon-4', 'demo-sinema-2', 1, 'Salon S1', '2D', '{"satir":10,"sutun":14,"koridorSutunlari":[6],"vipSatirlari":[8,9],"kullanilamaz":[{"satir":0,"sutun":0},{"satir":0,"sutun":13}]}', 'yayinda'),
    ('demo-salon-5', 'demo-sinema-2', 2, 'Salon S2', '3D', '{"satir":10,"sutun":14,"koridorSutunlari":[6],"vipSatirlari":[8,9],"kullanilamaz":[{"satir":0,"sutun":0},{"satir":0,"sutun":13}]}', 'yayinda');

WITH RECURSIVE sequence(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM sequence WHERE n < 40
)
INSERT OR IGNORE INTO seanslar (id, filmId, salonId, baslangic, dil, altyazi, fiyat)
SELECT
    printf('demo-seans-%03d', n),
    1001 + ((n - 1) % 12),
    printf('demo-salon-%d', ((n - 1) % 5) + 1),
    strftime('%Y-%m-%dT%H:%M:00', 'now', '+' || (((n - 1) % 7) + 1) || ' days',
        '+' || (CASE WHEN ((n - 1) / 7) % 2 = 0 THEN 13 ELSE 18 END) || ' hours'),
    CASE (n - 1) % 4 WHEN 0 THEN 'tr' WHEN 1 THEN 'en' WHEN 2 THEN 'de' ELSE 'ar' END,
    CASE WHEN n % 2 = 0 THEN 'en' ELSE 'tr' END,
    json_object('standart', 180 + (n % 5) * 10, 'vip', 280 + (n % 5) * 10)
FROM sequence;

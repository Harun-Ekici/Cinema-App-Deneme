# Proje Fikri ve Konsept Belgesi

> ✍️ **Öğrenci Görevi:** Bu taslağı seçtiğiniz proje fikrine göre doldurun. Ayrıntılı rehber ve 40 örnek proje için [`docs/tasks/week-3/02-proje-fikriniz.task.md`](tasks/week-3/02-proje-fikriniz.task.md) dosyasını inceleyin.

---

## 1. Proje Künyesi

- **Proje Adı:** CineQ
- **Slogan / Tek Cümlelik Tanım:** Vizyondaki filmleri keşfedin, koltuğunuzu seçin ve sinema büfenizi tek akışta yönetin.
- **Öğrenci Adı Soyadı:** Harun Ekici
- **Öğrenci Numarası:** 2520171003 / 2620511144
- **İlham Alınan Konsept / Platform:** Paribu Cineverse / Biletinial / Getir Çarşı (Büfe Entegrasyonu)

---

## 2. Proje Amacı ve Çözülen Problem

Geleneksel sinema biletleme platformlarında büfe alışverişi bilet akışından bağımsız kalmakta, gişelerde uzun kuyruklar ve mobil ortamlarda yavaş çalışan arayüzler deneyimi zorlaştırmaktadır. CineQ; vizyondaki filmleri, seansları, interaktif koltuk seçimini ve mısır/içecek gibi büfe siparişlerini tek bir akıcı sepette birleştirerek hem masaüstü hem de mobil cihazlarda yüksek performanslı, modern bir rezervasyon deneyimi sunar.

---

## 3. Temel Ekranlar ve İşlevler

1. **Ana Liste Ekranı (Keşfet):**
   - Vizyondaki ve yakında gelecek filmler afişleri, IMDb puanları, süreleri ve tür etiketleriyle listelenir.
   - Tür bazlı (Aksiyon, Dram, Animasyon, Bilim Kurgu vb.) filtreleme ve arama çubuğu yer alır.
2. **Detay ve Seçim Ekranı:**
   - Seçilen filmin sinopsisi, yönetmen ve oyuncu bilgileri, seans saatleri ve salon tipi (IMAX, 2D, 3D) görüntülenir.
   - İnteraktif salon haritası üzerinde anlık dolu/boş koltuk seçimi ve koltuk kategorisi (Standart/VIP) seçimi yapılır.
   - Büfe modülü ile mısır, içecek ve menü kombinasyonları sepete eklenebilir.
3. **Kayıt / Kod Üretme Ekranı (Rust Backend):**
   - Rezervasyon tamamlandığında Tauri Rust komutu (`generate_ticket_code`) çağrılarak benzersiz bir PNR ve QR/Barkod doğrulama kodu üretilir.
   - Üretilen rezervasyon ve bilet özeti yerel depolama/dosya sistemi ile senkronize edilerek saklanır.
4. **Profil ve Ayarlar:**
   - Kullanıcının geçmiş rezervasyonları, bilet barkodları ve favori filmleri listelenir.
   - 4 dil desteği (Türkçe, İngilizce, Almanca, Arapça - RTL) ve kırmızı-siyah sinema tema tercihleri değiştirilebilir.

---

## 4. Hedef Kitle

- Sinemaseverler, öğrenciler ve sinemaya gitmeden önce sıra beklemeden hem biletini hem büfe menüsünü tek dokunuşla ayırtmak isteyen mobil ve masaüstü kullanıcıları.

## Bilet kodu biçimi (eğitmen önerisi)

Görev 02, Rust tarafında üretilecek kodun biçiminin tanımlı olmasını ister. Öneri:

`CNQ-<salon>-<seans>-<6 haneli rastgele>` — örnek: `CNQ-S3-2130-7F4K2Q`

- `CNQ`: uygulama öneki
- `S3`: salon numarası
- `2130`: seans saati (21:30)
- `7F4K2Q`: Rust tarafında üretilen rastgele bölüm

Biçimi değiştirirseniz bu bölümü güncelleyin; Hafta 04'teki Rust komutu görevi bu tanıma göre yapılacak.

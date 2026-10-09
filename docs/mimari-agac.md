# Mimari Ağaç Yapısı ve Kapsam

Bu doküman; **CineQ** (Sinema & Büfe Rezervasyon Uygulaması) projesinin temel dizin mimarisini, sayfa ve özellik akışını, hedef platform matrisini ve duyarlı tasarım kurallarını belgeler.

---

## 1. Dizin Mimarisi (Klasör Ağacı)

Proje sürdürülebilirliği açısından münferit dosyalar yerine yalnızca ana dizinler ve kök yapılandırma dosyaları listelenmiştir:

```text
Cinema-App-Deneme/
├── docs/             # Proje mimarisi, görev dokümanları ve marka yönergeleri
├── public/           # Statik varlıklar (logolar, ikonlar, afiş görselleri)
├── src-tauri/        # Rust çekirdeği, yerel backend komutları ve Tauri yapılandırması
├── src/
│   ├── components/   # Yeniden kullanılabilir Svelte 5 ve React arayüz bileşenleri
│   ├── layouts/      # Ortak sayfa iskeletleri (üst bar, alt navigasyon)
│   ├── lib/          # İş mantığı, Svelte 5 ($state) durum yönetimi ve veri modelleri
│   ├── pages/        # Dosya tabanlı sayfa rotaları (.astro ve .mdx)
│   ├── styles/       # Global tema değişkenleri ve renk token'ları (app.css)
│   └── types/        # TypeScript arayüzleri ve veri tipi tanımları
├── astro.config.mjs  # Astro çoklu çatı (Svelte, React, MDX) yapılandırması
├── package.json      # Proje bağımlılıkları ve çalıştırma scriptleri
└── tsconfig.json     # TypeScript derleyici kuralları




CineQ
├── / (Ana Sayfa — Keşfet)
│   ├── Canlı film arama ve tür/kategori filtreleme
│   └── Vizyondaki filmler ve seans listesi
│
├── /etkinlik/[id] (Film & Seans Detayı)
│   ├── Salon, tarih, seans saati ve koltuk seçim matrisi
│   └── Büfe ürünleri (mısır, içecek) seçimi ve sepete ekleme
│
├── /sepet (İşlem / Sepet / Onay)
│   ├── Seçilen koltuklar ve büfe siparişleri özeti
│   └── Toplam tutar hesaplama ve Rust backend komutu tetikleme
│
├── /biletlerim (Sonuçlar / Kodlarım)
│   ├── Rust tarafından üretilen benzersiz bilet doğrulama kodları
│   └── Aktif biletler ve geçmiş rezervasyon dökümü
│
├── /profil (Kullanıcı & Tema)
│   ├── Yerel kullanıcı profili (localStorage)
│   ├── Gece / Gündüz teması geçişi
│   └── Kurumsal bilgi sayfalarına hızlı menü bağlantıları
│
└── Bilgi ve Yasal Sayfalar
    ├── /hakkinda (MDX — Vizyon, geliştirici bilgisi ve CanliRozet React bileşeni)
    ├── /iletisim (Astro + Svelte Reaktif İletişim Formu)
    ├── /kosullar (MDX — Hizmet şartları ve eğitim projesi bildirimi)
    └── /gizlilik (MDX — localStorage kullanımı ve KVKK veri koruma bildirimi)



    +-----------------+---------------------------------------+------------------------+
| Platform Grubu  | Hedef Sistemler                       | Paket Formatı          |
+-----------------+---------------------------------------+------------------------+
| Masaüstü        | macOS (Apple Silicon / Intel)         | .dmg, .app             |
| Masaüstü        | Windows (10 / 11 x64)                 | .msi, .exe             |
| Masaüstü        | Linux (Ubuntu / Debian)               | .deb, .AppImage        |
| Mobil           | iOS (iPhone & iPad)                   | .ipa (Xcode)           |
| Mobil           | Android (Telefon & Tablet)            | .apk, .aab             |
+-----------------+---------------------------------------+------------------------+



Ekran Kırılımları ve Düzen Kuralları:
├── Telefon (375px - 430px)
│   ├── Düzen: Tek sütun (1fr), dikey içerik akışı
│   └── Gezinme: Sabit alt menü çubuğu (AppNav / alt-menu)
│
├── Tablet (768px - 1024px)
│   ├── Düzen: 2 sütunlu ızgara düzeni (repeat(2, 1fr))
│   └── Gezinme: Esnek yatay boşluklar, genişletilmiş panel
│
├── Masaüstü (1024px - 1440px)
│   ├── Düzen: 3 sütunlu ızgara, ortalanmış max-width: 1200px
│   └── Gezinme: Üst navigasyon çubuğu ve sol panel filtreleri
│
└── Geniş Ekran (1440px+)
    ├── Düzen: 4 sütunlu ızgara düzeni, ortalanmış max-width: 1400px
    └── Gezinme: Genişletilmiş seans ve koltuk matrisi, konforlu boşluklar

## Dil rotaları

Dört bilgi sayfası (`hakkinda`, `iletisim`, `kosullar`, `gizlilik`) dört dilde yayınlanır. Türkçe kök rotadadır; diğer diller dil önekiyle açılır ve `<html>` etiketi dile göre `lang` ve `dir` alır.

| Dil | Önek | Örnek | Yön |
|---|---|---|---|
| Türkçe | yok | `/hakkinda` | `ltr` |
| English | `/en` | `/en/hakkinda` | `ltr` |
| العربية | `/ar` | `/ar/hakkinda` | `rtl` |
| فارسی | `/fa` | `/fa/hakkinda` | `rtl` |

Sayfalar arası dil geçişi `src/components/DilSecici.astro` ile yapılır. Yeni bir bilgi sayfası dört dil rotasıyla birlikte eklenir.

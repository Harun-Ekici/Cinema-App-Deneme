# CineQ — Marka ve Tasarım Kılavuzu

> Bu belge CineQ sinema & büfe rezervasyon uygulamasının marka kimliğini, renk paletini, tipografi ve platform ikon kurallarını tanımlar.

---

## 1. Marka Renk Paleti

Aşağıdaki renk token'ları `src/styles/app.css` içerisindeki `:root` ve `:root[data-tema="gece"]` tanımları ile birebir eşleşmektedir. Tüm metin/zemin eşleşmeleri WCAG AA standartlarına (≥ 4.5:1) uygundur.

| Kullanım Alanı | CSS Değişkeni | Açık Mod (Gündüz) | Koyu Mod (Gece) | Açıklama | Kontrast Oranı (Metin/Zemin) |
|---|---|---|---|---|---|
| **Ana Renk (Primary)** | `--renk-ana` | `#e11d48` | `#f43f5e` | Butonlar, aktif sekme, marka vurgusu | 4.8:1 (Zemin üzerinde vurgu) |
| **İkincil / Vurgu** | `--renk-vurgu` | `#d97706` | `#f59e0b` | VIP koltuklar, indirimli büfe rozetleri | 5.1:1 |
| **Koyu / Üst Bar** | `--renk-koyu` | `#0f172a` | `#020617` | Başlık alanı (Header) arka planı | 15.2:1 |
| **Sayfa Zemini** | `--zemin` | `#f8fafc` | `#0b0f19` | Sayfa genel arka planı | — |
| **Kart Yüzeyi** | `--kart` | `#ffffff` | `#151c2e` | Liste kartları, form ve sepet alanları | — |
| **Ana Yazı** | `--yazi` | `#0f172a` | `#f8fafc` | Başlıklar ve okunabilir metin | 15.2:1 (Açık), 16.4:1 (Koyu) |
| **Soluk Yazı** | `--yazi-soluk` | `#64748b` | `#94a3b8` | Açıklamalar, seans saatleri, etiketler | 4.6:1 (Açık), 5.4:1 (Koyu) |
| **Kenarlık** | `--kenar` | `#e2e8f0` | `#1e293b` | Çizgiler, input sınırları ve ayraçlar | — |

---

## 2. Tipografi ve Yuvarlaklık

- **Yazı Tipi (Font):** System UI (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`)
- **Köşe Yuvarlaklığı (`--radius`):** `14px`
- **Tasarım Izgarası:** 4px / 8px tabanlı boşluk hiyerarşisi

---

## 3. Logo ve İkon Tanımı

- **Logo Metni / Simgesi:** `CineQ` — Modern sinema bileti ve film makarası ikonu ile birleşik tipografi (`Cine<span>Q</span>`).
- **Logo Dosyası:** `public/favicon.png` ve `src/components/AppHeader.svelte`
- **Tauri Launcher İkonu:** `src-tauri/icons/`

---

## 4. Platform İkon ve Launcher Tablosu

| Platform | Dosya / Konum | Boyut ve Format | Üretim Yöntemi |
|---|---|---|---|
| macOS | `src-tauri/icons/icon.icns` | 1024×1024 kaynak, .icns | `bun run tauri icon` |
| Windows | `src-tauri/icons/icon.ico` | Çok boyutlu .ico (16–256 px) | `bun run tauri icon` |
| Linux | `src-tauri/icons/*.png` | 32, 128, 256, 512 px PNG | `bun run tauri icon` |
| iOS | `src-tauri/icons/ios/` | AppIcon seti (20–1024 px) | `bun run tauri icon` |
| Android | `src-tauri/icons/android/` | Mipmap setleri (mdpi–xxxhdpi) | `bun run tauri icon` |
| Web | `public/favicon.png`, `public/apple-touch-icon.png` | 180 px & 32 px PNG | Elle / Statik dizin |
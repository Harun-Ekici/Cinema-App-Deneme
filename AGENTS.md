# AGENTS.md — CineQ

Bu belge, bu depoda çalışan tüm yapay zeka asistanları (Antigravity, Cursor, Claude Code, Gemini) için bağlayıcı sistem talimatlarını ve proje mimari indeksini içerir.

## 1. Dokümantasyon ve Tek Kaynak Kuralı (DRY Docs)

- **Dokümanlar Tekrarlanmaz, Link Edilir:** Ajan hiçbir zaman dizin ağaçlarını, kuralları, renk tablolarını veya veri modellerini dosyalar arasında kopyalamaz. İlgili konularda daima `docs/` altındaki tek kaynağa link verir.
- Aşağıdaki belgeler bağlayıcı standartlardır:

| Doküman | Kapsam | Bağlayıcı Kural |
|---|---|---|
| [`docs/klasor-mimarisi.md`](docs/klasor-mimarisi.md) | Dizin & Dosya Yapısı | Klasör mimarisi yalnızca bu belgede tanımlanır. Yeni dosya eklerken bu hiyerarşiye uy; dizin ağacını başka yerde çoğaltma. |
| [`docs/proje-fikri.md`](docs/proje-fikri.md) | Proje Konsepti | İş mantığı, sinema/büfe rezervasyon terimleri ve veri modelleri bu konsepte sadık kalmalıdır. |
| [`docs/branding.md`](docs/branding.md) | Marka Kimliği ve Renkler | Ad-hoc renk yazılmaz. Yalnızca `branding.md` ve `src/styles/app.css` içindeki CSS değişkenleri (`--renk-ana`, `--zemin` vb.) kullanılır. |
| [`docs/mimari-agac.md`](docs/mimari-agac.md) | Sayfa & Özellik Haritası | Yeni rota, platform desteği veya breakpoint eklerken bu ağaç yapısına sadık kalınmalıdır. |
| [`docs/kurallar.md`](docs/kurallar.md) | Kodlama & Mimari Kuralları | Svelte 5, Astro ve Rust bileşenleri için geçerli temel kodlama standartları. |
| [`docs/kurulum.md`](docs/kurulum.md) | Kurulum & Bağımlılıklar | Çalışma ortamı hazırlığı, Bun ve Rust bağımlılıkları rehberi. |
| [`docs/teslim.md`](docs/teslim.md) | Teslimat & Değerlendirme | Dönem sonu teslim kriterleri ve proje kontrol listesi. |
| [`docs/tasks/`](docs/tasks/) | Görev Dokümanları | Eğitmenin tanımladığı haftalık aşamalar ve görev adımları. |
| [`docs/ilerleme-batch-01.md`](docs/ilerleme-batch-01.md) | Batch 01 kontrol matrisi ve derleme kanıtı |  |
| [`docs/ajan-uyum-testi.md`](docs/ajan-uyum-testi.md) | Ajan uyum testi kaydı |  |

## 2. Teknoloji Yığını ve Komutlar

- **Platform:** Tauri v2 (Rust çekirdek + WebView)
- **Web Çatısı:** Astro (Statik derleme, `output: 'static'`, port `1420`)
- **Arayüz:** Svelte 5 (Sadece Runes: `$state`, `$derived`, `$props`), React bileşenleri, MDX dokümantasyonu
- **Paket Yöneticisi:** Bun

### Geçerli Terminal Komutları:
- Web Geliştirme: `bun run dev` (127.0.0.1:1420)
- Tauri Masaüstü Geliştirme: `bun run tauri dev`
- Derleme & Doğrulama: `bun run build`

## 3. Git ve Geliştirme Disiplini (Zorunlu)

1. **Doğrudan `master`/`main` Dalına Commit Atılmaz:**
   - Her yeni özellik veya düzeltme için `feature/<ozellik-adi>` veya `fix/<hata-adi>` dalı açılmalıdır.
   - Değişiklikler test edildikten sonra Pull Request (PR) üzerinden incelenip ana dala birleştirilir.
2. **Kanıtsız Teslim Yapılmaz (Proof of Build):**
   - Her değişiklikten sonra `bun run build` çalıştırılmalı ve derlemenin 0 hata ile tamamlandığı doğrulanmalıdır.
3. **Kapsam Koruma (Scope Guard):**
   - Yalnızca görevin gerektirdiği dosyalar düzenlenmelidir. İstenmeyen dosyalarda "temizlik" veya izinsiz büyük refactoring yapılmaz.

## 4. Kod Yazım Kuralları

- **Svelte 5 Runes:** Bileşenlerde yalnızca Runes (`$state`, `$derived`, `$props`) kullanılır. Eski Svelte 4 sözdizimi (`export let`, `$:`) kullanılmaz.
- **SSR Güvenliği:** Sayfa bileşenlerinde SSR güvenliği gözetilmeli; doğrudan `window` veya `localStorage` erişimleri istemci tarafında veya korumalı (`typeof window !== 'undefined'`) yapılmalıdır.
- **DRY Stil Kuralı:** Asla inline hardcoded hex kodları uydurulmaz; daima `docs/branding.md` ve CSS değişkenlerine başvurulur.
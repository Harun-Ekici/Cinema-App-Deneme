# AGENTS.md — CineQ

Bu belge, bu depoda çalışan tüm yapay zeka ajanları (Antigravity, Claude, Cursor, Gemini) için bağlayıcı geliştirme kurallarını içerir.

## 1. Dokümantasyon ve Tek Kaynak Kuralı (DRY Docs)

- **Dokümanlar Tekrarlanmaz, Link Edilir:** Ajan hiçbir zaman dizin ağaçlarını, kuralları veya renk tablolarını dosyalar arasında kopyalamaz. İlgili konularda daima `docs/` altındaki tek doğru kaynağa link verir.
- Aşağıdaki belgeler bağlayıcı standartlardır:

| Doküman | Kapsam | Bağlayıcı Kural |
|---|---|---|
| [`docs/klasor-mimarisi.md`](docs/klasor-mimarisi.md) | Dizin & Dosya Yapısı | Klasör mimarisi yalnızca bu belgede tanımlanır. Yeni dosya eklerken bu hiyerarşiye uy. |
| [`docs/branding.md`](docs/branding.md) | Marka Kimliği ve Renkler | UI geliştirirken ad-hoc renk uydurma, `branding.md` ve CSS değişkenlerini kullan. |
| [`docs/mimari-agac.md`](docs/mimari-agac.md) | Sayfa & Özellik Haritası | Yeni sayfa veya yönlendirme eklerken mimari ağaca sadık kal. |
| [`docs/proje-fikri.md`](docs/proje-fikri.md) | Proje Konsepti | İş mantığı ve veri modelleri projenin amacına uygun olmalı. |

## 2. Teknoloji Yığını ve Çalıştırma

- **Çekirdek:** Tauri v2 (Rust) + Astro (Statik)
- **Arayüz:** Svelte 5 (Runes: `$state`, `$derived`, `$props`), React bileşenleri, MDX dokümantasyonu, Tailwind CSS
- **Paket Yöneticisi:** Bun
- **Geliştirme Sunucusu:** `bun run dev` (127.0.0.1:1420)
- **Tauri Uygulaması:** `bun run tauri dev`
- **Derleme / Doğrulama:** `bun run build`

## 3. Git ve Geliştirme Disiplini (Zorunlu)

1. **Doğrudan `master`/`main`'e commit atılmaz!**
   - Her yeni özellik veya düzeltme için `feature/<ozellik-adi>` veya `fix/<hata-adi>` dalı açılmalıdır.
   - Değişiklikler test edildikten sonra Pull Request (PR) mantığıyla incelenip ana dala birleştirilir.
2. **Kanıtsız Teslim Yapılmaz:**
   - Her değişiklikten sonra `bun run build` çalıştırılmalı ve derlemenin 0 hata ile tamamlandığı doğrulanmalıdır.
3. **Kapsam Koruma (Scope Guard):**
   - Yalnızca görevin gerektirdiği dosyalar düzenlenmelidir. İstenmeyen dosyalarda "temizlik" veya izinsiz büyük refactoring yapılmaz.

## 4. Kod Yazım Kuralları

- Svelte kodlarında Svelte 5 Runes (`$state`, `$derived`, `$props`) kullanılır. Eski Svelte 4 sözdizimi (`export let`, `$:`) kullanılmaz.
- Sayfa bileşenlerinde SSR güvenliği gözetilmeli; doğrudan `window` veya `localStorage` erişimleri client ortamında veya korumalı (`typeof window !== 'undefined'`) yapılmalıdır.
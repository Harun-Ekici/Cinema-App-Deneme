# AGENTS.md — CineQ

Bu belge, CineQ deposunda çalışan tüm yapay zeka asistanları için tek yetkili kural kaynağıdır ve proje mimari indeksini içerir.

## 0. Tek Kural Kaynağı

- Depoda çalışan tüm ajanlar bu belgedeki kurallara uyar; yeni veya değişen ajan kuralları yalnızca burada tanımlanır.
- [`CLAUDE.md`](CLAUDE.md) ve [`GEMINI.md`](GEMINI.md) yalnızca bu dosyaya yönlendirir; kural metinlerini kopyalamaz.

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
| [`docs/gorev-sartnamesi.md`](docs/gorev-sartnamesi.md) | Görev Şartnamesi | Her görevden önce doldurulacak kısa şartname şablonu. |
| [`docs/istemler/README.md`](docs/istemler/README.md) | İstem Günlükleri | Görev istemi, araç/model, plan, düzeltmeler ve doğrulama kayıtlarının biçimi. |
| [`docs/istemler/10-calisma-yontemi.md`](docs/istemler/10-calisma-yontemi.md) | Görev 10 Kaydı | Çalışma yöntemi görevinin istem ve doğrulama kaydı. |
| [`docs/istemler/14-detay-ekrani.md`](docs/istemler/14-detay-ekrani.md) | Görev 14 Kaydı | Film detay rotası, geri dönüş ve çok dilli doğrulama kanıtları. |
| [`docs/gelistirme-notlari.md`](docs/gelistirme-notlari.md) | Geliştirme Notları | Geliştirme sırasında liste durumlarını URL parametresiyle sınama adımları. |
| [`docs/veri-modeli.md`](docs/veri-modeli.md) | Veri Modeli | Film, seans, bilet ve büfe verilerinin alanları ile aralarındaki ilişkiler. |
| [`docs/komutlar.md`](docs/komutlar.md) | Rust Komutları | Tauri komutlarının girdileri, tipli sonuçları ve hata sözleşmeleri. |
| [`docs/platform-destegi.md`](docs/platform-destegi.md) | Platform Desteği | CineQ özelliklerinin Web ve Tauri platformlarındaki destek matrisi. |
| [`docs/istemler/15-rust-komutu.md`](docs/istemler/15-rust-komutu.md) | Görev 15 Kaydı | Tipli Rust bileti komutu, platform köprüsü ve doğrulama kaydı. |
| [`docs/ilerleme-batch-01.md`](docs/ilerleme-batch-01.md) | Batch 01 kontrol matrisi ve derleme kanıtı |  |
| [`docs/ilerleme-batch-02.md`](docs/ilerleme-batch-02.md) | Hafta 4, Görev 10–16 ilerleme matrisi ve doğrulama özeti |  |
| [`docs/ajan-uyum-testi.md`](docs/ajan-uyum-testi.md) | Ajan uyum testi kaydı |  |
| [`lat.md/`](lat.md/) | CineQ ürün modeli, mimarisi, kullanıcı akışları ve güncel durum bilgi grafiği | Ayrıntılı sözleşmelerin kaynağı `docs/` belgeleridir. |

## 2. Çalışma döngüsü

Her görevde aşağıdaki sırayı uygula:

1. Kullanıcının doldurduğu [görev şartnamesini](docs/gorev-sartnamesi.md) ve ilgili görev belgelerini incele.
2. Değişiklik yapmadan önce kapsamı, dosyaları ve doğrulama adımlarını içeren planı kullanıcıya sun; açık onayını bekle.
3. Onaydan sonra yalnızca kabul edilen kapsamda değişiklik yap. Her görev için ayrı bir `feature/<kisa-ad>` veya `fix/<kisa-ad>` dalında çalış ve değişiklikleri PR ile sun; `master`/`main` dalına doğrudan commit atma.
4. Uygulamayı doğrula ve sonucu ilgili [istem günlüğüne](docs/istemler/README.md) kaydet. `bun run build` başarıyla tamamlanıp 0 hata vermeden görevi bitmiş sayma.

## 3. Teknoloji Yığını ve Komutlar

- **Platform:** Tauri v2 (Rust çekirdek + WebView)
- **Web Çatısı:** Astro (Statik derleme, `output: 'static'`, port `1420`)
- **Arayüz:** Svelte 5 (Sadece Runes: `$state`, `$derived`, `$props`), React bileşenleri, MDX dokümantasyonu
- **Paket Yöneticisi:** Bun

### Geçerli Terminal Komutları:
- Web Geliştirme: `bun run dev` (127.0.0.1:1420)
- Tauri Masaüstü Geliştirme: `bun run tauri dev`
- Derleme & Doğrulama: `bun run build`

## 4. Git ve Geliştirme Disiplini (Zorunlu)

1. **Doğrudan `master`/`main` Dalına Commit Atılmaz:**
   - Her yeni özellik veya düzeltme için `feature/<ozellik-adi>` veya `fix/<hata-adi>` dalı açılmalıdır.
   - Değişiklikler test edildikten sonra Pull Request (PR) üzerinden incelenip ana dala birleştirilir.
2. **Kanıtsız Teslim Yapılmaz (Proof of Build):**
   - Her değişiklikten sonra `bun run build` çalıştırılmalı ve derlemenin 0 hata ile tamamlandığı doğrulanmalıdır.
3. **Kapsam Koruma (Scope Guard):**
   - Yalnızca görevin gerektirdiği dosyalar düzenlenmelidir. İstenmeyen dosyalarda "temizlik" veya izinsiz büyük refactoring yapılmaz.
4. **PR Güvenliği ve Dal Koruması:**
   - `master` dalına doğrudan commit atılamaz. Tüm geliştirmeler PR ile merge edilmelidir.
   - Dışarıdan veya tanınmayan kişilerden gelen PR'lar yerelde test edilip incelenmeden asla merge edilmez.
   - Detaylı PR güvenlik prosedürü, inceleme standartları ve merge kısıtları için bkz: [`docs/kurallar.md#pr-güvenliği`](docs/kurallar.md#pr-güvenliği).

## 5. Kod Yazım Kuralları

- **Svelte 5 Runes:** Bileşenlerde yalnızca Runes (`$state`, `$derived`, `$props`) kullanılır. Eski Svelte 4 sözdizimi (`export let`, `$:`) kullanılmaz.
- **SSR Güvenliği:** Sayfa bileşenlerinde SSR güvenliği gözetilmeli; doğrudan `window` veya `localStorage` erişimleri istemci tarafında veya korumalı (`typeof window !== 'undefined'`) yapılmalıdır.
- **DRY Stil Kuralı:** Asla inline hardcoded hex kodları uydurulmaz; daima `docs/branding.md` ve CSS değişkenlerine başvurulur.
- **Veri Sözleşmesi:** Yeni veri alanı önce `src/lib/types/` içinde tanımlanır, sonra bileşenlerde kullanılır.
- **Platform Matrisi:** Yeni özellik eklenirken `docs/platform-destegi.md` güncellenir.
- **Karakter ve Dil Standardı:** Ajanlar kaynak kodda, belgelerde, yorumlarda veya commit mesajlarında kesinlikle Çince ya da Japonca karakter yazamaz veya kullanamaz. Yalnızca Türkçe ve İngilizce standart karakterler geçerlidir.

%% lat:begin %%
# Before starting work

Use Lat's knowledge graph to ground each task before changing code.

- Run `lat search` to find sections relevant to your task. Read them to understand the design intent before writing code.

# Post-task checklist (REQUIRED — do not skip)

After EVERY task, before responding to the user:

- [ ] Update `lat.md/` if you added or changed meaningful implemented functionality, architecture, tests, or behavior. Keep it a focused snapshot of the current implemented state, not a journal/changelog. Plans may be drafted in `lat.md/` alongside implementation, with the intent that by commit time they describe what was implemented. Otherwise, keep proposals, hypothetical designs, and future work outside `lat.md/` unless the user explicitly requests them there.
- [ ] Run `lat check` — all validations must pass
- [ ] Do not skip these steps. Do not consider your task done until both are complete.

---

# What is lat.md?

Lat.md is the project's structured knowledge graph for architecture, design decisions, behavior, and tests.

The graph lives in `lat.md/` as cross-linked Markdown describing **what** the project does and **why**. Use it to ground work in actual architecture, and keep it a focused snapshot of the current implemented state rather than a journal or changelog.

Project-specific lat documentation belongs in `lat.md/`. Do not modify this generated instruction file or a generated `lat-md` `SKILL.md` to record project guidance: both are owned by lat tooling and may be replaced by a later `lat init`.

# Commands

Use these commands to navigate and validate the project knowledge graph.

```bash
lat locate "Section Name"      # find a section by name (exact, fuzzy)
lat refs "file#Section"        # find what references a section
lat search "natural language"  # semantic search across all sections
lat external show <handle>      # inspect a pinned external source before cloning it
lat check                      # run full graph and documentation validation
```

Run `lat --help` when in doubt about available commands or options.

If `lat search` fails because no API key is configured, explain to the user that semantic search requires a key provided via `LAT_LLM_KEY` (direct value), `LAT_LLM_KEY_FILE` (path to key file), or `LAT_LLM_KEY_HELPER` (command that prints the key). Supported key prefixes: `sk-...` (OpenAI) or `vck_...` (Vercel). If the user doesn't want to set it up, use `lat locate` for direct lookups instead.

# Syntax primer

Lat uses stable section ids, wiki links, source links, and code references to connect documentation with implementation.

- **Section ids**: `lat.md/path/to/file#Heading#SubHeading` — full form uses project-root-relative path (e.g. `lat.md/tests/search#RAG Replay Tests`). Short form uses bare file name when unique (e.g. `search#RAG Replay Tests`, `cli#search#Indexing`).
- **Wiki links**: `[[target]]` or `[[target|alias]]` — cross-references between sections. Can also reference repository paths or source code: `[[schema.sql]]`, `[[src/components]]`, `[[src/foo.ts#myFunction]]`.
- **Link specificity**: When documenting implemented behavior, prefer the narrowest relevant source-symbol link over a whole-file link. Use whole-file or directory links when discussing the module or resource as a whole, or when no supported symbol represents the target. If prose names a symbol, link that symbol directly.
- **Repository path links**: Wiki links without a `#` fragment may target any existing file or directory inside the project. Unsupported formats validate but cannot be opened by Lat; fragments require a `lat.md/` section or supported source file.
- **Source code links**: Wiki links in `lat.md/` files can reference functions, classes, constants, and methods in supported source files. Use the full path: `[[src/config.ts#getConfigDir]]`, `[[src/server.ts#App#listen]]` (class method), `[[lib/utils.py#parse_args]]`, `[[src/lib.rs#Greeter#greet]]` (Rust impl method), `[[src/app.go#Greeter#Greet]]` (Go method), `[[src/app.h#Greeter]]` (C struct). When prose names an implementation symbol or a behavior governed by one, link the symbol instead of using a bare code span or copying its literal value. Prefer `[[src/config.ts#DEFAULT_TIMEOUT]]` (or an aliased form) over a bare identifier or copied value. `lat check` validates these exist.
- **Code refs**: `// @lat: [[section-id]]` (JS/TS/Rust/Go/C/PHP) or `# @lat: [[section-id]]` (Python/PHP) — ties source code to concepts

# Diagrams

Default to prose. Reserve Mermaid diagrams for concepts involving more than seven interacting subjects (such as components, states, or stages) with complex sequencing, branching, or dependencies that prose alone makes hard to follow.

The subject count alone does not justify a diagram; omit diagrams for simple sequences or relationships that a short paragraph or list explains clearly. A diagram should give users and later agents an overview of the interactions.

Keep each diagram focused on one process, use readable labels, and explain the important decisions in surrounding prose with precise source-symbol links. Prefer a small overview or several focused diagrams over one dense diagram. Use fenced `mermaid` blocks and run `lat check` to validate syntax and readability.

# Test specs

Key tests can be described as sections in `lat.md/` files (e.g. `tests.md`). Add frontmatter to require that every leaf section is referenced by a `// @lat:` or `# @lat:` comment in test code:

```markdown
---
lat:
  require-code-mention: true
---
# Tests

Authentication and authorization test specifications.

## User login

Verify credential validation and error handling for the login endpoint.

### Rejects expired tokens
Tokens past their expiry timestamp are rejected with 401, even if otherwise valid.

### Handles missing password
Login request without a password field returns 400 with a descriptive error.
```

Every section MUST have a description — at least one sentence explaining what the test verifies and why. Empty sections with just a heading are not acceptable. (This is a specific case of the general leading paragraph rule below.)

Each test in code should reference its spec with exactly one comment placed next to the relevant test — not at the top of the file:

```python
# @lat: [[tests#User login#Rejects expired tokens]]
def test_rejects_expired_tokens():
    ...

# @lat: [[tests#User login#Handles missing password]]
def test_handles_missing_password():
    ...
```

Do not duplicate refs. One `@lat:` comment per spec section, placed at the test that covers it. `lat check` will flag any spec section not covered by a code reference, and any code reference pointing to a nonexistent section.

# Section structure

Concise opening paragraphs give every section a stable overview for validation and discovery.

Every section in `lat.md/` **must** have a leading paragraph — at least one sentence immediately after the heading, before any child headings or other block content. The first paragraph must be ≤250 characters (excluding `[[wiki link]]` content). This paragraph serves as the section's overview and is used in search results, command output, and RAG context — keeping it concise guarantees the section's essence is always captured.

```markdown
# Good Section

Brief overview of what this section documents and why it matters.

More detail can go in subsequent paragraphs, code blocks, or lists.

## Child heading

Details about this child topic.
```

```markdown
# Bad Section

## Child heading

Details about this child topic.
```

The second example is invalid because `Bad Section` has no leading paragraph. `lat check` validates this rule and reports errors for missing or overly long leading paragraphs.
%% lat:end %%

# Görev 17 — Owner hesabı ve ilk parola

Bu kayıt, seed edilmiş owner hesabının parola korumalı ilk kurulumunu ve Tauri oturum akışını izler.

## Araç ve model

Copilot SDK in VS Code; oturumda model adı görünmüyor.

## İstem

> SQLite başlangıç migration dosyasına kendi yönetici hesabımı `owner` rolüyle ekle:
> - İsim: Harun Ekici
> - E-posta: `harunekici@gmail.com`
> - Rol: owner (`active: true`)
>
> Profil sekmesindeki hızlı girişten bu kullanıcıyla giriş yapılmasını ve Tauri auth tohumlamasının `auth_me` ile bu kullanıcıyı döndürmesini sağla.

## Plan

- Var olan migration'ı değiştirmeden owner hesabı ve tüm mevcut izinleri ekleyen yeni idempotent migration oluştur.
- Tauri auth komutlarıyla yalnız seed edilmiş etkin owner için tek seferlik parola kurulumunu ve normal parola doğrulamalı girişi uygula.
- Yönetim giriş ekranını ve profil formunu Tauri auth akışına bağla; web profilinin yerel davranışını ve admin yetki sınırını koru.
- Auth/platform belgeleri ile Lat mimari kaydını güncelle; `bun run check`, `bun run build`, Rust testleri ve `lat check` çalıştır.
- Kullanıcı parola korumasını ve tek seferlik ilk parola kurulumunu onayladı.

## Düzeltmeler

- Otomatik owner oturumu ve yalnız e-posta ile kimlik kazanma güvenli olmadığından uygulanmadı. Tauri açılışında oturum boş kalır; ilk parola Tauri içinden kullanıcı tarafından belirlenir, sonraki açılışlarda normal e-posta/parola girişi gerekir.
- Kullanıcı e-postası `harunekici@gmail.com` olarak netleştirildi.

## Uygulama

- Yeni [`2026_10_27_000040_seed_owner_account.sql`](../../src-tauri/src/backend/migrations/2026_10_27_000040_seed_owner_account.sql) migration'ı etkin `Harun Ekici` owner hesabını ve mevcut izinleri ekler; var olan parolayı ezmez.
- İlk parola Rust tarafında Argon2id özeti olarak, etkin owner kaydı ve boş parola koşuluyla bir kez saklanır. Tauri oturumu yalnız başarılı kurulum veya parola girişinden sonra açılır.
- Yönetim giriş ekranı ile Tauri Profil formu kurulum/giriş durumunu gösterir; web hızlı girişi yönetici yetkisi vermez.
- Ayrıntılar: [`docs/backend.md`](../backend.md), [`docs/komutlar.md`](../komutlar.md), [`docs/platform-destegi.md`](../platform-destegi.md), [`lat.md/mimari.md`](../../lat.md/mimari.md).

## Doğrulama sonucu

- `bun run check` — 0 hata, 0 uyarı; mevcut `CanliRozet.tsx` React importu için 1 ipucu.
- `bun run build` — başarılı; 59 statik sayfa üretildi.
- `cargo test --manifest-path src-tauri/Cargo.toml --lib` — 9 test geçti.
- `git diff --check` — başarılı.
- `lat check` — tüm bilgi grafiği ve dokümantasyon doğrulamaları geçti.
- Tauri WebView'de parola kurulum ekranı ve profil girişi elle çalıştırılmadı.

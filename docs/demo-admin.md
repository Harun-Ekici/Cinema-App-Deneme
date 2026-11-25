# Test / Demo Yönetici Hesabı

> **Uyarı:** Bu hesap **yalnızca yerel geliştirme ve test amaçlıdır**. Kaynak kodlarda (`src/` ve `src-tauri/`) düz metin şifre tutulmaz; yerel SQLite veritabanında yalnızca Argon2id özeti saklanır.

## Giriş Bilgileri

| Alan | Değer |
|---|---|
| **Ad Soyad** | `Test Admin` |
| **E-posta (Kullanıcı Adı)** | `admin@cineq.test` |
| **Şifre** | `CineQAdmin2026!` |
| **Roller** | `admin`, `owner` |
| **Durum** | `active` |

## Notlar

- **Nerede kullanılır?** `bun run tauri dev` ile açılan Tauri uygulamasındaki `/admin` yönetim paneli ve `/profil` giriş ekranında kullanılır.
- **Yerel veritabanı konumu (Windows):** `%APPDATA%\com.cineq.app\app.sqlite` (depoya dahil edilmez).
- **Temiz kurulum / başka bilgisayar:** `app.sqlite` dosyası yalnızca bu makinedeki yerel veritabanındadır. Depo yeni bir ortamda ilk kez çalıştırıldığında, migration ile eklenen `harunekici@gmail.com` (`owner`) hesabı için arayüz üzerinden tek seferlik ilk parola belirlenebilir; ayrıntılar için bkz. [`docs/backend.md`](backend.md).
- **Web geliştirme modu (`bun run dev`):** Tauri dışı tarayıcı önizlemesinde yönetim paneli mock veri adaptörünü kullanır ve oturum girişi istemez.

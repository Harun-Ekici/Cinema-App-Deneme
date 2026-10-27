# Mimari Genel Bakış

CineQ; Astro statik rotalarını Svelte 5 arayüzleri, seçili React içerikleri ve Tauri v2 Rust uygulama kabuğuyla birleştirir.

Kanonik sayfa haritası [[docs/mimari-agac.md]] belgesinde; kodlama kuralları ve dizin sorumlulukları [[docs/kurallar.md]] ile [[docs/klasor-mimarisi.md]] belgelerinde tanımlanır.

## Katman Sınırları

Astro statik host rotaları, Svelte etkileşimli ekranları yönetir; ortak tipler `src/lib` altındadır. Müşteri vitrini [[src/lib/katalog.ts#vitrinFilmleriniYukle]] üzerinden [[src-tauri/src/backend/domain.rs#do_vitrin_katalog]] komutunu çağırır; tarayıcıda katalog mock fallback'i yoktur.

Rust komutunun sözleşmesi ve tipli hataları [[docs/komutlar.md]] içinde tanımlanır, [[src-tauri/src/lib.rs#bilet_hesapla]] tarafından uygulanır. Platforma özgü destek [[docs/platform-destegi.md]] içinde kaydedilir.

## Kalıcı Durum

Sepet ve bilet deneyimi, uzak hesap servisi yerine tarayıcı veya WebView yerel depolamasını kullanır. Sepet hesaplamaları ve değişiklikleri [[src/lib/sepet.svelte.ts]], bilet kayıtları [[src/lib/biletler.svelte.ts]] içinde yönetilir.

Bu sınır önemlidir: yerel kalıcılık ve tarayıcı demo sonucu, eşitlenmiş üretim rezervasyonu veya ödeme altyapısı anlamına gelmez.

## Yönetim Prototipi

`src/admin` müşteri rotalarından ayrılmış bir React + TypeScript yönetim panelidir; Tauri'de SQLite, tarayıcıda mock veri adaptörü kullanır.

[[src/pages/admin.astro]] prototipi Astro'nun React entegrasyonuyla yükler. [[src/admin/App.tsx#App]] hash tabanlı rotaları ve ekranları bağlar; bu yaklaşım statik dağıtımda ekran rotalarının aynı host sayfasına dönmesini sağlar. [[src/admin/components/AppShell.tsx#AppShell]] ortak gezinme, dil/tema kontrolleri ve bildirim alanını sunar.

[[src/admin/components/AdminAuthGate.tsx#AdminAuthGate]] Tauri ortamında oturumu ve gerekli okuma izinlerini doğrular; [[src/admin/data/tauriAdapter.ts#getAdminDataAdapter]] native ortamda dashboard ve tüm yönetim koleksiyonlarını SQLite'tan yükler, tarayıcıda ise prototip mock adaptörünü seçer. Film, salon, seans, büfe ürünü/menüsü ve müşteri yazımları CRUD komutlarına; seans iptali, sipariş iadesi ve PNR doğrulaması özel Rust komutlarına bağlıdır. Yönetim oturumları ve denetim kayıtları da gerçek SQLite kaynaklarından okunur. Dashboard bugünün verisi yoksa tüm dönem metriklerine döner. [[src/admin/AdminDataContext.tsx#AdminDataProvider]] veriyi ekranlara sağlar; [[src/admin/components/AdminErrorBoundary.tsx#AdminErrorBoundary]] ekran oluşturma hatalarını yalıtır ve seans çakışma hesabı bulunamayan film için 120 dakika varsayar. Seans fiyatları tam, öğrenci ve VIP tarifelerini taşır; panel haftalık takviminde lokasyon/şehir gösterir. [[src-tauri/src/backend/migrations/2026_10_27_000030_seed_admin_demo_data.sql]] katalog başlangıç verilerini oluşturur. Film formu boş tür seçimini ve yinelenen Türkçe film adını reddeder. Profilde yönetim bağlantısı yalnız [[src/admin/data/tauriAdapter.ts#authMe]] oturumundaki admin/owner rolü doğrulanınca görünür. Oturumdaki kullanıcı adı ve rol [[src/admin/components/AppShell.tsx#AppShell]] içinde gösterilir; profil menüsü oturumu kapatma ve müşteri arayüzüne dönüş sunar. Tipli seed verileri [[src/admin/api/seed.ts#seedData]], saf alan hesapları [[src/admin/domain/rules.ts#cakisiyorMu]] içinde tutulur; tema değişkenleri [[src/admin/styles/tokens.css]] dosyasındadır. Panel ikonları [[src/admin/components/AdminIcon.tsx#AdminIcon]] ile sunulur.

Tauri auth migration'ı [[src-tauri/src/backend/migrations/2026_10_27_000040_seed_owner_account.sql]] etkin owner hesabını parolasız ilk kurulum durumunda oluşturur; uygulama yeniden açıldığında otomatik oturum açılmaz. [[src-tauri/src/backend/auth.rs#owner_password_setup_required]] yalnız bu etkin owner kaydının parola beklediğini bildirir, [[src-tauri/src/backend/auth.rs#set_owner_initial_password]] Argon2id özetiyle parolayı bir kez kaydedip oturumu açar. Yönetim giriş ekranı ve Tauri profil formu bu akışı kullanır; web profilindeki yerel giriş yönetici yetkisi vermez.

# Mimari Genel Bakış

CineQ; Astro statik rotalarını Svelte 5 arayüzleri, seçili React içerikleri ve Tauri v2 Rust uygulama kabuğuyla birleştirir.

Kanonik sayfa haritası [[docs/mimari-agac.md]] belgesinde; kodlama kuralları ve dizin sorumlulukları [[docs/kurallar.md]] ile [[docs/klasor-mimarisi.md]] belgelerinde tanımlanır.

## Katman Sınırları

Astro statik rotaları, Svelte etkileşimli ekranları yönetir; ortak tipler `src/lib` altındadır. Tauri komutlarına [[src/lib/native.ts#biletHesapla]] üzerinden erişilir; modül tarayıcı demo yolunu da sağlar.

Rust komutunun sözleşmesi ve tipli hataları [[docs/komutlar.md]] içinde tanımlanır, [[src-tauri/src/lib.rs#bilet_hesapla]] tarafından uygulanır. Platforma özgü destek [[docs/platform-destegi.md]] içinde kaydedilir.

## Kalıcı Durum

Sepet ve bilet deneyimi, uzak hesap servisi yerine tarayıcı veya WebView yerel depolamasını kullanır. Sepet hesaplamaları ve değişiklikleri [[src/lib/sepet.svelte.ts]], bilet kayıtları [[src/lib/biletler.svelte.ts]] içinde yönetilir.

Bu sınır önemlidir: yerel kalıcılık ve tarayıcı demo sonucu, eşitlenmiş üretim rezervasyonu veya ödeme altyapısı anlamına gelmez.

## Yönetim Prototipi

`src/admin` Astro müşteri rotalarından ayrılmış, yerel mock verili bir React + TypeScript yönetim prototipidir.

[[src/pages/admin.astro]] prototipi Astro'nun React entegrasyonuyla yükler. [[src/admin/App.tsx#App]] hash tabanlı rotaları ve ekranları bağlar; bu yaklaşım statik dağıtımda ekran rotalarının aynı host sayfasına dönmesini sağlar. [[src/admin/components/AppShell.tsx#AppShell]] ortak gezinme, dil/tema kontrolleri ve bildirim alanını sunar.

[[src/admin/AdminDataContext.tsx#AdminDataProvider]] yükleme ve kalıcı güncelleme durumunu ekranlara sağlar. Yönetim bileşenleri [[src/admin/components]], sekiz özellik ekranı [[src/admin/features]] altındadır. Tipli seed koleksiyonları [[src/admin/api/seed.ts#seedData]], gecikmeli localStorage adaptörü [[src/admin/api/mockAdapter.ts#mockAdapter]], saf alan hesapları [[src/admin/domain/rules.ts#cakisiyorMu]] içinde tutulur; açık ve koyu tema değişkenleri [[src/admin/styles/tokens.css]] dosyasındadır. Paneldeki ortak dekoratif SVG ikonları [[src/admin/components/AdminIcon.tsx#AdminIcon]] tarafından sunulur; ölçüleri ve görünümü yönetim tokenlarıyla biçimlenir.

# Mimari Genel Bakış

CineQ; Astro statik rotalarını Svelte 5 arayüzleri, seçili React içerikleri ve Tauri v2 Rust uygulama kabuğuyla birleştirir.

Kanonik sayfa haritası [[docs/mimari-agac.md]] belgesinde; kodlama kuralları ve dizin sorumlulukları [[docs/kurallar.md]] ile [[docs/klasor-mimarisi.md]] belgelerinde tanımlanır.

## Katman Sınırları

Astro statik rotaları, Svelte etkileşimli ekranları yönetir; ortak tipler `src/lib` altındadır. Tauri komutlarına [[src/lib/native.ts#biletHesapla]] üzerinden erişilir; modül tarayıcı demo yolunu da sağlar.

Rust komutunun sözleşmesi ve tipli hataları [[docs/komutlar.md]] içinde tanımlanır, [[src-tauri/src/lib.rs#bilet_hesapla]] tarafından uygulanır. Platforma özgü destek [[docs/platform-destegi.md]] içinde kaydedilir.

## Kalıcı Durum

Sepet ve bilet deneyimi, uzak hesap servisi yerine tarayıcı veya WebView yerel depolamasını kullanır. Sepet hesaplamaları ve değişiklikleri [[src/lib/sepet.svelte.ts]], bilet kayıtları [[src/lib/biletler.svelte.ts]] içinde yönetilir.

Bu sınır önemlidir: yerel kalıcılık ve tarayıcı demo sonucu, eşitlenmiş üretim rezervasyonu veya ödeme altyapısı anlamına gelmez.

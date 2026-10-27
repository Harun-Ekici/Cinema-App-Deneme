# Keşiften Biletlemeye

CineQ'nin temel kullanıcı yolculuğu yerelleştirilmiş film listesinden detay rotasına, bilet ve büfe kalemlerini birleştiren sepete ve oluşturulan bilet kaydına ilerler.

Kanonik rota envanteri [[docs/mimari-agac.md]], bilet üretimi sözleşmesi [[docs/komutlar.md]] belgesindedir.

## Film Keşfi ve Detay

Vitrin [[src/lib/katalog.ts#vitrinFilmleriniYukle]] ile SQLite filmlerini listeler; genel detay rotası her film kimliğini ve ilgili filtreleri koruyarak açar. Geçersiz film kimliği açık hata durumuna geçer.

Seans seçimi aynı katalog kaydındaki gerçek salon haritasını, koridorları, VIP sıraları, kullanılamayan ve dolu/tutulmuş koltukları gösterir; VIP ücreti seans fiyatından hesaplanır. Rotalar [[docs/mimari-agac.md]] içinde tanımlanır.

## Sepet ve Bilet Kodu

Bilet ve büfe seçimleri aynı sepette toplanır; seans, koltuk ve tutar bilgileri yerel olarak saklanır.

Sepet hesaplamaları ve indirimler [[src/lib/sepet.svelte.ts]] tarafından yönetilir. Ödeme simülasyonundan sonra [[src/lib/biletler.svelte.ts#Biletlerim#satinAl]] siparişi SQLite'a yazar; yerel bilet geçmişi tutulmaz.

Tauri vitrini film, seans, salon haritası, koltuk doluluğu ve büfe kataloğunu [[src-tauri/src/backend/domain.rs#do_vitrin_katalog]] üzerinden okur. Misafir checkout aynı transaction içinde sipariş, bilet, dolu koltuk ve büfe stok değişikliklerini kaydeder; [[src/lib/biletler.svelte.ts#Biletlerim#yenile]] biletleri SQLite'tan listeler ve seans başlamadan siparişi iptal edebilir. Web checkout siparişi kaydetmez ve Tauri gereksinimini bildirir.

Kapı ekranı değişken salon kodunu, geçerli `HHmm` saatini ve altı alfanümerik karakteri kabul eder; [[src/admin/domain/rules.ts#pnrBicimi]] ile [[src-tauri/src/backend/domain.rs#pnr_gecerli_mi]] biçim kurallarını eşler.

## Liste Geri Bildirimi

Keşif ve bilet listeleri, desteklenen dört dilde yükleniyor, boş, hata ve dolu durumlarını gösterir. URL ile çalıştırılan geliştirme senaryoları ve kullanıcıya gösterilen durumlar [[docs/gelistirme-notlari.md]] içinde belgelenir.

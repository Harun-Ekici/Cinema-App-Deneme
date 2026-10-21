# Keşiften Biletlemeye

CineQ'nin temel kullanıcı yolculuğu yerelleştirilmiş film listesinden detay rotasına, bilet ve büfe kalemlerini birleştiren sepete ve oluşturulan bilet kaydına ilerler.

Kanonik rota envanteri [[docs/mimari-agac.md]], bilet üretimi sözleşmesi [[docs/komutlar.md]] belgesindedir.

## Film Keşfi ve Detay

Kullanıcılar örnek filmleri görüntüler ve süzer, film detay rotasını açar; ilgili liste sorgusu korunarak geri dönebilir. Geçersiz kimlikler boş detay sayfası yerine bulunamadı görünümüne yönelir.

Rota ve yerelleştirme ayrıntıları [[docs/mimari-agac.md]] ve tamamlanmış görev kaydı [[docs/istemler/14-detay-ekrani.md]] içinde tutulur.

## Sepet ve Bilet Kodu

Bilet ve büfe seçimleri aynı sepeti kullanır; toplamlar, desteklenen indirim kodları ve yerel kalıcılık [[src/lib/sepet.svelte.ts]] tarafından yönetilir. Bilet üretimi [[src/lib/native.ts#biletHesapla]] üzerinden tipli başarı veya hata döndürür.

Tauri ortamında köprü [[src-tauri/src/lib.rs#bilet_hesapla]] komutunu çağırır. Tarayıcıda aynı alanları taşıyan belirlenebilir bir demo sonucu döner; yerel komut hatası hata olarak kalır. Tamamlanan uygulama ve test kanıtı [[docs/istemler/15-rust-komutu.md]] içindedir.

## Liste Geri Bildirimi

Keşif ve bilet listeleri, desteklenen dört dilde yükleniyor, boş, hata ve dolu durumlarını gösterir. URL ile çalıştırılan geliştirme senaryoları ve kullanıcıya gösterilen durumlar [[docs/gelistirme-notlari.md]] içinde belgelenir.

# Geliştirme Notları

## Liste ekranı durumlarını sınama

Geliştirme sunucusu açıkken ana liste ekranını şu adreslerle açın:

- `http://127.0.0.1:1420/?durum=yukleniyor` — iskelet yüklenme görünümü
- `http://127.0.0.1:1420/?durum=hata` — hata görünümü; **Tekrar dene** parametreyi kaldırıp normal yüklemeyi başlatır
- `http://127.0.0.1:1420/?durum=bos` — boş liste görünümü
- `http://127.0.0.1:1420/?durum=dolu` — normal film listesi

Parametre geliştirme modunda okunur; üretim derlemesinde yok sayılır. Arama kutusuna eşleşmeyen bir ifade yazarak filtre boş durumunu, ardından **Filtreleri Temizle** düğmesini ayrıca deneyin.

Aynı parametreler `/biletlerim` ekranında da durum bileşenlerini sınar. `bos` görünümü kayıtlı biletleri değiştirmez. Dört dildeki metinleri sınamak için geliştirme araçlarında `<html lang>` değerini sırasıyla `tr`, `en`, `ar` ve `fa` yapıp sayfayı yenileyin. Arapça ve Farsça için `<html dir="rtl">`, Türkçe ve İngilizce için `<html dir="ltr">` değerini kullanın.

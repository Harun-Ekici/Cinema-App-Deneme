# Platform destegi

Bu matris, müşteri bilet akışı ile yönetim panelinin platform davranışını özetler. Film kataloğu, seanslar ve salon yerleşimi Tauri'de ortak SQLite kaynağından okunur; tarayıcı bu katalog için mock veri kullanmaz.

| Ozellik | Web | Windows | macOS | Linux | Android | iOS |
|---|---|---|---|---|---|---|
| Film kesfetme ve detaylarini SQLite'tan goruntuleme | Desteklenmiyor: SQLite katalog komutu yok | Destekleniyor: SQLite | Destekleniyor: SQLite | Destekleniyor: SQLite | Destekleniyor: SQLite | Destekleniyor: SQLite |
| Seans secimi, dinamik salon haritasi ve VIP fiyatlari | Desteklenmiyor: SQLite katalog komutu yok | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor |
| Sepete ekleme ve tarayici/yerel bilet kaydi | Farkli yolla: `localStorage` | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor |
| Bilet PNR ve dogrulama ozeti | Farkli yolla: deterministik web demo sonucu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu |
| Biletlerim ekraninda biletleri goruntuleme | Farkli yolla: `localStorage` | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor |
| Yonetim paneli oturum dogrulama ve yonetici girisi | Farkli yolla: mock oturum gerektirmez | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari |
| Seed owner icin ilk parola kurulumu ve parola dogrulamali profil girisi | Desteklenmiyor: gercek auth oturumu yok | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari | Destekleniyor: Tauri auth komutlari |
| Yonetim panelinde dashboard, film/sinema/salon listeleri | Farkli yolla: mock adaptoru | Destekleniyor: SQLite okuma | Destekleniyor: SQLite okuma | Destekleniyor: SQLite okuma | Destekleniyor: SQLite okuma | Destekleniyor: SQLite okuma |
| Yonetim panelinde film CRUD, yeni salon ve koltuk haritasi guncelleme | Farkli yolla: mock adaptoru | Destekleniyor: SQLite CRUD komutlari | Destekleniyor: SQLite CRUD komutlari | Destekleniyor: SQLite CRUD komutlari | Destekleniyor: SQLite CRUD komutlari | Destekleniyor: SQLite CRUD komutlari |
| Profilde admin paneline erisim | Desteklenmiyor: Tauri oturumu yok | Destekleniyor: auth_me rollerini denetler | Destekleniyor: auth_me rollerini denetler | Destekleniyor: auth_me rollerini denetler | Destekleniyor: auth_me rollerini denetler | Destekleniyor: auth_me rollerini denetler |

SQLite vitrin katalogu ve salon koltuk haritasi tarayicida desteklenmez; Tauri WebView gerektirir. `src/lib/native.ts` icindeki `destekleniyorMu("bilet_kodu_uret")` bilet alma eylemini platform bazinda denetler; bilinmeyen ozellik anahtarlari desteklenmiyor kabul edilir. `platform()` Tauri WebView kullanici aracisi uzerinden platformu belirler, Tauri disi calisma ortami `web` olarak bildirilir.

Tarayici sonucu gercek bir Rust/Tauri rezervasyonu degildir. Odeme de uygulamada simule edilir. Mobil ve masaustu hedeflerinde yerel komut ve arayuz davranisi hedef platformda ayri olarak elle denenmelidir; bu gorevin yerel derleme/test sonucu fiziksel platform testinin yerine gecmez.

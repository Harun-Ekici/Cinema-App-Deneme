# Platform destegi

Bu matris, bilet satin alma ve PNR uretimi akisini kapsar. Yerel Tauri komutu bes hedef platformda ortak Rust mantigiyla calisir; web'de uygulama coker veya rastgele PNR uretmek yerine deterministik demo sonucu verir.

| Ozellik | Web | Windows | macOS | Linux | Android | iOS |
|---|---|---|---|---|---|---|
| Film kesfetme ve detaylarini goruntuleme | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor |
| Sepete ekleme ve tarayici/yerel bilet kaydi | Farkli yolla: `localStorage` | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor |
| Bilet PNR ve dogrulama ozeti | Farkli yolla: deterministik web demo sonucu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu | Destekleniyor: Rust komutu |
| Biletlerim ekraninda biletleri goruntuleme | Farkli yolla: `localStorage` | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor | Destekleniyor |

Bu gorev kapsaminda ozellikleri dislayan bir platform yoktur. `src/lib/native.ts` icindeki `destekleniyorMu("bilet_kodu_uret")` bilet alma eylemini platform bazinda denetler; bilinmeyen ozellik anahtarlari desteklenmiyor kabul edilir. `platform()` Tauri WebView kullanici aracisi uzerinden platformu belirler, Tauri disi calisma ortami `web` olarak bildirilir.

Tarayici sonucu gercek bir Rust/Tauri rezervasyonu degildir. Odeme de uygulamada simule edilir. Mobil ve masaustu hedeflerinde yerel komut ve arayuz davranisi hedef platformda ayri olarak elle denenmelidir; bu gorevin yerel derleme/test sonucu fiziksel platform testinin yerine gecmez.

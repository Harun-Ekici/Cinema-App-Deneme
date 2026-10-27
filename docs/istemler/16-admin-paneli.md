# Görev 16 — Yönetim paneli

Bu kayıt, bağımsız yönetim prototipinin istem ve doğrulamalarını izler; tasarım sözleşmesinin tek kaynağı [cineq-react-gorev.md](../../cineq-react-gorev.md) dosyasıdır.

## Araç ve model

Copilot SDK in VS Code; oturumda model adı görünmüyor.

## İstem

> Proje kökündeki `cineq-react-gorev.md` dosyasını tek kaynak kabul et.
>
> 1. Ana müşteri arayüzüne dokunmadan tüm paneli `src/admin/` klasörü altına bağımsız bir React + TypeScript prototipi olarak kur.
> 2. İlk adımda temel mimariyi hazırla:
>    - `src/admin/styles/tokens.css` (C bölümündeki CSS değişkenleri ve açık/koyu tema)
>    - `src/admin/domain/types.ts` ve `src/admin/domain/rules.ts` (D ve F bölümlerindeki çekirdek tipler ve kurallar)
>    - `src/admin/api/seed.ts` ve `src/admin/api/mockAdapter.ts` (D2 bölümündeki seed verileri ve mock adaptör)
> 3. Başlamadan önce oluşturacağın dosya listesini ve planını kısaca özetle.
>
> [ÖNEMLİ KURAL: Kesinlikle ana projeye, mevcut sayfalara ve müşteri arayüzüne dokunmuyorsun. Bu modül `src/admin/` altında tamamen bağımsız bir sayfa/prototip olacak.]

## Plan

- `src/admin/` altında yalnızca istenen beş temel dosyayı oluşturmak ve müşteri arayüzü ile mevcut sayfalara dokunmamak.
- C, D, D2 ve F sözleşmelerini görev dosyasından uygulamak; prototip sınırını [Lat mimari notunda](../../lat.md/mimari.md) kaydetmek.
- Plan kullanıcı tarafından onaylandı; görev günlüğü eklemek için ayrıca izin alındı.

## Düzeltmeler

Yok.

## Doğrulama sonucu

- `bun run check` — 0 hata; mevcut `CanliRozet.tsx` React importu için bir ipucu verdi.
- `bun run build` — başarılı; 54 statik sayfa üretildi.
- `lat check` — tüm doğrulamalar geçti.
- Seed sayıları, seans tarih aralığı, PNR ve koltuk verileri; mock adaptörün ilk seed yüklemesi, kalıcı değiştirme ve sıfırlama davranışı çalıştırılarak doğrulandı.
- `git diff --check` — boşluk/patch hatası bulunmadı.

## Aşama 2 — Yönetim paneli ekranları

Bu aşama ortak operasyon bileşenlerini ve sekiz ekranı bağımsız yönetim rotalarında birleştirir.

### İstem ve kapsam

- E ve G bölümlerine uygun ortak bileşenleri, Dashboard, Movies, Schedules, Auditoriums, Concessions, Orders, Gate ve Customers ekranlarını, `App.tsx` ile `main.tsx` girişlerini kur.
- Ana müşteri arayüzünü değiştirme. Kullanıcı `react-router-dom` bağımlılığına ve yalnızca yeni `/admin` Astro host rotasına izin verdi.
- Ortak veri bağlamı, arama/sıralama/sayfalama/seçim, filtreler, durum rozetleri, koltuk editörü, takvim ve PNR doğrulaması uygulandı.
- Statik Astro dağıtımında alt rotalar için sunucu fallback'i gerekmemesi amacıyla hash tabanlı React Router kullanılır; `/admin/` host sayfası aynı kalır.

### Doğrulama sonucu

- `bun run check` — 0 hata, 0 uyarı; mevcut `CanliRozet.tsx` React importu için bir ipucu verdi.
- `bun run build` — başarılı; 55 statik sayfa üretildi, yönetim host'u `/admin/index.html` olarak çıktı.
- Tarayıcıda sekiz ekran rotası açıldı; hash rotasında sayfa yenileme Film ekranını korudu.
- 390 px görünümde içerik yatay taşmadı; Arapça yönü RTL oldu ve tema geçişi çalıştı.
- Seed PNR ile kapı doğrulaması ve geçiş onayı denendi; geçiş verisi doğrulama sonrasında başlangıç durumuna döndürüldü.
- `lat check` — tüm doğrulamalar geçti.
- `git diff --check` — patch boşluk hatası yok; Git yalnızca LF/CRLF dönüşümü hakkında uyardı.

## Aşama 3 — Yönetim ikonları

### Uygulama

- Ortak SVG simgeleri, bağımlılık eklemeden yönetim paneline özel [AdminIcon](../../src/admin/components/AdminIcon.tsx) bileşeninde toplandı.
- Sidebar, durum rozetleri ve kartları, tablo arama/sıralama/sayfalama kontrolleri, satır eylemleri, salon/kapı, büfe ve koltuk görselleri aynı ikon setini kullanır.
- İkon ölçüleri `tokens.css` değişkenlerinden; renk ve hizalamalar `admin.css` içinde mevcut tema ve durum tokenlarından gelir.
- Müşteri arayüzü dosyaları değiştirilmedi.

### Doğrulama

- `bun run check` — 0 hata; `CanliRozet.tsx` için mevcut bir import ipucu.
- `bun run build` — başarılı; 55 statik sayfa üretildi.
- Tarayıcıda yönetim özeti ve Büfe ekranındaki ikonlar görsel olarak kontrol edildi.
- `lat check` — tüm doğrulamalar geçti.
- `git diff --check` — patch boşluk hatası bulunmadı.

## Aşama 4 — Tauri SQLite salt okunur entegrasyonu

### Uygulama

- `src/admin/data/tauriAdapter.ts`, mevcut `MockAdapter` sözleşmesini koruyarak Tauri veri adaptörü ve tarayıcı mock seçimini sağlar.
- Tauri paneli açılışta `auth_me` ile yetkili oturumu doğrular; giriş `auth_login` ile yapılır. Geliştirme derlemesinde ilk yönetici hesabı, veritabanındaki ilk hesap olması koşuluyla `auth_register` üzerinden oluşturulabilir.
- Dashboard metrikleri `cineq_dashboard`; filmler, sinemalar ve salonlar `crud_index` üzerinden SQLite'tan okunur. Bu koleksiyonların yazma eylemleri bu aşamada açıkça reddedilir; diğer prototip ekranları mock adaptörü kullanmayı sürdürür.
- `window.__TAURI__` işareti Tauri yapılandırmasında etkinleştirildi; bu işaret yoksa tarayıcı mock akışı korunur.

### Doğrulama

- `bun run check` — 0 hata, 0 uyarı; mevcut `CanliRozet.tsx` React importu için 1 ipucu.
- `bun run build` — başarılı; 55 statik sayfa üretildi.
- Tarayıcıda `/admin/` açılarak Tauri dışı mock fallback'in çalıştığı doğrulandı.
- `cargo test --lib backend --target-dir target/admin-tauri-integration` — 4 test geçti. Varsayılan hedef klasöründeki eski mutlak yol artefaktı nedeniyle temiz hedef klasörü kullanıldı.
- `lat check` — tüm doğrulamalar geçti.
- `git diff --check` — patch boşluk hatası bulunmadı.

## Aşama 5 — SQLite CRUD, oturum ve ekran sağlamlaştırma

### Uygulama

- Taze veritabanı için örnek katalog, sinema, salon ve seansları yeni idempotent migration ile ekle.
- Film ekleme/güncelleme ve yeni salon/koltuk haritası kaydetme akışlarını Tauri CRUD komutlarına bağla; tarayıcıda mock kalıcılığını koru.
- Seans ve salon ekranlarında eksik koleksiyonları güvenli boş listelere dönüştür; seans rotalarını React Error Boundary ile yalıt.
- Profilde `auth_me` kullanıcısının adını/rolünü göster; müşteri arayüzüne dönüş ve `auth_logout` seçenekleri ekle.
- Bekleyen sipariş rozetini veriden hesapla ve kapıda doğrulama bildirimini `/kapi` hash rotasına bağla.
- Dashboard günlük metrikleri boşsa tüm dönem sonucunu göster; uygulanan mimariyi `lat.md/mimari.md` içinde güncelle.

### Doğrulama sonucu

- `bun run check` — 0 hata; `CanliRozet.tsx` için mevcut bir import ipucu verdi.
- `bun run build` — başarılı; 55 statik sayfa üretildi.
- `cargo test --lib backend --target-dir target/admin-sqlite-fixes` (`src-tauri/` içinde) — 4 test geçti.
- `lat check` — tüm doğrulamalar geçti.
- `git diff --check` — geçti; Git yalnızca LF/CRLF dönüşümü hakkında uyardı.

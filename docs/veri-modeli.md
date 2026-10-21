# CineQ Veri Modeli

TypeScript alanlarının tek kaynak tanımları [`src/lib/types/`](../src/lib/types/) altında; örnek kayıtlar [`src/lib/data.ts`](../src/lib/data.ts) içindedir.

## Film

Tip: `Film` — [`film.ts`](../src/lib/types/film.ts)

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `id` | `number` | Evet | Uygulama içindeki film kimliği. |
| `baslik` | `string` | Evet | Filmin görünen adı. |
| `tur` | `FilmTur` | Evet | Sabit film türlerinden biri. |
| `durum` | `FilmDurum` | Evet | `vizyonda` veya `yakinda`. |
| `salonTipi` | `SalonTipi` | Evet | Film gösteriminde kullanılan salon formatı. |
| `sure` | `string` | Evet | Film süresi. |
| `imdb` | `number` | Evet | Örnek IMDb puanı. |
| `yasSiniri` | `YasSiniri` | Evet | Sabit yaş sınıflandırması. |
| `formatlar` | `string[]` | Evet | Ses, görüntü ve altyazı özellikleri. |
| `yonetmen` | `string` | Evet | Yönetmen adı. |
| `oyuncular` | `string[]` | Evet | Oyuncu adları. |
| `salon` | `string` | Evet | Mevcut arayüzün kullandığı salon metni. |
| `seanslar` | `string[]` | Evet | Mevcut arayüzle uyumlu saat listesi. |
| `renk` | `string` | Evet | Afiş arka plan CSS değeri. |
| `aciklama` | `string` | Evet | Kısa film özeti. |
| `biletler` | `BiletKategorisi[]` | Evet | Film için sunulan bilet türleri. |

## Seans

Tip: `Seans` — [`seans.ts`](../src/lib/types/seans.ts)

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `id` | `string` | Evet | Seansın benzersiz kimliği. |
| `filmId` | `number` | Evet | Gösterilen filme başvuru. |
| `tarih` | `string` | Evet | ISO-8601 tarih bilgisi. |
| `saat` | `string` | Evet | Yerel saat, `HH:mm` biçiminde. |
| `salon` | `string` | Evet | Gösterim salonu. |
| `format` | `SalonTipi` | Evet | `IMAX`, `3D`, `2D` veya `VIP Salon`. |
| `durum` | `SeansDurumu` | Evet | `planlandi`, `aktif`, `iptal` veya `tamamlandi`. |

## Bilet

Tip: `Bilet` — [`bilet.ts`](../src/lib/types/bilet.ts)

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `kod` | `string` | Evet | Benzersiz bilet doğrulama kodu. |
| `baslik` | `string` | Evet | Satın alma anındaki film adı. |
| `tarih` | `string` | Evet | Bilet oluşturulma tarihi, ISO-8601 biçiminde. |
| `seans` | `string` | Evet | Gösterim saati. |
| `salon` | `string` | Evet | Gösterim salonu. |
| `koltuklar` | `string[]` | Evet | Ayrılan koltuk kodları. |
| `kategori` | `string` | Evet | Satın alınan bilet türünün adı. |
| `adet` | `number` | Evet | Bilet adedi. |
| `vipKoltukSayisi` | `number` | Hayır | VIP ek fiyat hesabında kullanılan koltuk adedi. |
| `bufeOzet` | `string` | Hayır | İlişkili büfe sipariş özeti. |
| `indirimBilgi` | `string` | Hayır | İndirim kodu veya açıklaması. |
| `toplamTutar` | `number` | Evet | Bilet toplamı, Türk lirası cinsinden. |
| `filmId` | `number` | Hayır | Eski kayıtlarla uyumluluk için isteğe bağlı film başvurusu. |
| `seansId` | `string` | Hayır | Eski kayıtlarla uyumluluk için isteğe bağlı seans başvurusu. |
| `durum` | `BiletDurumu` | Hayır | `rezerve`, `onaylandi`, `kullanildi` veya `iptal`. |

## Büfe ürünü

Tip: `BufeUrunu` — [`bufe.ts`](../src/lib/types/bufe.ts)

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `id` | `string` | Evet | Ürünün benzersiz kimliği. |
| `ad` | `string` | Evet | Menüde görünen ürün adı. |
| `kategori` | `BufeKategori` | Evet | Sabit büfe kategorilerinden biri. |
| `fiyat` | `number` | Evet | Varsayılan fiyat, Türk lirası cinsinden. |
| `aciklama` | `string` | Evet | Ürünün kısa açıklaması. |
| `ikon` | `string` | Evet | Ürünü temsil eden simge. |
| `rozet` | `BufeRozet` | Hayır | İsteğe bağlı promosyon rozeti. |
| `porsiyonlar` | `BufePorsiyon[]` | Hayır | İsteğe bağlı porsiyon ve fiyat seçenekleri. |

## Yardımcı tipler

`BiletKategorisi` — [`bilet.ts`](../src/lib/types/bilet.ts)

| Alan | Tip | Açıklama |
|---|---|---|
| `ad` | `string` | Bilet türünün kullanıcıya gösterilen adı. |
| `fiyat` | `number` | Bilet türünün Türk lirası cinsinden fiyatı. |

`Koltuk` — [`bilet.ts`](../src/lib/types/bilet.ts)

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `string` | Koltuğun salon içi kodu. |
| `sira` | `string` | Koltuğun sıra harfi. |
| `no` | `number` | Koltuğun sıra içindeki numarası. |
| `durum` | `KoltukDurumu` | `bos`, `dolu` veya `secili`. |
| `kategori` | `KoltukKategorisi` | `standart` veya `vip`. |

`BiletSepetKalemi` — [`sepet.ts`](../src/lib/types/sepet.ts)

| Alan | Tip | Açıklama |
|---|---|---|
| `tur` | `"bilet"` | Sepet kaleminin bilet olduğunu belirtir. |
| `film` | `Film` | Seçilen film. |
| `bilet` | `BiletKategorisi` | Seçilen bilet türü ve fiyatı. |
| `seans` | `string` | Seçilen seans saati. |
| `salon` | `string` | Seçilen salon. |
| `koltuklar` | `string[]` | Seçilen koltuk kodları. |
| `adet` | `number` | Bilet adedi. |
| `vipKoltukSayisi` | `number` | VIP ek fiyat hesabındaki koltuk sayısı. |
| `toplamTutar` | `number` | Bilet kaleminin toplamı. |

`BufeSepetKalemi` — [`sepet.ts`](../src/lib/types/sepet.ts)

| Alan | Tip | Açıklama |
|---|---|---|
| `tur` | `"bufe"` | Sepet kaleminin büfe ürünü olduğunu belirtir. |
| `urun` | `BufeUrunu` | Sepete eklenen ürün. |
| `porsiyonAdi` | `string` | Varsa seçilen porsiyon adı. |
| `birimFiyat` | `number` | Seçilen porsiyonun fiyatı. |
| `adet` | `number` | Ürün adedi. |

Diğer sabit seçenek tipleri:

| Tip | Sabit değerler |
|---|---|
| `FilmDurum` | `vizyonda`, `yakinda` |
| `FilmTur` | `Aksiyon`, `Bilim Kurgu`, `Dram`, `Komedi`, `Animasyon` |
| `YasSiniri` | `+13`, `+18`, `Genel` |
| `SalonTipi` | `IMAX`, `3D`, `2D`, `VIP Salon` |
| `SeansDurumu` | `planlandi`, `aktif`, `iptal`, `tamamlandi` |
| `BiletDurumu` | `rezerve`, `onaylandi`, `kullanildi`, `iptal` |
| `KoltukDurumu` | `bos`, `dolu`, `secili` |
| `KoltukKategorisi` | `standart`, `vip` |
| `BufeKategori` | `Misir`, `Icecek`, `Menu`, `Atistirmalik` |
| `BufeRozet` | `Popüler`, `Fırsat`, `Çift Kişilik` |

## Tipler arası ilişkiler

| Kaynak | İlişki | Hedef | Açıklama |
|---|---|---|---|
| `Film.id` | 1 — çok | `Seans.filmId` | Bir film için birden fazla seans tanımlanabilir. |
| `Film.id` | 1 — çok (isteğe bağlı başvuru) | `Bilet.filmId` | Yeni örnek biletler film kimliği taşır; eski yerel bilet kayıtları bu alanı içermeyebilir. |
| `Seans.id` | 1 — çok (isteğe bağlı başvuru) | `Bilet.seansId` | Örnek biletler belirli seansa bağlanır; önceki yerel kayıtlarla uyumluluk için alan isteğe bağlıdır. |
| `Film` | 1 — çok | `Film.biletler` | Film bilet kategorilerini ve fiyatlarını listeler. |
| `BiletSepetKalemi` | çok — 1 | `Film`, `BiletKategorisi` | Bilet sepet kalemi seçilen filmi ve bilet türünü taşır. |
| `BufeSepetKalemi` | çok — 1 | `BufeUrunu` | Büfe sepet kalemi ürünü, seçilen porsiyonu ve fiyatı taşır. |
| `SepetKalemi` | birleşim | Bilet veya büfe kalemi | Sepet, iki kalem türünü ayırt edici `tur` alanıyla birleştirir. |

Film ve büfe ürün örnekleri, mevcut arayüzde kullanılan altı film ve altı büfe ürünü içerir. Ayrı seans ve bilet örnek listeleri de veri sözleşmesini göstermek üzere en az altı kayıt taşır.

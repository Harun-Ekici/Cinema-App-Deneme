# Rust komutlari

## Owner kimlik dogrulama komutlari

Seed edilmis owner hesabi uygulama acilisinda otomatik oturum almaz. Ilk parola yalniz kurulum bekleyen etkin owner kaydi icin bir kez belirlenir ve Rust tarafinda Argon2id ozeti olarak saklanir.

| Komut | Parametreler | Donus |
|---|---|---|
| `auth_owner_setup_required` | — | Ilk owner parolasinin beklenip beklenmedigini bildiren boolean |
| `auth_owner_set_initial_password` | `password` | Parolayi bir kez belirler ve owner kullanicisinin rollerini/izinlerini iceren oturumu dondurur |

## `vitrin_katalog`

Müşteri vitrini için gizli müşteri/sipariş alanlarını dışarı vermeden SQLite film kataloğunu ve gelecek seanslarının salon bilgilerini okur. Yönetici CRUD izni veya oturumu gerektirmez.

### Başarılı dönüş

`films` listesi her yayınlanabilir filmi içerir; seansı olmayan filmlerin `seanslar` listesi boştur. Seans kayıtları kimlik, başlangıç, dil, standart/VIP fiyatı, salon kimliği, koltuk haritası ve dolu ya da süresi dolmamış tutulmuş koltuk koordinatlarını taşır.

Tauri komutu `src/lib/katalog.ts` içindeki `vitrinFilmleriniYukle` tarafından çağrılır. Tarayıcıda katalog taklidi yapılmaz; adaptör desteklenmediğini açık hata olarak bildirir.

## `bilet_hesapla`

Sinema bileti icin PNR kodu ve dogrulama ozeti uretir. Tauri komutu yalnizca `src/lib/native.ts` icinden cagirilir.

### Girdi

`BiletGirdisi` alanlari:

| Alan | Tur | Kurallar |
|---|---|---|
| `filmAdi` | `string` | Bos veya yalnizca bosluklardan olusamaz. |
| `salon` | `string` | Bos olamaz; PNR kodunda ASCII harf/rakam olmayan karakterler ayiklanir. |
| `seans` | `string` | 24 saat biçiminde `HH:MM` olmali. |
| `adet` | `number` | Pozitif tam sayi olmali. |

Tauri komutunun Rust imzasi: `bilet_hesapla(girdi: BiletGirdisi) -> Result<BiletSonucu, BiletHatasi>`.

### Basarili donus

`BiletSonucu` alanlari:

| Alan | Tur | Aciklama |
|---|---|---|
| `pnrKodu` | `string` | `CNQ-...` biçiminde uretilen PNR kodu. |
| `filmAdi` | `string` | Bosluklari kirpilmis film adi. |
| `salon` | `string` | Kirpilmis salon adi. |
| `seans` | `string` | Dogrulanan seans saati. |
| `adet` | `number` | Bilet adedi. |
| `dogrulamaOzeti` | `string` | Bilet bilgisini ozetleyen metin. |

### Hata donusu

Hatalar serilestirilebilir, `kod` alaniyla etiketlenmis enum degerleridir:

| `kod` | Anlami |
|---|---|
| `film_adi_bos` | Film adi girilmemis. |
| `salon_gecersiz` | Salon bilgisi bos veya kodlanamaz. |
| `seans_gecersiz` | Seans `HH:MM` degil veya saat araligi disinda. |
| `bilet_adedi_gecersiz` | Bilet adedi sifir ya da negatif. |
| `sistem_saati_gecersiz` | Sistem saati epoch sonrasina donusturulemiyor. |

Tarayici modunda Rust komutu calismaz; `native.ts` ayni sonuc alanlarini tasiyan deterministik bir demo sonucu dondurur. Gercek Tauri cagrisinin hatasi demo sonucuna donusturulmez.

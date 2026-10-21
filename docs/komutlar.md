# Rust komutlari

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

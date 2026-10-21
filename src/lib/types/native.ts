export interface BiletGirdisi {
  filmAdi: string; // Bilet üretilecek filmin görünen adı.
  salon: string; // Biletin kullanılacağı salon adı.
  seans: string; // Seans saati HH:MM biçimindedir.
  adet: number; // Üretilecek bilet adedi.
}

export interface BiletSonucu {
  pnrKodu: string; // Rezervasyon için üretilen PNR kodu.
  filmAdi: string; // Biletin bağlı olduğu filmin adı.
  salon: string; // Biletin kullanılacağı salon.
  seans: string; // Biletin bağlı olduğu seans saati.
  adet: number; // Üretilen bilet adedi.
  dogrulamaOzeti: string; // Kullanıcıya gösterilecek doğrulama özeti.
}

export type BiletHatasi =
  | { kod: "film_adi_bos" }
  | { kod: "salon_gecersiz" }
  | { kod: "seans_gecersiz" }
  | { kod: "bilet_adedi_gecersiz" }
  | { kod: "sistem_saati_gecersiz" };

export type NativeHatasi = BiletHatasi | { kod: "komut_basarisiz" };

export type BiletKomutSonucu =
  | { ok: true; sonuc: BiletSonucu }
  | { ok: false; hata: NativeHatasi };

export type CineQPlatform = "web" | "windows" | "macos" | "linux" | "android" | "ios";

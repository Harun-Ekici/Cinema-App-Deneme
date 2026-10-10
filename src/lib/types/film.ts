// CineQ Film Veri Tipleri
export type FilmDurum = "vizyonda" | "yakinda";
export type SalonTipi = "IMAX" | "3D" | "2D" | "VIP Salon";
export type FilmTur = "Aksiyon" | "Bilim Kurgu" | "Dram" | "Komedi" | "Animasyon";
export type YasSiniri = "+13" | "+18" | "Genel";

export interface BiletKategorisi {
  ad: string;
  fiyat: number;
}

export interface Film {
  id: number;
  baslik: string;
  tur: FilmTur;
  durum: FilmDurum;
  salonTipi: SalonTipi;
  sure: string;
  imdb: number;
  yasSiniri: YasSiniri;
  formatlar: string[];
  yonetmen: string;
  oyuncular: string[];
  salon: string;
  seanslar: string[];
  renk: string;
  aciklama: string;
  biletler: BiletKategorisi[];
}

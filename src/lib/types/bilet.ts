// CineQ Bilet ve Koltuk Tipleri
export type KoltukDurumu = "bos" | "dolu" | "secili";
export type KoltukKategorisi = "standart" | "vip";

export interface Koltuk {
  id: string; // "A3"
  sira: string; // "A"
  no: number; // 3
  durum: KoltukDurumu;
  kategori: KoltukKategorisi;
}

export interface Bilet {
  kod: string; // "CNQ-S3-2130-7F4K2Q"
  filmBaslik: string;
  tarih: string;
  seans: string;
  salon: string;
  koltuklar: string[];
  kategori: string;
  adet: number;
  vipKoltukSayisi?: number;
  bufeOzet?: string;
  indirimBilgi?: string;
  toplamTutar: number;
}

export type SalonTipi = "IMAX" | "3D" | "2D" | "VIP Salon";
export type SeansDurumu = "planlandi" | "aktif" | "iptal" | "tamamlandi";

export interface Seans {
  id: string; // Seansın benzersiz kimliği.
  filmId: number; // Seansın gösterdiği filmin kimliği.
  tarih: string; // Seansın tarihi ISO-8601 biçiminde.
  saat: string; // Seansın yerel saat bilgisi, HH:mm biçiminde.
  salon: string; // Gösterimin yapılacağı salon adı.
  format: SalonTipi; // Seansın sabit salon formatı seçeneklerinden biri.
  durum: SeansDurumu; // Seansın sabit yayın ve tamamlanma durumlarından biri.
}

export interface VitrinKoltukHaritasi {
  satir: number;
  sutun: number;
  koridorSutunlari: number[];
  vipSatirlari: number[];
  kullanilamaz: { satir: number; sutun: number }[];
}

export interface VitrinSeansi {
  id: string;
  salonId: string;
  baslangic: string;
  dil: string;
  altyazi?: string;
  fiyat: { standart: number; tam: number; ogrenci: number; vip: number };
  salon: {
    id: string;
    numara: number;
    ad: string;
    tip: SalonTipi;
    sinema: string;
    sehir: string;
    harita: VitrinKoltukHaritasi;
  };
  doluKoltuklar: { satir: number; sutun: number }[];
}

// CineQ Sinema Büfe Veri Tipleri
export type BufeKategori = "Misir" | "Icecek" | "Menu" | "Atistirmalik";
export type BufeRozet = "Popüler" | "Fırsat" | "Çift Kişilik";

export interface BufePorsiyon {
  ad: string; // "Küçük" | "Orta" | "Büyük"
  fiyat: number;
}

export interface BufeUrunu {
  id: string;
  ad: string;
  kategori: BufeKategori;
  fiyat: number;
  aciklama: string;
  ikon: string;
  rozet?: BufeRozet;
  porsiyonlar?: BufePorsiyon[];
}

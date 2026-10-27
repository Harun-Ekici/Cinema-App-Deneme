export type BufeKategori = "Misir" | "Icecek" | "Menu" | "Atistirmalik";
export type BufeRozet = "Popüler" | "Fırsat" | "Çift Kişilik";

export interface BufePorsiyon {
  ad: string; // Büfe ürününün seçilebilir porsiyon adı.
  fiyat: number; // Porsiyonun Türk lirası cinsinden fiyatı.
}

export interface BufeUrunu {
  id: string; // Büfe ürününün benzersiz kimliği.
  menuId?: string;
  ad: string; // Ürünün menüde görünen adı.
  kategori: BufeKategori; // Ürünün sabit büfe kategori seçeneklerinden biri.
  boyut?: string;
  stok?: number;
  fiyat: number; // Ürünün varsayılan Türk lirası fiyatı.
  aciklama: string; // Ürün içeriğini açıklayan kısa metin.
  ikon: string; // Ürünü temsil eden simge.
  rozet?: BufeRozet; // Ürün için isteğe bağlı tanıtım rozeti.
  porsiyonlar?: BufePorsiyon[]; // Ürünün isteğe bağlı porsiyon ve fiyat seçenekleri.
}

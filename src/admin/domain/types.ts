export type Lang = "tr" | "en" | "ar" | "fa" | "de";
export type AdminRole = "owner" | "support" | "content" | "viewer";

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListQuery {
  search?: string;
  page: number;
  pageSize: 10 | 25 | 50;
  sort?: { key: string; dir: "asc" | "desc" };
  filters?: Record<string, string | string[] | number | boolean | undefined>;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  lang: Lang;
  status: "new" | "in-progress" | "answered" | "spam";
  assignee?: string;
  createdAt: string;
  replies: { id: string; authorId: string; body: string; at: string; internal: boolean }[];
}

export interface ContentPage {
  id: string;
  slug: "hakkinda" | "gizlilik" | "kosullar" | "iletisim";
  lang: Lang;
  title: string;
  body: string;
  status: "draft" | "published";
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt?: string;
}

export interface AuditLogEntry {
  id: string;
  at: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}

export type FilmDurumu = "vizyonda" | "yakinda" | "arsiv";
export type Tur = "Aksiyon" | "Dram" | "Animasyon" | "Bilim Kurgu" | "Komedi" | "Gerilim" | "Belgesel";
export type SalonTipi = "IMAX" | "2D" | "3D";
export type KoltukKategorisi = "standart" | "vip";
export type KoltukDurumu = "bos" | "dolu" | "secili" | "kullanilamaz";
export type SiparisDurumu = "bekliyor" | "odendi" | "kullanildi" | "iptal" | "iade";

export interface Film {
  id: number;
  ad: Partial<Record<"tr" | "en" | "de" | "ar", string>> & { tr: string };
  afis?: string;
  gradyan: string;
  sinopsis: string;
  yonetmen: string;
  oyuncular: string[];
  sureDk: number;
  turler: Tur[];
  imdb?: number;
  yasSiniri: number;
  durum: FilmDurumu;
}

export interface Sinema {
  id: string;
  ad: string;
  sehir: string;
  adres: string;
}

export interface KoltukHaritasi {
  satir: number;
  sutun: number;
  koridorSutunlari: number[];
  vipSatirlari: number[];
  kullanilamaz: { satir: number; sutun: number }[];
}

export interface Salon {
  id: string;
  sinemaId: string;
  numara: number;
  ad: string;
  tip: SalonTipi;
  harita: KoltukHaritasi;
  durum: "taslak" | "yayinda";
}

export interface Seans {
  id: string;
  filmId: number;
  salonId: string;
  baslangic: string;
  dil: "tr" | "en" | "de" | "ar";
  altyazi?: "tr" | "en" | "de" | "ar";
  fiyat: Record<KoltukKategorisi, number>;
  iptal?: { neden: string; at: string };
}

export interface KoltukRezervasyonu {
  seansId: string;
  satir: number;
  sutun: number;
  durum: Exclude<KoltukDurumu, "kullanilamaz">;
  siparisId?: string;
  tutmaBitis?: string;
}

export type BufeKategori = "misir" | "icecek" | "atistirmalik" | "menu";

export interface BufeUrunu {
  id: string;
  ad: Record<"tr" | "en" | "de" | "ar", string>;
  kategori: BufeKategori;
  boyut?: "Küçük" | "Orta" | "Büyük";
  fiyat: number;
  stok: number;
  aktif: boolean;
}

export interface BufeMenusu {
  id: string;
  ad: string;
  icerik: { urunId: string; adet: number }[];
  fiyat: number;
  aktif: boolean;
}

export interface Bilet {
  kod: string;
  seansId: string;
  satir: number;
  sutun: number;
  kategori: KoltukKategorisi;
  fiyat: number;
}

export interface Siparis {
  id: string;
  musteriId: string;
  biletler: Bilet[];
  bufe: { urunId?: string; menuId?: string; adet: number; birimFiyat: number }[];
  toplam: number;
  durum: SiparisDurumu;
  olusturma: string;
  kullanimZamani?: string;
}

export interface Musteri {
  id: string;
  ad: string;
  eposta: string;
  favoriFilmler: number[];
  siparisSayisi: number;
  durum: "aktif" | "engelli";
  kayit: string;
}

export interface Kampanya {
  id: string;
  ad: string;
  tur: "yuzde" | "tutar" | "n-al-m-ode";
  deger: number;
  kapsam: "bilet" | "bufe" | "ikisi";
  baslangic: string;
  bitis: string;
  durum: "taslak" | "aktif" | "bitti";
}

export interface AbonelikPlani {
  id: string;
  ad: string;
  aylikFiyat: number;
  ayricalik: string[];
  durum: "taslak" | "aktif" | "kapali";
}

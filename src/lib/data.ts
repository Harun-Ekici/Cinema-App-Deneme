import type { BufeUrunu } from "./types";

export const bufeUrunleri: BufeUrunu[] = [
  {
    id: "misir-buyuk",
    ad: "Büyük Boy Patlamış Mısır",
    kategori: "Misir",
    fiyat: 120,
    aciklama: "Taze patlatılmış sıcak sinema mısırı (Tuzlu veya Karamelli)",
    ikon: "🍿",
    rozet: "Popüler",
    porsiyonlar: [
      { ad: "Küçük", fiyat: 85 },
      { ad: "Orta", fiyat: 105 },
      { ad: "Büyük Boy", fiyat: 120 },
    ],
  },
  {
    id: "menu-mega",
    ad: "Mega Sinema Menüsü",
    kategori: "Menu",
    fiyat: 210,
    aciklama: "1 Büyük Mısır + 1 Litrelik Soğuk İçecek",
    ikon: "🎬",
    rozet: "Fırsat",
    porsiyonlar: [
      { ad: "Tek Kişilik Menü", fiyat: 175 },
      { ad: "Mega Menü", fiyat: 210 },
      { ad: "Çift Kişilik Duble Menü", fiyat: 280 },
    ],
  },
  {
    id: "icecek-kutu",
    ad: "Soğuk Meşrubat Çeşitleri",
    kategori: "Icecek",
    fiyat: 65,
    aciklama: "Kola, Fanta, Sprite veya Soğuk Çay",
    ikon: "🥤",
    porsiyonlar: [
      { ad: "Kutu (330ml)", fiyat: 65 },
      { ad: "Büyük Bardak (500ml)", fiyat: 80 },
    ],
  },
  {
    id: "nachos-peynir",
    ad: "Nachos & Sıcak Peynir Sosu",
    kategori: "Atistirmalik",
    fiyat: 135,
    aciklama: "Çıtır mısır cipsi ve eritilmiş ılık cheddar sosu",
    ikon: "🧀",
    rozet: "Popüler",
  },
  {
    id: "tatli-paketi",
    ad: "Sinema Şekerleme Paketi",
    kategori: "Atistirmalik",
    fiyat: 95,
    aciklama: "Jelibon ve çikolata draje ikilisi",
    ikon: "🍫",
    rozet: "Fırsat",
  },
  {
    id: "dondurma-kup",
    ad: "Çikolatalı Dondurma",
    kategori: "Atistirmalik",
    fiyat: 80,
    aciklama: "Sinema keyfi için tek porsiyon çikolatalı dondurma",
    ikon: "🍦",
  },
];

export const tl = (tutar: number): string =>
  tutar.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export const tarihYaz = (iso: string): string =>
  new Date(iso).toLocaleString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

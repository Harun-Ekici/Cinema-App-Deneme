import type {
  AdminUser,
  AdminAuthSession,
  AuditLogEntry,
  BufeKategori,
  BufeMenusu,
  BufeUrunu,
  ContactMessage,
  Film,
  Kampanya,
  KoltukHaritasi,
  KoltukRezervasyonu,
  Musteri,
  Salon,
  Seans,
  Siparis,
  Sinema,
} from "../domain/types";
import { koltukKategorisi, kullanilabilirKoltuklar, pnrUret } from "../domain/rules";

const bugun = new Date();
bugun.setHours(0, 0, 0, 0);

function tarihSaat(gunSonrasi: number, saat: number): string {
  const tarih = new Date(bugun);
  tarih.setDate(tarih.getDate() + gunSonrasi);
  tarih.setHours(saat, 0, 0, 0);
  const yil = tarih.getFullYear();
  const ay = String(tarih.getMonth() + 1).padStart(2, "0");
  const gun = String(tarih.getDate()).padStart(2, "0");
  const saatMetni = String(tarih.getHours()).padStart(2, "0");
  return `${yil}-${ay}-${gun}T${saatMetni}:00`;
}

function tarih(gunSonrasi: number): string {
  return tarihSaat(gunSonrasi, 0).slice(0, 10);
}

const turler: Film["turler"][] = [
  ["Bilim Kurgu", "Aksiyon"],
  ["Dram"],
  ["Animasyon", "Komedi"],
  ["Gerilim"],
  ["Belgesel"],
  ["Aksiyon"],
  ["Bilim Kurgu", "Dram"],
  ["Komedi"],
  ["Animasyon"],
  ["Gerilim", "Aksiyon"],
  ["Dram"],
  ["Bilim Kurgu"],
];

export const filmlerSeed: Film[] = Array.from({ length: 12 }, (_, index) => {
  const id = index + 1;
  const yakinda = index >= 8;
  const turListesi = turler[index];
  if (!turListesi) {
    throw new Error(`Film türü seed kaydı eksik: ${id}`);
  }

  return {
    id,
    ad: {
      tr: index === 0 ? "Örnek Film" : [
        "Kızıl Ufkun Ötesi",
        "Sessiz Liman",
        "Bulutların Altında",
        "Son Perde",
        "Derin Zaman",
        "Kayıp Nota",
        "Yıldız Haritası",
        "Küçük Büyük Yolculuk",
        "Yarınki Şehir",
        "Cam Orman",
        "Mavi Frekans",
        "Uzak İstasyon",
      ][index] ?? `Kurgu Filmi ${id}`,
      en: index === 0 ? "Sample Film" : [
        "Beyond the Red Horizon",
        "Quiet Harbor",
        "Beneath the Clouds",
        "The Final Scene",
        "Deep Time",
        "The Lost Note",
        "Map of Stars",
        "A Small Big Journey",
        "City of Tomorrow",
        "Glass Forest",
        "Blue Frequency",
        "Far Station",
      ][index] ?? `Fiction Film ${id}`,
    },
    gradyan: "linear-gradient(135deg, var(--renk-ana), var(--renk-koyu))",
    sinopsis: index === 0 ? "Kısa örnek özet." : `${id}. kurgu film için hazırlanmış kısa ve özgün özet.`,
    yonetmen: index === 0 ? "Örnek Yönetmen" : `Kurgu Yönetmen ${id}`,
    oyuncular: index === 0 ? ["Örnek Oyuncu 1", "Örnek Oyuncu 2"] : [`Kurgu Oyuncu ${id}A`, `Kurgu Oyuncu ${id}B`],
    sureDk: index === 0 ? 118 : 96 + ((index * 11) % 47),
    turler: turListesi,
    imdb: index === 0 ? 7.4 : Number((6.2 + ((index * 3) % 34) / 10).toFixed(1)),
    yasSiniri: index === 0 ? 13 : ([0, 7, 13, 16, 18][index % 5] ?? 13),
    durum: yakinda ? "yakinda" : "vizyonda",
  };
});

const ilkFilm = filmlerSeed[0];
if (!ilkFilm) {
  throw new Error("Örnek film seed kaydı eksik.");
}
export const ornekFilm: Film = ilkFilm;

export const sinemalarSeed: Sinema[] = [
  { id: "sinema-1", ad: "CineQ Merkez", sehir: "İstanbul", adres: "Örnek Mahallesi, Sinema Caddesi 10" },
  { id: "sinema-2", ad: "CineQ Kıyı", sehir: "İzmir", adres: "Örnek Mahallesi, Kıyı Sokak 24" },
];

export const ornekHarita: KoltukHaritasi = {
  satir: 10,
  sutun: 14,
  koridorSutunlari: [6],
  vipSatirlari: [8, 9],
  kullanilamaz: [{ satir: 0, sutun: 0 }, { satir: 0, sutun: 13 }],
};

export const salonlarSeed: Salon[] = [
  { id: "salon-1", sinemaId: "sinema-1", numara: 1, ad: "Salon S1", tip: "IMAX", harita: structuredClone(ornekHarita), durum: "yayinda" },
  { id: "salon-2", sinemaId: "sinema-1", numara: 2, ad: "Salon S2", tip: "2D", harita: structuredClone(ornekHarita), durum: "yayinda" },
  { id: "salon-3", sinemaId: "sinema-1", numara: 3, ad: "Salon S3", tip: "3D", harita: structuredClone(ornekHarita), durum: "yayinda" },
  { id: "salon-4", sinemaId: "sinema-2", numara: 1, ad: "Salon S1", tip: "2D", harita: structuredClone(ornekHarita), durum: "yayinda" },
  { id: "salon-5", sinemaId: "sinema-2", numara: 2, ad: "Salon S2", tip: "3D", harita: structuredClone(ornekHarita), durum: "taslak" },
];

export const seanslarSeed: Seans[] = Array.from({ length: 40 }, (_, index) => {
  const gunIndeksi = index % 7;
  const seansSirasi = Math.floor(index / 7);
  const salonIndeksi = (seansSirasi + gunIndeksi) % salonlarSeed.length;
  const salon = salonlarSeed[salonIndeksi];
  const film = filmlerSeed[index % filmlerSeed.length];
  if (!salon || !film) {
    throw new Error(`Seans seed kaydı eksik: ${index + 1}`);
  }

  return {
    id: `seans-${String(index + 1).padStart(3, "0")}`,
    filmId: film.id,
    salonId: salon.id,
    baslangic: tarihSaat(gunIndeksi, seansSirasi < 5 ? 13 : 18),
    dil: (["tr", "en", "de", "ar"] as const)[index % 4] ?? "tr",
    altyazi: index % 2 === 0 ? "tr" : "en",
    fiyat: { standart: 180 + (index % 5) * 10, vip: 280 + (index % 5) * 10 },
  };
});

export const ornekSeans: Seans = {
  id: "s-001",
  filmId: 1,
  salonId: "salon-3",
  baslangic: tarihSaat(0, 21).replace(":00", ":30"),
  dil: "tr",
  altyazi: "en",
  fiyat: { standart: 220, vip: 340 },
};

const urunAdlari: { ad: BufeUrunu["ad"]; kategori: BufeKategori; boyut?: BufeUrunu["boyut"]; fiyat: number }[] = [
  { ad: { tr: "Mısır", en: "Popcorn", de: "Popcorn", ar: "فشار" }, kategori: "misir", boyut: "Orta", fiyat: 120 },
  { ad: { tr: "Kola", en: "Cola", de: "Cola", ar: "كولا" }, kategori: "icecek", boyut: "Büyük", fiyat: 80 },
  { ad: { tr: "Tuzlu Mısır", en: "Salted Popcorn", de: "Salziges Popcorn", ar: "فشار مملح" }, kategori: "misir", boyut: "Büyük", fiyat: 145 },
  { ad: { tr: "Su", en: "Water", de: "Wasser", ar: "ماء" }, kategori: "icecek", boyut: "Küçük", fiyat: 35 },
  { ad: { tr: "Limonata", en: "Lemonade", de: "Limonade", ar: "ليموناضة" }, kategori: "icecek", boyut: "Orta", fiyat: 70 },
  { ad: { tr: "Çikolata", en: "Chocolate", de: "Schokolade", ar: "شوكولاتة" }, kategori: "atistirmalik", fiyat: 55 },
  { ad: { tr: "Nachos", en: "Nachos", de: "Nachos", ar: "ناتشوز" }, kategori: "atistirmalik", fiyat: 95 },
  { ad: { tr: "Meyve Suyu", en: "Fruit Juice", de: "Fruchtsaft", ar: "عصير فواكه" }, kategori: "icecek", boyut: "Orta", fiyat: 65 },
  { ad: { tr: "Karamelli Mısır", en: "Caramel Popcorn", de: "Karamell-Popcorn", ar: "فشار بالكراميل" }, kategori: "misir", boyut: "Küçük", fiyat: 90 },
  { ad: { tr: "Kraker", en: "Crackers", de: "Cracker", ar: "مقرمشات" }, kategori: "atistirmalik", fiyat: 45 },
  { ad: { tr: "Soğuk Çay", en: "Iced Tea", de: "Eistee", ar: "شاي مثلج" }, kategori: "icecek", boyut: "Büyük", fiyat: 75 },
  { ad: { tr: "Jelibon", en: "Gummy Candy", de: "Fruchtgummi", ar: "حلوى هلامية" }, kategori: "atistirmalik", fiyat: 50 },
];

export const bufeUrunleriSeed: BufeUrunu[] = urunAdlari.map((urun, index) => ({
  ...urun,
  id: `bufe-${String(index + 1).padStart(2, "0")}`,
  stok: 80 + index * 15,
  aktif: index !== 11,
}));
export const bufeSeed = bufeUrunleriSeed;

export const bufeMenuleriSeed: BufeMenusu[] = [
  { id: "menu-1", ad: "İkili Keyif Menüsü", icerik: [{ urunId: "bufe-1", adet: 1 }, { urunId: "bufe-2", adet: 2 }], fiyat: 255, aktif: true },
  { id: "menu-2", ad: "Film Arası Menüsü", icerik: [{ urunId: "bufe-3", adet: 1 }, { urunId: "bufe-5", adet: 1 }, { urunId: "bufe-6", adet: 1 }], fiyat: 245, aktif: true },
  { id: "menu-3", ad: "Aile Paketi", icerik: [{ urunId: "bufe-1", adet: 2 }, { urunId: "bufe-2", adet: 4 }], fiyat: 480, aktif: false },
];

export const musterilerSeed: Musteri[] = Array.from({ length: 15 }, (_, index) => ({
  id: `musteri-${String(index + 1).padStart(2, "0")}`,
  ad: `Örnek Müşteri ${index + 1}`,
  eposta: `musteri${index + 1}@ornek.test`,
  favoriFilmler: [((index * 3) % filmlerSeed.length) + 1],
  siparisSayisi: index % 6,
  durum: index === 13 ? "engelli" : "aktif",
  kayit: tarih(-30 - index * 4),
}));

export const kampanyalarSeed: Kampanya[] = [
  { id: "kampanya-1", ad: "Hafta İçi Biletleri", tur: "yuzde", deger: 15, kapsam: "bilet", baslangic: tarih(-2), bitis: tarih(5), durum: "aktif" },
  { id: "kampanya-2", ad: "Büfe Molası", tur: "tutar", deger: 40, kapsam: "bufe", baslangic: tarih(-1), bitis: tarih(3), durum: "aktif" },
  { id: "kampanya-3", ad: "İki Bilet Birlikte", tur: "n-al-m-ode", deger: 2, kapsam: "bilet", baslangic: tarih(2), bitis: tarih(12), durum: "taslak" },
  { id: "kampanya-4", ad: "Sezon Açılışı", tur: "yuzde", deger: 10, kapsam: "ikisi", baslangic: tarih(-30), bitis: tarih(-5), durum: "bitti" },
];

export const yoneticilerSeed: AdminUser[] = [
  { id: "admin-1", name: "Deniz Yönetici", email: "deniz@ornek.test", role: "owner", active: true, lastLoginAt: tarihSaat(-1, 10) },
  { id: "admin-2", name: "Ekin Destek", email: "ekin@ornek.test", role: "support", active: true, lastLoginAt: tarihSaat(-1, 12) },
  { id: "admin-3", name: "Mert İçerik", email: "mert@ornek.test", role: "content", active: true, lastLoginAt: tarihSaat(-2, 9) },
  { id: "admin-4", name: "Ada İzleyici", email: "ada@ornek.test", role: "viewer", active: false },
];

const mesajDurumlari: ContactMessage["status"][] = ["new", "in-progress", "answered", "spam"];
export const mesajlarSeed: ContactMessage[] = Array.from({ length: 12 }, (_, index) => ({
  id: `mesaj-${String(index + 1).padStart(2, "0")}`,
  name: `Örnek Gönderen ${index + 1}`,
  email: `gonderen${index + 1}@ornek.test`,
  subject: `Örnek konu ${index + 1}`,
  message: `Bu, örnek destek mesajıdır. Kayıt ${index + 1} için açıklama.`,
  lang: (["tr", "en", "de", "ar"] as const)[index % 4] ?? "tr",
  status: mesajDurumlari[index % mesajDurumlari.length] ?? "new",
  assignee: index % 2 === 0 ? "admin-2" : undefined,
  createdAt: tarihSaat(-index, 9 + (index % 8)),
  replies: [],
}));

const siparisDurumlari: Siparis["durum"][] = ["bekliyor", "odendi", "kullanildi", "iptal", "iade"];

function rastgeleBolum(index: number): string {
  return Array.from({ length: 6 }, (_, karakter) => {
    const alfaIndeksi = (index * 7 + karakter * 11) % 32;
    return "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[alfaIndeksi] ?? "A";
  }).join("");
}

export const siparislerSeed: Siparis[] = Array.from({ length: 30 }, (_, index) => {
  const seans = seanslarSeed[index];
  const musteri = musterilerSeed[index % musterilerSeed.length];
  const bufeUrunu = bufeUrunleriSeed[index % bufeUrunleriSeed.length];
  const salon = salonlarSeed.find((kayit) => kayit.id === seans?.salonId);
  if (!seans || !musteri || !bufeUrunu || !salon) {
    throw new Error(`Sipariş seed kaydı eksik: ${index + 1}`);
  }

  const koltuklar = kullanilabilirKoltuklar(salon.harita);
  const koltuk = koltuklar[(index * 17) % koltuklar.length];
  if (!koltuk) {
    throw new Error(`Sipariş için kullanılabilir koltuk bulunamadı: ${index + 1}`);
  }
  const { satir, sutun } = koltuk;
  const kategori = koltukKategorisi(salon.harita, satir);
  const bilet = {
    kod: pnrUret(salon.numara, seans.baslangic, rastgeleBolum(index)),
    seansId: seans.id,
    satir,
    sutun,
    kategori,
    fiyat: seans.fiyat[kategori],
  };
  const bufe = [{ urunId: bufeUrunu.id, adet: 1 + (index % 2), birimFiyat: bufeUrunu.fiyat }];
  const durum = siparisDurumlari[index % siparisDurumlari.length] ?? "bekliyor";
  const siparis: Siparis = {
    id: `siparis-${String(index + 1).padStart(3, "0")}`,
    musteriId: musteri.id,
    biletler: [bilet],
    bufe,
    toplam: bilet.fiyat + bufe.reduce((toplam, kalem) => toplam + kalem.adet * kalem.birimFiyat, 0),
    durum,
    olusturma: tarihSaat(-index % 7, 10 + (index % 8)),
    ...(durum === "kullanildi" ? { kullanimZamani: tarihSaat(0, 11 + (index % 8)) } : {}),
  };
  return siparis;
});

export const koltukRezervasyonlariSeed: KoltukRezervasyonu[] = siparislerSeed
  .filter((siparis) => siparis.durum === "odendi" || siparis.durum === "kullanildi" || siparis.durum === "bekliyor")
  .flatMap((siparis) =>
    siparis.biletler.map((bilet) => ({
      seansId: bilet.seansId,
      satir: bilet.satir,
      sutun: bilet.sutun,
      durum: siparis.durum === "bekliyor" ? "secili" : "dolu",
      siparisId: siparis.id,
      ...(siparis.durum === "bekliyor" ? { tutmaBitis: tarihSaat(0, 23) } : {}),
    })),
  );

export const denetimKayitlariSeed: AuditLogEntry[] = Array.from({ length: 40 }, (_, index) => ({
  id: `denetim-${String(index + 1).padStart(3, "0")}`,
  at: tarihSaat(-index % 14, 8 + (index % 10)),
  actorId: yoneticilerSeed[index % yoneticilerSeed.length]?.id ?? "admin-1",
  action: ["film.update", "session.create", "order.refund", "message.reply", "campaign.publish"][index % 5] ?? "film.update",
  entity: ["Film", "Seans", "Sipariş", "Mesaj", "Kampanya"][index % 5] ?? "Film",
  entityId: `${index + 1}`,
  reason: index % 3 === 0 ? "Örnek işlem gerekçesi." : undefined,
}));

export interface AdminSeedData {
  films: Film[];
  cinemas: Sinema[];
  halls: Salon[];
  sessions: Seans[];
  seatReservations: KoltukRezervasyonu[];
  concessionProducts: BufeUrunu[];
  concessionMenus: BufeMenusu[];
  orders: Siparis[];
  customers: Musteri[];
  campaigns: Kampanya[];
  contactMessages: ContactMessage[];
  admins: AdminUser[];
  authSessions: AdminAuthSession[];
  auditLogs: AuditLogEntry[];
}

export const seedData: AdminSeedData = {
  films: filmlerSeed,
  cinemas: sinemalarSeed,
  halls: salonlarSeed,
  sessions: seanslarSeed,
  seatReservations: koltukRezervasyonlariSeed,
  concessionProducts: bufeUrunleriSeed,
  concessionMenus: bufeMenuleriSeed,
  orders: siparislerSeed,
  customers: musterilerSeed,
  campaigns: kampanyalarSeed,
  contactMessages: mesajlarSeed,
  admins: yoneticilerSeed,
  authSessions: [],
  auditLogs: denetimKayitlariSeed,
};

import type { Film, BufeUrunu, BufePorsiyon, BufeRozet, BiletKategorisi, FilmTur, FilmDurum, SalonTipi, YasSiniri } from "./types";

export type { Film, BufeUrunu, BufePorsiyon, BufeRozet, BiletKategorisi, FilmTur, FilmDurum, SalonTipi, YasSiniri };

// Geriye dönük uyumluluk takma adları
export type Etkinlik = Film;
export type Kategori = FilmTur;

export const filmTurleri: FilmTur[] = ["Aksiyon", "Bilim Kurgu", "Dram", "Komedi", "Animasyon"];
export const kategoriler = filmTurleri;

export const filmler: Film[] = [
  {
    id: 1,
    baslik: "Dune: Çöl Gezegeni Bölüm İki",
    tur: "Bilim Kurgu",
    durum: "vizyonda",
    salonTipi: "IMAX",
    sure: "2s 46dk",
    imdb: 8.6,
    yasSiniri: "+13",
    formatlar: ["IMAX Laser", "Dolby Atmos", "4K Lazer"],
    yonetmen: "Denis Villeneuve",
    oyuncular: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    salon: "Salon 1 (IMAX Laser)",
    seanslar: ["13:00", "16:30", "20:00", "21:30"],
    renk: "linear-gradient(135deg, var(--renk-vurgu), var(--renk-ana))",
    aciklama: "Paul Atreides, ailesini yok eden komploculara karşı intikam arayışındayken Chani ve Fremenlerle birleşir. Evrenin kaderi ile sevdikleri arasında bir seçim yapmak zorunda kalır.",
    biletler: [
      { ad: "Öğrenci", fiyat: 150 },
      { ad: "Tam Bilet", fiyat: 195 },
      { ad: "IMAX VIP Koltuk", fiyat: 280 },
    ],
  },
  {
    id: 2,
    baslik: "Oppenheimer",
    tur: "Dram",
    durum: "vizyonda",
    salonTipi: "2D",
    sure: "3s 00dk",
    imdb: 8.9,
    yasSiniri: "+18",
    formatlar: ["Dolby Atmos", "70mm Film", "7.1 Surround"],
    yonetmen: "Christopher Nolan",
    oyuncular: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    salon: "Salon 2 (Dolby Atmos)",
    seanslar: ["14:00", "17:30", "21:00"],
    renk: "linear-gradient(135deg, var(--renk-ana), var(--renk-koyu))",
    aciklama: "Manhattan Projesi'nin yöneticisi Amerikalı fizikçi J. Robert Oppenheimer'ın atom bombasının geliştirilme sürecindeki rolü ve ardından gelen ahlaki hesaplaşması.",
    biletler: [
      { ad: "Öğrenci", fiyat: 140 },
      { ad: "Tam Bilet", fiyat: 180 },
      { ad: "Konfor Koltuk", fiyat: 240 },
    ],
  },
  {
    id: 3,
    baslik: "Ters Yüz 2 (Inside Out 2)",
    tur: "Animasyon",
    durum: "vizyonda",
    salonTipi: "3D",
    sure: "1s 36dk",
    imdb: 7.7,
    yasSiniri: "Genel",
    formatlar: ["RealD 3D", "Türkçe Dublaj", "Dolby 7.1"],
    yonetmen: "Kelsey Mann",
    oyuncular: ["Amy Poehler", "Maya Hawke", "Phyllis Smith", "Tony Hale"],
    salon: "Salon 3 (RealD 3D)",
    seanslar: ["11:30", "14:00", "16:30", "19:00"],
    renk: "linear-gradient(135deg, var(--renk-vurgu), var(--renk-koyu))",
    aciklama: "Ergenlik çağına adım atan Riley'nin zihin merkezine beklenmedik yeni duygular giriş yapar: Kaygı, Gıpta, Bıkkınlık ve Utanç. Neşe ve arkadaşları kontrolü korumaya çalışır.",
    biletler: [
      { ad: "Çocuk / Öğrenci", fiyat: 130 },
      { ad: "Tam Bilet", fiyat: 170 },
      { ad: "3D Aile Paketi", fiyat: 250 },
    ],
  },
  {
    id: 4,
    baslik: "Interstellar (Yeniden Vizyonda)",
    tur: "Bilim Kurgu",
    durum: "vizyonda",
    salonTipi: "VIP Salon",
    sure: "2s 49dk",
    imdb: 8.7,
    yasSiniri: "+13",
    formatlar: ["VIP Gold Class", "IMAX 12-Kanal", "D-Box"],
    yonetmen: "Christopher Nolan",
    oyuncular: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    salon: "Salon 4 (VIP Gold Class)",
    seanslar: ["15:00", "18:30", "22:00"],
    renk: "linear-gradient(135deg, var(--renk-koyu), var(--renk-ana))",
    aciklama: "İnsanlığın Dünya üzerindeki zamanı sona yaklaşırken, bir grup kâşif insanlığın hayatta kalmasını sağlamak için solucan deliğinden geçerek galaksinin ötesine seyahat eder.",
    biletler: [
      { ad: "Tam Bilet", fiyat: 220 },
      { ad: "VIP Yatar Koltuk", fiyat: 320 },
    ],
  },
  {
    id: 5,
    baslik: "Ölümlü Dünya 2",
    tur: "Komedi",
    durum: "vizyonda",
    salonTipi: "2D",
    sure: "1s 57dk",
    imdb: 7.4,
    yasSiniri: "+18",
    formatlar: ["2D Dijital", "5.1 Surround"],
    yonetmen: "Ali Atay",
    oyuncular: ["Ahmet Mümtaz Taylan", "Alper Kul", "Sarp Apak", "İrem Sak", "Feyyaz Yiğit"],
    salon: "Salon 5 (2D Salon)",
    seanslar: ["13:30", "16:00", "18:45", "21:15"],
    renk: "linear-gradient(135deg, var(--renk-vurgu), var(--renk-ana))",
    aciklama: "Mermer ailesi kanun kaçağı hayatlarına devam ederken başlarına gelen yeni belalar ve Zafer'in kaçırılması üzerine giriştikleri absürt ve tehlikeli kurtarma operasyonu.",
    biletler: [
      { ad: "Öğrenci", fiyat: 130 },
      { ad: "Tam Bilet", fiyat: 170 },
    ],
  },
  {
    id: 6,
    baslik: "Gladyatör II",
    tur: "Aksiyon",
    durum: "yakinda",
    salonTipi: "IMAX",
    sure: "2s 28dk",
    imdb: 8.2,
    yasSiniri: "+18",
    formatlar: ["IMAX Laser", "Dolby Atmos", "Orijinal Altyazılı"],
    yonetmen: "Ridley Scott",
    oyuncular: ["Paul Mescal", "Pedro Pascal", "Denzel Washington", "Connie Nielsen"],
    salon: "Salon 1 (IMAX Laser)",
    seanslar: ["17:00", "20:30"],
    renk: "linear-gradient(135deg, var(--renk-ana), var(--renk-vurgu))",
    aciklama: "Maximus'un ölümünün ardından Lucius, tiran imparatorların yönettiği Roma'nın kaderini değiştirmek ve Kolezyum'un ihtişamını yeniden inşa etmek için arenaya adım atar.",
    biletler: [
      { ad: "Ön Satış Tam", fiyat: 210 },
      { ad: "Ön Satış VIP", fiyat: 300 },
    ],
  },
];

export const etkinlikler = filmler;

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
];

export function filmBul(id: number): Film | undefined {
  return filmler.find((f) => f.id === id);
}

export const etkinlikBul = filmBul;

// Para ve tarih biçimlendirme yardımcıları
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

// CineQ Sepet Durum Yönetimi — LocalStorage Kalıcılığı & İndirim Kodu (Svelte 5 Runes)
import type { BiletKategorisi, Film, BufeUrunu } from "./data";

export interface BiletSepetKalemi {
  tur: "bilet";
  film: Film;
  bilet: BiletKategorisi;
  seans: string;
  salon: string;
  koltuklar: string[];
  adet: number;
  vipKoltukSayisi: number;
  toplamTutar: number;
}

export interface BufeSepetKalemi {
  tur: "bufe";
  urun: BufeUrunu;
  porsiyonAdi?: string;
  birimFiyat: number;
  adet: number;
}

export type SepetKalemi = BiletSepetKalemi | BufeSepetKalemi;

const ANAHTAR_BILETLER = "cineq_sepet_biletler";
const ANAHTAR_BUFE = "cineq_sepet_bufe";
const ANAHTAR_KOD = "cineq_sepet_indirim";

function yukleBiletler(): BiletSepetKalemi[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const veri = localStorage.getItem(ANAHTAR_BILETLER);
    return veri ? JSON.parse(veri) : [];
  } catch {
    return [];
  }
}

function yukleBufe(): BufeSepetKalemi[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const veri = localStorage.getItem(ANAHTAR_BUFE);
    return veri ? JSON.parse(veri) : [];
  } catch {
    return [];
  }
}

function yukleKod(): string {
  try {
    if (typeof localStorage === "undefined") return "";
    return localStorage.getItem(ANAHTAR_KOD) ?? "";
  } catch {
    return "";
  }
}

class Sepet {
  biletler = $state<BiletSepetKalemi[]>([]);
  bufeKalemleri = $state<BufeSepetKalemi[]>([]);
  indirimKodu = $state<string>("");

  constructor() {
    this.yenile();
  }

  yenile() {
    if (typeof window !== "undefined") {
      this.biletler = yukleBiletler();
      this.bufeKalemleri = yukleBufe();
      this.indirimKodu = yukleKod();
    }
  }

  private kaydet() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(ANAHTAR_BILETLER, JSON.stringify(this.biletler));
      localStorage.setItem(ANAHTAR_BUFE, JSON.stringify(this.bufeKalemleri));
      localStorage.setItem(ANAHTAR_KOD, this.indirimKodu);
    } catch {
      // Hata yok sayılır
    }
  }

  biletAdet = $derived(this.biletler.reduce((t, k) => t + k.adet, 0));
  bufeAdet = $derived(this.bufeKalemleri.reduce((t, k) => t + k.adet, 0));
  adet = $derived(this.biletAdet + this.bufeAdet);

  biletToplam = $derived(this.biletler.reduce((t, k) => t + (k.toplamTutar ?? k.adet * k.bilet.fiyat), 0));
  bufeToplam = $derived(this.bufeKalemleri.reduce((t, k) => t + k.adet * k.birimFiyat, 0));
  araToplam = $derived(this.biletToplam + this.bufeToplam);

  // İndirim Oranı Hesaplama
  indirimOrani = $derived.by(() => {
    const kod = this.indirimKodu.trim().toUpperCase();
    if (kod === "CINEQ10") return 0.10;
    if (kod === "OGRENCI20") return 0.20;
    if (kod === "ILKBILET") return 0.15;
    return 0;
  });

  indirimTutari = $derived(Math.round(this.araToplam * this.indirimOrani));
  toplam = $derived(Math.max(0, this.araToplam - this.indirimTutari));

  // Geriye dönük uyumluluk için kalem listesi
  kalemler = $derived<SepetKalemi[]>([...this.biletler, ...this.bufeKalemleri]);

  ekleBilet(
    film: Film,
    bilet: BiletKategorisi,
    seans: string,
    salon: string,
    koltuklar: string[],
    adet: number = 1,
    vipKoltukSayisi: number = 0,
    toplamTutar?: number,
  ) {
    const hesaplananTutar = toplamTutar ?? (bilet.fiyat * adet + vipKoltukSayisi * 50);
    this.biletler.push({
      tur: "bilet",
      film,
      bilet,
      seans,
      salon,
      koltuklar,
      adet,
      vipKoltukSayisi,
      toplamTutar: hesaplananTutar,
    });
    this.kaydet();
  }

  // Geriye dönük ekle fonksiyonu
  ekle(etkinlik: Film, bilet: BiletKategorisi, adet: number) {
    const seans = etkinlik.seanslar[0] ?? "19:00";
    const salon = etkinlik.salon;
    const koltuklar = [`A${this.biletler.length + 1}`];
    this.ekleBilet(etkinlik, bilet, seans, salon, koltuklar, adet, 0, bilet.fiyat * adet);
  }

  ekleBufe(urun: BufeUrunu, adet: number = 1, porsiyonAdi?: string, birimFiyat?: number) {
    const fiyat = birimFiyat ?? urun.fiyat;
    const mevcut = this.bufeKalemleri.find(
      (b) => b.urun.id === urun.id && b.porsiyonAdi === porsiyonAdi
    );
    if (mevcut) {
      mevcut.adet += adet;
    } else {
      this.bufeKalemleri.push({
        tur: "bufe",
        urun,
        porsiyonAdi,
        birimFiyat: fiyat,
        adet,
      });
    }
    this.kaydet();
  }

  silBilet(index: number) {
    this.biletler.splice(index, 1);
    this.kaydet();
  }

  silBufe(index: number) {
    this.bufeKalemleri.splice(index, 1);
    this.kaydet();
  }

  sil(index: number) {
    if (index < this.biletler.length) {
      this.silBilet(index);
    } else {
      this.silBufe(index - this.biletler.length);
    }
  }

  indirimKoduUygula(kod: string): boolean {
    const temiz = kod.trim().toUpperCase();
    if (temiz === "CINEQ10" || temiz === "OGRENCI20" || temiz === "ILKBILET") {
      this.indirimKodu = temiz;
      this.kaydet();
      return true;
    }
    return false;
  }

  indirimKoduKaldir() {
    this.indirimKodu = "";
    this.kaydet();
  }

  temizle() {
    this.biletler = [];
    this.bufeKalemleri = [];
    this.indirimKodu = "";
    this.kaydet();
  }
}

export const sepet = new Sepet();

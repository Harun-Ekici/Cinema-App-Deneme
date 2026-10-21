// CineQ Biletlerim Durum Yönetimi (Svelte 5 Runes)
import { biletHesapla } from "./native";
import type {
  Bilet as BiletModel,
  BiletSepetKalemi,
  BufeSepetKalemi,
  BiletSonucu,
  NativeHatasi,
  SepetKalemi,
} from "./types";

export type BiletKaydi = BiletModel;
export type Bilet = BiletModel;

const ANAHTAR = "cineq_biletlerim";

function yukle(): BiletKaydi[] {
  if (typeof localStorage === "undefined") return [];
  const veri = localStorage.getItem(ANAHTAR);
  return veri ? JSON.parse(veri) as BiletKaydi[] : [];
}

export type SatinAlSonucu =
  | { ok: true; sonuclar: BiletSonucu[] }
  | { ok: false; hata: NativeHatasi };

class Biletlerim {
  liste = $state<BiletKaydi[]>([]);
  hata = $state<unknown>(null);

  constructor() {
    this.yenile();
  }

  yenile() {
    if (typeof window !== "undefined") {
      try {
        this.liste = yukle();
        this.hata = null;
      } catch (error) {
        this.liste = [];
        this.hata = error;
      }
    }
  }

  async satinAl(
    biletKalemleri: BiletSepetKalemi[] | SepetKalemi[],
    bufeKalemleri: BufeSepetKalemi[] = [],
    indirimBilgi?: string,
  ): Promise<SatinAlSonucu> {
    const biletler: BiletSepetKalemi[] = [];
    const bufeler: BufeSepetKalemi[] = [...bufeKalemleri];

    for (const item of biletKalemleri) {
      if (item.tur === "bilet") {
        biletler.push(item);
      } else if (item.tur === "bufe") {
        bufeler.push(item);
      }
    }

    const bufeOzet = bufeler.length > 0
      ? bufeler.map((b) => `${b.adet}x ${b.urun.ad}${b.porsiyonAdi ? ` (${b.porsiyonAdi})` : ""}`).join(", ")
      : undefined;

    const olusturulanBiletler: BiletKaydi[] = [];
    const sonuclar: BiletSonucu[] = [];
    for (const b of biletler) {
      const komut = await biletHesapla({
        filmAdi: b.film.baslik,
        salon: b.salon,
        seans: b.seans,
        adet: b.adet,
      });
      if (!komut.ok) return komut;

      sonuclar.push(komut.sonuc);
      olusturulanBiletler.push({
        kod: komut.sonuc.pnrKodu,
        baslik: b.film.baslik,
        tarih: new Date().toISOString(),
        seans: b.seans,
        salon: b.salon,
        koltuklar: b.koltuklar,
        kategori: b.bilet.ad,
        adet: b.adet,
        vipKoltukSayisi: b.vipKoltukSayisi,
        bufeOzet,
        indirimBilgi,
        toplamTutar: b.toplamTutar ?? b.bilet.fiyat * b.adet,
        filmId: b.film.id,
        durum: "onaylandi",
      });
    }

    const yeniListe = [...olusturulanBiletler, ...this.liste];
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ANAHTAR, JSON.stringify(yeniListe));
    }
    this.liste = yeniListe;
    return { ok: true, sonuclar };
  }
}

export const biletlerim = new Biletlerim();

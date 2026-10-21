// CineQ Biletlerim Durum Yönetimi (Svelte 5 Runes)
import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Bilet as BiletModel, BiletSepetKalemi, BufeSepetKalemi, SepetKalemi } from "./types";

export type BiletKaydi = BiletModel;
export type Bilet = BiletModel;

const ANAHTAR = "cineq_biletlerim";

function yukle(): BiletKaydi[] {
  if (typeof localStorage === "undefined") return [];
  const veri = localStorage.getItem(ANAHTAR);
  return veri ? JSON.parse(veri) as BiletKaydi[] : [];
}

// Bilet kodu üretici: Tauri Rust komutu veya tarayıcı JS yedeği
export async function biletKoduAl(salon: string = "Salon 1", seans: string = "21:30"): Promise<string> {
  const salonKisa = salon.match(/Salon\s*(\d+)/i)?.[1] ? `S${salon.match(/Salon\s*(\d+)/i)![1]}` : "S1";
  const seansKisa = seans.replace(":", "");

  if (typeof window !== "undefined" && isTauri()) {
    try {
      return await invoke<string>("bilet_olustur", { salon: salonKisa, seans: seansKisa });
    } catch {
      // Rust çağrısı başarısız olursa tarayıcı yedeğine dön
    }
  }

  const rastgele = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  return `CNQ-${salonKisa}-${seansKisa}-${rastgele}`;
}

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
  ) {
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

    for (const b of biletler) {
      const kod = await biletKoduAl(b.salon, b.seans);
      this.liste.unshift({
        kod,
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

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ANAHTAR, JSON.stringify(this.liste));
    }
  }
}

export const biletlerim = new Biletlerim();

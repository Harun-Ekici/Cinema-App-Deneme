import { invoke, isTauri } from "@tauri-apps/api/core";
import type {
  BiletGirdisi,
  BiletHatasi,
  BiletKomutSonucu,
  BiletSonucu,
  CineQPlatform,
  NativeHatasi,
} from "./types";

const BILET_HATA_KODLARI: BiletHatasi["kod"][] = [
  "film_adi_bos",
  "salon_gecersiz",
  "seans_gecersiz",
  "bilet_adedi_gecersiz",
  "sistem_saati_gecersiz",
];

const NATIVE_HATA_KODLARI: NativeHatasi["kod"][] = [
  ...BILET_HATA_KODLARI,
  "komut_basarisiz",
];

export function platform(): CineQPlatform {
  if (typeof window === "undefined" || !isTauri()) return "web";

  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes("android")) return "android";
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (userAgent.includes("windows")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  return "web";
}

export function destekleniyorMu(ozellik: string): boolean {
  if (ozellik !== "bilet_kodu_uret") return false;
  return ["web", "windows", "macos", "linux", "android", "ios"].includes(platform());
}

function normalizeHata(hata: unknown): NativeHatasi {
  let deger = hata;
  if (typeof hata === "string") {
    try {
      deger = JSON.parse(hata) as unknown;
    } catch {
      return { kod: "komut_basarisiz" };
    }
  }

  if (
    typeof deger === "object" &&
    deger !== null &&
    "kod" in deger &&
    typeof deger.kod === "string"
  ) {
    const kod = NATIVE_HATA_KODLARI.find((aday) => aday === deger.kod);
    if (kod) return { kod };
  }

  return { kod: "komut_basarisiz" };
}

function tarayiciSonucu(girdi: BiletGirdisi): BiletSonucu {
  const salonKodu = girdi.salon.replace(/[^a-z0-9]/gi, "").toUpperCase() || "S1";
  const seansKodu = girdi.seans.replace(":", "");
  const girdiMetni = `${girdi.filmAdi.trim()}|${salonKodu}|${seansKodu}|${girdi.adet}`;
  let karmasik = 2166136261;

  for (let index = 0; index < girdiMetni.length; index += 1) {
    karmasik ^= girdiMetni.charCodeAt(index);
    karmasik = Math.imul(karmasik, 16777619);
  }

  const pnrKodu = `CNQ-${salonKodu}-${seansKodu}-${(karmasik >>> 0)
    .toString(16)
    .toUpperCase()
    .slice(-6)
    .padStart(6, "0")}`;
  return {
    pnrKodu,
    filmAdi: girdi.filmAdi.trim(),
    salon: girdi.salon.trim(),
    seans: girdi.seans,
    adet: girdi.adet,
    dogrulamaOzeti: `Bilet doğrulama hazır: ${girdi.filmAdi.trim()} · ${girdi.seans} · ${girdi.adet} bilet. (Tarayıcı demo sonucu)`,
  };
}

function tarayiciHatasi(girdi: BiletGirdisi): BiletHatasi | null {
  if (!girdi.filmAdi.trim()) return { kod: "film_adi_bos" };
  if (!girdi.salon.trim()) return { kod: "salon_gecersiz" };
  const seans = /^(\d{2}):(\d{2})$/.exec(girdi.seans);
  if (!seans || Number(seans[1]) > 23 || Number(seans[2]) > 59) {
    return { kod: "seans_gecersiz" };
  }
  if (!Number.isInteger(girdi.adet) || girdi.adet <= 0) {
    return { kod: "bilet_adedi_gecersiz" };
  }
  return null;
}

export async function biletHesapla(girdi: BiletGirdisi): Promise<BiletKomutSonucu> {
  if (!isTauri()) {
    const hata = tarayiciHatasi(girdi);
    return hata ? { ok: false, hata } : { ok: true, sonuc: tarayiciSonucu(girdi) };
  }

  try {
    const sonuc = await invoke<BiletSonucu>("bilet_hesapla", { girdi });
    return { ok: true, sonuc };
  } catch (hata) {
    return { ok: false, hata: normalizeHata(hata) };
  }
}

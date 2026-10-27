import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Film, FilmDurum, FilmTur, SalonTipi } from "./types";
import type { VitrinKoltukHaritasi, VitrinSeansi } from "./types";
import type { UygulamaDili } from "./i18n/liste-durumlari";
import type { BufeUrunu } from "./types";

const filmTurleri = new Set<FilmTur>([
  "Aksiyon",
  "Bilim Kurgu",
  "Dram",
  "Komedi",
  "Animasyon",
  "Gerilim",
  "Belgesel",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function finiteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapHarita(value: unknown): VitrinKoltukHaritasi {
  const harita = parseJson(value);
  if (!isRecord(harita)) throw new Error("Salon koltuk haritası geçersiz biçimde.");
  const koltuklar = Array.isArray(harita.kullanilamaz) ? harita.kullanilamaz : [];
  return {
    satir: finiteNumber(harita.satir),
    sutun: finiteNumber(harita.sutun),
    koridorSutunlari: Array.isArray(harita.koridorSutunlari)
      ? harita.koridorSutunlari.filter((item): item is number => typeof item === "number")
      : [],
    vipSatirlari: Array.isArray(harita.vipSatirlari)
      ? harita.vipSatirlari.filter((item): item is number => typeof item === "number")
      : [],
    kullanilamaz: koltuklar.filter(isRecord).map((seat) => ({
      satir: finiteNumber(seat.satir, -1),
      sutun: finiteNumber(seat.sutun, -1),
    })),
  };
}

function mapSeans(value: unknown): VitrinSeansi {
  const source = parseJson(value);
  if (!isRecord(source) || !isRecord(source.salon)) {
    throw new Error("Vitrin seans kaydı beklenen biçimde değil.");
  }
  const price = parseJson(source.fiyat);
  if (!isRecord(price)) throw new Error("Seans bilet fiyatları geçersiz.");
  const hall = source.salon;
  const hallType = hall.tip === "IMAX" || hall.tip === "3D" || hall.tip === "VIP Salon" ? hall.tip : "2D";
  const occupied = Array.isArray(source.doluKoltuklar) ? source.doluKoltuklar.filter(isRecord) : [];
  return {
    id: text(source.id),
    salonId: text(source.salonId),
    baslangic: text(source.baslangic),
    dil: text(source.dil, "tr"),
    ...(typeof source.altyazi === "string" ? { altyazi: source.altyazi } : {}),
    fiyat: {
      standart: finiteNumber(price.standart, finiteNumber(price.tam)),
      tam: finiteNumber(price.tam, finiteNumber(price.standart)),
      ogrenci: finiteNumber(price.ogrenci, finiteNumber(price.standart)),
      vip: finiteNumber(price.vip),
    },
    salon: {
      id: text(hall.id),
      numara: finiteNumber(hall.numara),
      ad: text(hall.ad, "Bilinmeyen salon"),
      tip: hallType as SalonTipi,
      sinema: text(hall.sinema, "Sinema"),
      sehir: text(hall.sehir),
      harita: mapHarita(hall.harita),
    },
    doluKoltuklar: occupied.map((seat) => ({
      satir: finiteNumber(seat.satir, -1),
      sutun: finiteNumber(seat.sutun, -1),
    })),
  };
}

function mapFilm(value: unknown, lang: UygulamaDili): Film {
  const source = parseJson(value);
  if (!isRecord(source)) throw new Error("Vitrin film kaydı beklenen biçimde değil.");
  const names = parseJson(source.ad);
  const localizedNames = isRecord(names) ? names : {};
  const sessions = Array.isArray(source.seanslar) ? source.seanslar.map(mapSeans) : [];
  const genres = stringList(parseJson(source.turler)).filter((genre): genre is FilmTur =>
    filmTurleri.has(genre as FilmTur),
  );
  const status: FilmDurum = source.durum === "vizyonda" ? "vizyonda" : "yakinda";
  const firstSession = sessions[0];
  const title = text(localizedNames[lang], text(localizedNames.tr, "İsimsiz film"));
  const durationMinutes = Math.max(1, finiteNumber(source.sureDk, 120));

  return {
    id: finiteNumber(source.id),
    baslik: title,
    ...(typeof source.afis === "string" ? { afis: source.afis } : {}),
    tur: genres[0] ?? "Dram",
    durum: status,
    salonTipi: firstSession?.salon.tip ?? "2D",
    sure: `${Math.floor(durationMinutes / 60)}s ${String(durationMinutes % 60).padStart(2, "0")}dk`,
    imdb: finiteNumber(source.imdb),
    yasSiniri: finiteNumber(source.yasSiniri) >= 18 ? "+18" : finiteNumber(source.yasSiniri) > 0 ? "+13" : "Genel",
    formatlar: [...new Set(sessions.map((session) => session.salon.tip))],
    yonetmen: text(source.yonetmen),
    oyuncular: stringList(parseJson(source.oyuncular)),
    salon: firstSession?.salon.ad ?? "Seans planlanıyor",
    seanslar: sessions.map((session) => session.baslangic.slice(11, 16)),
    renk: text(source.gradyan, "linear-gradient(135deg, var(--renk-ana), var(--renk-koyu))"),
    aciklama: text(source.sinopsis),
    biletler: [
      { ad: "Tam", fiyat: firstSession?.fiyat.tam ?? 0 },
      { ad: "Öğrenci", fiyat: firstSession?.fiyat.ogrenci ?? 0 },
    ],
    gosterimSeanslari: sessions,
  };
}

interface VitrinKatalogYaniti {
  films: unknown[];
  bufe: unknown[];
  menuler: unknown[];
}

async function vitrinKatalogYaniti(): Promise<VitrinKatalogYaniti> {
  if (!isTauri()) {
    throw new Error("SQLite vitrin kataloğu yalnızca Tauri uygulamasında kullanılabilir.");
  }
  const response: unknown = await invoke("vitrin_katalog");
  if (!isRecord(response) || !Array.isArray(response.films) || !Array.isArray(response.bufe) || !Array.isArray(response.menuler)) {
    throw new Error("SQLite vitrin kataloğu beklenen biçimde değil.");
  }
  return {
    films: response.films,
    bufe: response.bufe,
    menuler: response.menuler,
  };
}

function mapVitrinBufesi(response: VitrinKatalogYaniti, lang: UygulamaDili): BufeUrunu[] {
  const productsIn = response.bufe;
  const menusIn = response.menuler;
  const products = productsIn.filter(isRecord).map((product) => {
    const names = parseJson(product.ad);
    const nameMap = isRecord(names) ? names : {};
    const category = product.kategori;
    const kategori: BufeUrunu["kategori"] = category === "misir" ? "Misir"
      : category === "icecek" ? "Icecek"
      : category === "menu" ? "Menu"
      : "Atistirmalik";
    return {
      id: text(product.id),
      ad: text(nameMap[lang], text(nameMap.tr, "Büfe ürünü")),
      kategori,
      boyut: text(product.boyut) || undefined,
      fiyat: finiteNumber(product.fiyat),
      stok: finiteNumber(product.stok),
      aciklama: "",
      ikon: kategori === "Misir" ? "🍿" : kategori === "Icecek" ? "🥤" : kategori === "Menu" ? "🎬" : "🍫",
    };
  });
  const menus = menusIn.filter(isRecord).map((menu) => ({
    id: `menu-${text(menu.id)}`,
    menuId: text(menu.id),
    ad: text(menu.ad, "Büfe menüsü"),
    kategori: "Menu" as const,
    fiyat: finiteNumber(menu.fiyat),
    aciklama: "SQLite büfe menüsü",
    ikon: "🎬",
  }));
  return [...products, ...menus];
}

export async function vitrinFilmleriniYukle(lang: UygulamaDili): Promise<Film[]> {
  const response = await vitrinKatalogYaniti();
  return response.films.map((film) => mapFilm(film, lang));
}

export async function vitrinBufesiniYukle(lang: UygulamaDili = "tr"): Promise<BufeUrunu[]> {
  return mapVitrinBufesi(await vitrinKatalogYaniti(), lang);
}

export async function vitrinVerileriniYukle(lang: UygulamaDili): Promise<{ films: Film[]; bufe: BufeUrunu[] }> {
  const response = await vitrinKatalogYaniti();
  return {
    films: response.films.map((film) => mapFilm(film, lang)),
    bufe: mapVitrinBufesi(response, lang),
  };
}

import { invoke, isTauri } from "@tauri-apps/api/core";
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

export type SatinAlSonucu =
  | { ok: true; sonuclar: BiletSonucu[]; orderId: string }
  | { ok: false; hata: NativeHatasi; mesaj?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function seatCoordinates(code: string): { satir: number; sutun: number } {
  const match = /^([A-Z])(\d+)$/.exec(code);
  if (!match) throw new Error(`Koltuk kodu geçersiz: ${code}`);
  const row = match[1]?.charCodeAt(0);
  const column = Number(match[2]);
  if (row === undefined || !Number.isInteger(column) || column < 1) {
    throw new Error(`Koltuk kodu geçersiz: ${code}`);
  }
  return { satir: row - 65, sutun: column - 1 };
}

function mapTicket(value: unknown): BiletKaydi {
  if (!isRecord(value)) throw new Error("SQLite bilet kaydı beklenen biçimde değil.");
  const sessionStart = typeof value.baslangic === "string" ? value.baslangic : "";
  const ticketType = value.biletTuru === "ogrenci" ? "Öğrenci" : "Tam";
  const status = value.durum === "iptal" ? "iptal" : value.kullanildi || value.durum === "kullanildi" ? "kullanildi" : "onaylandi";
  return {
    kod: typeof value.kod === "string" ? value.kod : "",
    baslik: typeof value.film === "string" ? value.film : "Bilinmeyen Film",
    tarih: typeof value.tarih === "string" ? value.tarih : "",
    seans: sessionStart.slice(11, 16),
    salon: `${typeof value.sinema === "string" ? `${value.sinema} · ` : ""}${typeof value.salon === "string" ? value.salon : "Salon"}${typeof value.sehir === "string" && value.sehir ? ` · ${value.sehir}` : ""}`,
    koltuklar: [`${String.fromCharCode(65 + (typeof value.satir === "number" ? value.satir : 0))}${typeof value.sutun === "number" ? value.sutun + 1 : ""}`],
    kategori: ticketType,
    adet: 1,
    vipKoltukSayisi: value.kategori === "vip" ? 1 : 0,
    toplamTutar: typeof value.fiyat === "number" ? value.fiyat : 0,
    filmId: typeof value.filmId === "number" ? value.filmId : undefined,
    seansId: typeof value.seansId === "string" ? value.seansId : undefined,
    siparisId: typeof value.siparisId === "string" ? value.siparisId : undefined,
    durum: status,
  };
}

class Biletlerim {
  liste = $state<BiletKaydi[]>([]);
  hata = $state<unknown>(null);

  async yenile(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!isTauri()) {
      this.liste = [];
      this.hata = null;
      return;
    }
    try {
      const response: unknown = await invoke("misafir_biletlerim");
      if (!Array.isArray(response)) throw new Error("SQLite bilet listesi beklenen biçimde değil.");
      this.liste = response.map(mapTicket);
      this.hata = null;
    } catch (error) {
      this.hata = error;
      throw error;
    }
  }

  async satinAl(
    biletKalemleri: BiletSepetKalemi[] | SepetKalemi[],
    bufeKalemleri: BufeSepetKalemi[] = [],
    indirimKodu?: string,
  ): Promise<SatinAlSonucu> {
    if (!isTauri()) {
      return {
        ok: false,
        hata: { kod: "komut_basarisiz" },
        mesaj: "SQLite siparişi oluşturmak için CineQ masaüstü uygulamasını kullanın.",
      };
    }

    const tickets: BiletSepetKalemi[] = [];
    const buffet: BufeSepetKalemi[] = [...bufeKalemleri];
    for (const item of biletKalemleri) {
      if (item.tur === "bilet") tickets.push(item);
      else buffet.push(item);
    }

    const reservations = new Map<string, { seansId: string; koltuklar: { satir: number; sutun: number; biletTuru: string }[] }>();
    for (const ticket of tickets) {
      if (!ticket.seansId) throw new Error("Sipariş için SQLite seans kimliği bulunamadı. Lütfen seansı yeniden seçin.");
      const reservation = reservations.get(ticket.seansId) ?? { seansId: ticket.seansId, koltuklar: [] };
      for (const seat of ticket.koltuklar) {
        reservation.koltuklar.push({
          ...seatCoordinates(seat),
          biletTuru: ticket.bilet.ad.toLocaleLowerCase("tr") === "öğrenci" ? "ogrenci" : "tam",
        });
      }
      reservations.set(ticket.seansId, reservation);
    }

    const response: unknown = await invoke("misafir_siparis_olustur", {
      girdi: {
        rezervasyonlar: [...reservations.values()],
        bufe: buffet.map((item) => ({
          ...(item.urun.menuId ? { menuId: item.urun.menuId } : { urunId: item.urun.id }),
          adet: item.adet,
        })),
        ...(indirimKodu ? { indirimKodu: indirimKodu.split(" ")[0] } : {}),
      },
    });
    if (!isRecord(response) || typeof response.id !== "string" || !Array.isArray(response.biletler)) {
      throw new Error("SQLite sipariş yanıtı beklenen biçimde değil.");
    }

    const ticketItems = response.biletler.filter(isRecord);
    const summaries = ticketItems.map((ticket) => {
      const code = typeof ticket.kod === "string" ? ticket.kod : "";
      const sessionId = typeof ticket.seansId === "string" ? ticket.seansId : "";
      const cartItem = tickets.find((item) => item.seansId === sessionId);
      const name = cartItem?.film.baslik ?? "CineQ";
      const hall = cartItem?.salon ?? "Salon";
      const time = cartItem?.seans ?? "00:00";
      return {
        pnrKodu: code,
        filmAdi: name,
        salon: hall,
        seans: time,
        adet: 1,
        dogrulamaOzeti: `${name} · ${time} · ${hall} için bilet hazır.`,
      };
    });

    await this.yenile();
    return { ok: true, sonuclar: summaries, orderId: response.id };
  }

  async siparisIptalEt(orderId: string): Promise<void> {
    if (!isTauri()) throw new Error("Sipariş iptali yalnızca CineQ masaüstü uygulamasında kullanılabilir.");
    await invoke("misafir_siparis_iptal", { orderId });
    await this.yenile();
  }
}

export const biletlerim = new Biletlerim();

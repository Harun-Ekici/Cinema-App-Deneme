import type {
  Film,
  KoltukHaritasi,
  KoltukKategorisi,
  KoltukRezervasyonu,
  Seans,
  Siparis,
} from "./types";

export const ALFA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const pnrBicimi = /^CNQ-S\d{1,2}-\d{4}-[A-HJ-NP-Z2-9]{6}$/;

export function pnrUret(salonNo: number, baslangic: string, rastgele6: string): string {
  const saat = baslangic.slice(11, 13) + baslangic.slice(14, 16);
  return `CNQ-S${salonNo}-${saat}-${rastgele6}`;
}

export const koltukAdi = (satir: number, sutun: number) => `${String.fromCharCode(65 + satir)}${sutun + 1}`;

export const koltukKategorisi = (harita: KoltukHaritasi, satir: number): KoltukKategorisi =>
  harita.vipSatirlari.includes(satir) ? "vip" : "standart";

export const kullanilabilirKoltuklar = (harita: KoltukHaritasi) => {
  const liste: { satir: number; sutun: number }[] = [];
  for (let satir = 0; satir < harita.satir; satir++) {
    for (let sutun = 0; sutun < harita.sutun; sutun++) {
      if (
        !harita.koridorSutunlari.includes(sutun) &&
        !harita.kullanilamaz.some((koltuk) => koltuk.satir === satir && koltuk.sutun === sutun)
      ) {
        liste.push({ satir, sutun });
      }
    }
  }
  return liste;
};

export const kapasite = (harita: KoltukHaritasi) => kullanilabilirKoltuklar(harita).length;

export function cakisiyorMu(a: Seans, b: Seans, filmler: Film[], temizlikDk = 15): boolean {
  if (a.salonId !== b.salonId || a.id === b.id) {
    return false;
  }

  const filmA = filmler.find((film) => film.id === a.filmId);
  const filmB = filmler.find((film) => film.id === b.filmId);
  if (!filmA || !filmB) {
    throw new Error("Seans çakışması denetlenirken film kaydı bulunamadı.");
  }

  const baslangicA = new Date(a.baslangic).getTime();
  const baslangicB = new Date(b.baslangic).getTime();
  if (!Number.isFinite(baslangicA) || !Number.isFinite(baslangicB)) {
    throw new Error("Seans başlangıç tarihi geçersiz.");
  }

  const bitisA = baslangicA + (filmA.sureDk + temizlikDk) * 60000;
  const bitisB = baslangicB + (filmB.sureDk + temizlikDk) * 60000;
  return baslangicA < bitisB && baslangicB < bitisA;
}

export const biletFiyati = (seans: Seans, kategori: KoltukKategorisi) => seans.fiyat[kategori];

export const siparisToplami = (siparis: Siparis) =>
  siparis.biletler.reduce((toplam, bilet) => toplam + bilet.fiyat, 0) +
  siparis.bufe.reduce((toplam, kalem) => toplam + kalem.adet * kalem.birimFiyat, 0);

export const doluKoltukSayisi = (rezervasyonlar: KoltukRezervasyonu[], seansId: string) =>
  rezervasyonlar.filter((rezervasyon) => rezervasyon.seansId === seansId && rezervasyon.durum === "dolu").length;

export const dolulukYuzdesi = (dolu: number, harita: KoltukHaritasi) => {
  const toplamKapasite = kapasite(harita);
  return toplamKapasite === 0 ? 0 : Math.round((dolu / toplamKapasite) * 100);
};

// CineQ Gelişmiş Tema Yöneticisi (Svelte 5 Runes)
export type TemaModu = "sistem" | "sinema" | "aydinlik" | "gece-yarisi" | "zumrut";

export interface TemaSecenek {
  id: TemaModu;
  baslik: string;
  aciklama: string;
  ikon: string;
}

export const temaListesi: TemaSecenek[] = [
  { id: "sistem", baslik: "Sistem Varsayılanı", aciklama: "Cihazınızın açık/koyu mod ayarını takip eder", ikon: "💻" },
  { id: "sinema", baslik: "Sinema Kırmızı-Siyah", aciklama: "Klasik CineQ koyu sinema salonu atmosferi", ikon: "🎬" },
  { id: "aydinlik", baslik: "Aydınlık Kırmızı-Beyaz", aciklama: "Ferah ve net modern açık tema", ikon: "☀️" },
  { id: "gece-yarisi", baslik: "Gece Yarısı", aciklama: "Koyu lacivert ve mavi vurgular", ikon: "🌌" },
  { id: "zumrut", baslik: "Zümrüt Yeşili", aciklama: "Koyu orman yeşili ve canlı nane tonları", ikon: "🌲" },
];

const ANAHTAR = "cineq_tema";

function aktifTemayiUygula(tema: TemaModu) {
  if (typeof document === "undefined") return;

  let efektifTema = tema;
  if (tema === "sistem") {
    efektifTema = window.matchMedia("(prefers-color-scheme: dark)").matches ? "sinema" : "aydinlik";
  }

  document.documentElement.dataset.tema = efektifTema;
  document.documentElement.dataset.theme = efektifTema;
}

class TemaYonetici {
  secili = $state<TemaModu>("sistem");

  constructor() {
    if (typeof localStorage !== "undefined") {
      const kayitli = localStorage.getItem(ANAHTAR) as TemaModu | null;
      if (kayitli && temaListesi.some((t) => t.id === kayitli)) {
        this.secili = kayitli;
      }
      aktifTemayiUygula(this.secili);

      // Sistem teması dinleyicisi
      if (typeof window !== "undefined") {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
          if (this.secili === "sistem") {
            aktifTemayiUygula("sistem");
          }
        });
      }
    }
  }

  // Geriye dönük mod takma adı
  get mod(): "gece" | "gunduz" {
    return this.secili === "aydinlik" ? "gunduz" : "gece";
  }

  ayarla(yeniTema: TemaModu) {
    this.secili = yeniTema;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ANAHTAR, yeniTema);
    }
    aktifTemayiUygula(yeniTema);
  }

  // Hızlı geçiş döngüsü
  degistir() {
    const siradaki: Record<TemaModu, TemaModu> = {
      sistem: "sinema",
      sinema: "aydinlik",
      aydinlik: "gece-yarisi",
      "gece-yarisi": "zumrut",
      zumrut: "sistem",
    };
    this.ayarla(siradaki[this.secili] ?? "sinema");
  }
}

export const tema = new TemaYonetici();

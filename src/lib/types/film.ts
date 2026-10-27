import type { BiletKategorisi } from "./bilet";
import type { SalonTipi, VitrinSeansi } from "./seans";

export type FilmDurum = "vizyonda" | "yakinda";
export type FilmTur = "Aksiyon" | "Bilim Kurgu" | "Dram" | "Komedi" | "Animasyon" | "Gerilim" | "Belgesel";
export type YasSiniri = "+13" | "+18" | "Genel";

export interface Film {
  id: number; // Filmin uygulama içindeki benzersiz kimliği.
  baslik: string; // Filmin görünen adı.
  afis?: string; // SQLite film kaydındaki isteğe bağlı afiş yolu.
  tur: FilmTur; // Filmin sabit tür seçeneklerinden biri.
  durum: FilmDurum; // Filmin vizyonda veya yakında olma durumu.
  salonTipi: SalonTipi; // Filmin gösterildiği salon formatı.
  sure: string; // Filmin saat ve dakika cinsinden süresi.
  imdb: number; // Filmin örnek IMDb puanı.
  yasSiniri: YasSiniri; // Filmin yaş sınıflandırması.
  formatlar: string[]; // Ses, görüntü ve altyazı özellikleri.
  yonetmen: string; // Filmin yönetmen adı.
  oyuncular: string[]; // Filmde yer alan oyuncular.
  salon: string; // Kullanıcı arayüzünde gösterilen salon bilgisi.
  seanslar: string[]; // Var olan arayüzle uyumlu seans saati listesi.
  gosterimSeanslari?: VitrinSeansi[]; // SQLite kaynaklı seans, salon haritası ve koltuk doluluğu.
  renk: string; // Film afişi için CSS arka plan değeri.
  aciklama: string; // Filmin kısa tanıtım metni.
  biletler: BiletKategorisi[]; // Film için sunulan bilet türleri ve fiyatları.
}

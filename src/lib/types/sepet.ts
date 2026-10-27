import type { BiletKategorisi } from "./bilet";
import type { Film } from "./film";
import type { BufeUrunu } from "./bufe";

export interface BiletSepetKalemi {
  tur: "bilet"; // Sepet kaleminin bilet olduğunu belirtir.
  film: Film; // Bilet kaleminin bağlı olduğu film.
  bilet: BiletKategorisi; // Seçilen bilet türü ve fiyatı.
  seans: string; // Seçilen gösterim saati.
  seansId?: string; // SQLite kaynaklı seans kimliği.
  salon: string; // Seçilen gösterim salonu.
  koltuklar: string[]; // Sepet kaleminde seçilen koltuk kodları.
  adet: number; // Bu kalemdeki bilet adedi.
  vipKoltukSayisi: number; // VIP koltukların ek fiyat hesabındaki adedi.
  toplamTutar: number; // Bilet kaleminin Türk lirası cinsinden toplamı.
}

export interface BufeSepetKalemi {
  tur: "bufe"; // Sepet kaleminin büfe ürünü olduğunu belirtir.
  urun: BufeUrunu; // Sepete eklenen büfe ürünü.
  porsiyonAdi?: string; // Seçilen porsiyon varsa görünen adı.
  birimFiyat: number; // Seçilen porsiyonun Türk lirası cinsinden fiyatı.
  adet: number; // Sepete eklenen ürün adedi.
}

export type SepetKalemi = BiletSepetKalemi | BufeSepetKalemi;

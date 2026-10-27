export type KoltukDurumu = "bos" | "dolu" | "secili";
export type KoltukKategorisi = "standart" | "vip";
export type BiletDurumu = "rezerve" | "onaylandi" | "kullanildi" | "iptal";

export interface BiletKategorisi {
  ad: string; // Bilet türünün kullanıcıya gösterilen adı.
  fiyat: number; // Bilet türünün Türk lirası cinsinden fiyatı.
}

export interface Koltuk {
  id: string; // Koltuğun benzersiz salon içi kodu, örneğin A3.
  sira: string; // Koltuğun bulunduğu sıra harfi.
  no: number; // Koltuğun sıra içindeki numarası.
  durum: KoltukDurumu; // Koltuğun sabit uygunluk durumlarından biri.
  kategori: KoltukKategorisi; // Koltuğun standart veya VIP kategorisi.
}

export interface Bilet {
  kod: string; // Rezervasyona ait benzersiz bilet doğrulama kodu.
  baslik: string; // Biletin bağlı olduğu filmin satın alma anındaki adı.
  tarih: string; // Biletin oluşturulma tarihi ISO-8601 biçiminde.
  seans: string; // Bilet üzerindeki gösterim saati.
  salon: string; // Biletin kullanılacağı salon adı.
  koltuklar: string[]; // Bilet kapsamında ayrılan koltuk kodları.
  kategori: string; // Satın alınan bilet türünün adı.
  adet: number; // Satın alınan bilet adedi.
  vipKoltukSayisi?: number; // Sepet hesabında kullanılan VIP koltuk adedi.
  bufeOzet?: string; // Rezervasyona bağlı isteğe bağlı büfe sipariş özeti.
  indirimBilgi?: string; // Uygulanan indirim kodu veya açıklaması.
  toplamTutar: number; // Bilet kaydının Türk lirası cinsinden toplamı.
  filmId?: number; // Eski kayıtlarla uyumlu, ilişkili film kimliği.
  seansId?: string; // Eski kayıtlarla uyumlu, ilişkili seans kimliği.
  siparisId?: string;
  durum?: BiletDurumu; // Biletin sabit rezervasyon ve kullanım durumlarından biri.
}

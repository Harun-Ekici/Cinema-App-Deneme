# CineQ Yönetim Paneli — React Arayüz Görevi

> **Rol:** UX tasarımcısı + arayüz geliştirici. **Çıktı:** React + TypeScript ile çalışan, tam özellikli bir **sinema yönetim paneli arayüzü** (sunucusuz, mock veriyle).
> **Kapsam:** Filmler, seanslar (takvim), salonlar ve **koltuk haritası editörü**, büfe, siparişler/biletler, müşteriler; durumlar, gündüz-gece teması, duyarlı düzen, erişilebilirlik.

## 0. Ürün bağlamı

**CineQ**, sinema bileti ve büfe siparişini tek akışta toplayan bir uygulamadır. Müşteri vizyondaki filmleri keşfeder (tür filtresi, arama), film ve seans seçer, salon haritasında **koltuk** seçer (Standart/VIP), **büfeden** mısır/içecek/menü ekler, tek sepetten öder ve benzersiz bir **bilet kodu (PNR) + QR/barkod** alır. Slogan: *"Vizyondaki filmleri keşfedin, koltuğunuzu seçin ve sinema büfenizi tek akışta yönetin."* Diller: Türkçe, İngilizce, Almanca, Arapça (RTL). İleride abonelik planı düşünülmektedir.

Panelin yönettiği şeyler: filmler, seanslar, sinemalar ve salonlar, koltuk haritaları, büfe ürünleri ve menüler, siparişler ve biletler (kapıda doğrulama dahil), müşteriler, kampanya/abonelik, destek mesajları, içerik sayfaları (4 dil), yöneticiler, denetim günlüğü.

## A. Çalışma kuralları (bu belge tek kaynaktır)

Bu belgenin dışında hiçbir repoya, koda ya da dosyaya erişimin yok ve gerekmiyor. Tüm veri tipleri, örnek veri, iş kuralları, renkler ve ekran listesi aşağıda **tam olarak** verilmiştir. Belgede olmayan bir bilgiyi uydurma; eksik gördüğün yeri teslimde "Açık sorular" başlığıyla yaz.

### A.1 Teknoloji

| Konu | Karar |
|---|---|
| Çatı | React 18 + TypeScript (`strict: true`) + Vite |
| Yönlendirme | React Router (v6+) |
| Stil | Düz CSS ya da CSS Modules. **Tüm renkler, boşluklar ve köşe değerleri CSS değişkenlerinden** gelir (bkz. §C). Satır içi sabit renk (`#abc123`) yasaktır. |
| Bileşen kütüphanesi | Yok (MUI, Ant vb. kullanma). Yalnızca ikon için tek bir ikon paketi serbest. |
| Durum | `useState`/`useReducer`/Context. Harici durum kütüphanesi gerekmez. |
| Veri | Sunucu yok. `src/api/` altında **mock adaptör**: ilk açılışta seed veriyle başlar, değişiklikleri `localStorage`'a (`cineq-admin:*` anahtarları) yazar, her çağrı 300–600 ms gecikmeli `Promise` döner, ara sıra (≈ %5) hata fırlatabilir (hata durumunu göstermek için). Sonradan gerçek API'ye geçiş yalnız bu klasörü değiştirmelidir. |
| Dil | Arayüz metinleri `src/i18n/` altındaki sözlükten gelir; varsayılan Türkçe. Kodda tanımlayıcılar İngilizce. Diller: TR (ana), EN, DE, AR; AR için RTL düzen (PNR, e-posta LTR kalır). |
| Tema | Gündüz / Gece / Sistem. `<html data-tema="gece">` özniteliğiyle; tercih `localStorage`'da. |
| Erişilebilirlik | WCAG AA kontrast, klavye ile tam kullanım, görünür odak halkası, durumlar yalnız renkle değil **ikon/metinle** de belirtilir, form alanlarında `label`, tablolarda `caption` ve `scope`. |
| Duyarlılık | 360 px (telefon) → 1440 px. Tablolar dar ekranda kart listesine dönüşür. |

### A.2 Önerilen klasör yapısı

```
src/
  api/            # mock adaptör, seed, gecikme/hata simülasyonu
  domain/         # tipler (§D) + saf iş kuralı fonksiyonları (§F)
  i18n/           # tr.ts, (varsa diğer diller)
  components/     # genel bileşenler (§E)
  features/       # her ekran için bir klasör (§G)
  styles/         # tokens.css (§C), base.css
  App.tsx, main.tsx
```

`domain/` ve `components/` içinde **uygulamaya özel import olmaz**: bileşenler jenerik prop'larla çalışır, dış bağımlılığı yoktur, stilleri yalnız CSS değişkenlerinden alır.

### A.3 Genel bileşen sözleşmesi (§E'deki listenin ortak kuralları)

- Her bileşen `Props` arayüzünü dışa aktarır; `any` yok.
- Metinler prop olarak gelir ya da sözlükten çekilir; bileşen içine sabit Türkçe metin gömülmez.
- Her veri bileşeni dört durumu destekler: **yükleniyor** (iskelet), **boş** (açıklama + eylem), **hata** (mesaj + "Tekrar dene"), **dolu**.
- Yıkıcı eylemler `ConfirmDialog` ile onaylanır; neden gerekiyorsa metin kutusu zorunludur.
- Tablolarda sıralama, sayfalama (10/25/50), sütun gizleme ve CSV dışa aktarma ortak `DataTable` üzerinden gelir.

### A.4 Teslim

1. Çalışan proje (`npm install && npm run dev`) ve `README.md` (kurulum, klasör yapısı, bilinen eksikler).
2. Her ekranın gündüz + gece, masaüstü + telefon ekran görüntüsü.
3. Aşağıdaki **kabul kriterleri** (§H) listesinin işaretlenmiş hâli.
4. "Açık sorular" listesi (varsa).

Bu görev bir **yönetim paneli arayüzüdür**; gerçek kişisel veri girilmez, örnek veriler uydurmadır.

## B. Ürün sözlüğü

| Terim | Anlamı |
|---|---|
| Bilet kodu (PNR) | `CNQ-<salon>-<seans>-<6 haneli rastgele>`, örn. `CNQ-S3-2130-7F4K2Q` (`CNQ` önek · `S3` salon numarası · `2130` seans saati 21:30 · 6 hane rastgele) |
| Salon tipi | IMAX · 2D · 3D |
| Koltuk kategorisi | Standart · VIP |
| Koltuk durumu | boş · dolu · seçili · kullanılamaz (renk + şekil/ikon + etiket birlikte) |
| Film durumu | vizyonda · yakında |
| Sipariş durumu | bekliyor → ödendi → (kapıda) kullanıldı; iptal/iade uç durumları |

## C. Tasarım token'ları (`src/styles/tokens.css`)

```css
:root {
  --renk-ana: #e11d48;   --renk-vurgu: #d97706;   --renk-koyu: #0f172a;
  --zemin: #f8fafc;      --kart: #ffffff;
  --yazi: #0f172a;       --yazi-soluk: #64748b;   --kenar: #e2e8f0;
  --radius: 14px;
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  /* Markada tanımlı DEĞİL; panel için eklenen durum token'ları (AA kontrastlı, iki tema): */
  --durum-basarili: #15803d; --durum-basarili-zemin: #dcfce7;
  --durum-uyari: #92400e;    --durum-uyari-zemin: #fef3c7;
  --durum-hata: #991b1b;     --durum-hata-zemin: #fee2e2;
  --durum-bilgi: #1d4ed8;    --durum-bilgi-zemin: #dbeafe;
}
:root[data-tema="gece"] {
  --renk-ana: #f43f5e;   --renk-vurgu: #f59e0b;   --renk-koyu: #020617;
  --zemin: #0b0f19;      --kart: #151c2e;
  --yazi: #f8fafc;       --yazi-soluk: #94a3b8;   --kenar: #1e293b;
  --durum-basarili: #4ade80; --durum-basarili-zemin: #052e16;
  --durum-uyari: #fcd34d;    --durum-uyari-zemin: #451a03;
  --durum-hata: #fca5a5;     --durum-hata-zemin: #450a0a;
  --durum-bilgi: #93c5fd;    --durum-bilgi-zemin: #172554;
}
```

Marka: **CineQ** (logo metni `Cine` + vurgulu `Q`; sinema bileti ve film makarası simgesi); kırmızı–siyah sinema teması. Üst çubuk `--renk-koyu`. **VIP koltuk/rozet = `--renk-vurgu`** (kehribar), birincil eylem = `--renk-ana` (kırmızı). Kırmızı hem marka hem hata çağrışımı taşıdığından **hata/iptal durumları `--durum-hata` token'ı + ikon + metinle** gösterilir, yalnız renge güvenilmez. `--durum-*` token'ları marka belgesinde olmayan, bu görev için **önerilen** değerlerdir; tasarımcı AA kontrastı koruyarak değiştirebilir ve gerekçesini README'ye yazar. Afiş görseli yoksa CSS gradyanı yer tutucu. Koltuk haritası RTL dilde de **sahne yönü sabit** kalır (satır düzeni ayna çevrilmez); gerekçeyi README'ye yaz.

## D. Veri tipleri (`src/domain/types.ts`) — olduğu gibi kullan

```ts
// ---- Ortak yönetim tipleri (tüm paneller) ----
export type Lang = "tr" | "en" | "ar" | "fa" | "de";
export type AdminRole = "owner" | "support" | "content" | "viewer";

export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number }
export interface ListQuery {
  search?: string;
  page: number;               // 1'den başlar
  pageSize: 10 | 25 | 50;
  sort?: { key: string; dir: "asc" | "desc" };
  filters?: Record<string, string | string[] | number | boolean | undefined>;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;            // en az 10 karakter
  lang: Lang;
  status: "new" | "in-progress" | "answered" | "spam";
  assignee?: string;          // AdminUser.id
  createdAt: string;          // ISO
  replies: { id: string; authorId: string; body: string; at: string; internal: boolean }[];
}

export interface ContentPage {
  id: string;
  slug: "hakkinda" | "gizlilik" | "kosullar" | "iletisim";
  lang: Lang;
  title: string;
  body: string;               // basit biçimlendirilmiş metin
  status: "draft" | "published";
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt?: string;
}

export interface AuditLogEntry {
  id: string;
  at: string;                 // ISO
  actorId: string;
  action: string;             // örn. "listing.remove", "rule.publish", "pii.reveal"
  entity: string;             // örn. "Listing"
  entityId: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}

// ---- CineQ çekirdek tipleri ----
export type FilmDurumu = "vizyonda" | "yakinda" | "arsiv";
export type Tur = "Aksiyon" | "Dram" | "Animasyon" | "Bilim Kurgu" | "Komedi" | "Gerilim" | "Belgesel";
export type SalonTipi = "IMAX" | "2D" | "3D";
export type KoltukKategorisi = "standart" | "vip";
export type KoltukDurumu = "bos" | "dolu" | "secili" | "kullanilamaz";
export type SiparisDurumu = "bekliyor" | "odendi" | "kullanildi" | "iptal" | "iade";

export interface Film {
  id: number;
  ad: Partial<Record<"tr" | "en" | "de" | "ar", string>> & { tr: string };
  afis?: string;
  gradyan: string;                       // afiş yoksa yer tutucu
  sinopsis: string;
  yonetmen: string;
  oyuncular: string[];
  sureDk: number;
  turler: Tur[];
  imdb?: number;                         // 0–10
  yasSiniri: number;                     // 0, 7, 13, 16, 18
  durum: FilmDurumu;
}

export interface Sinema { id: string; ad: string; sehir: string; adres: string }

export interface KoltukHaritasi {
  satir: number;                         // örn. 10
  sutun: number;                         // örn. 14
  koridorSutunlari: number[];            // boşluk bırakılan sütun indeksleri (0'dan)
  vipSatirlari: number[];                // VIP satır indeksleri (0'dan, ön sıra = 0)
  kullanilamaz: { satir: number; sutun: number }[];
}

export interface Salon {
  id: string;
  sinemaId: string;
  numara: number;                        // S3 → 3
  ad: string;
  tip: SalonTipi;
  harita: KoltukHaritasi;
  durum: "taslak" | "yayinda";
}

export interface Seans {
  id: string;
  filmId: number;
  salonId: string;
  baslangic: string;                     // ISO "2026-10-18T21:30"
  dil: "tr" | "en" | "de" | "ar";
  altyazi?: "tr" | "en" | "de" | "ar";
  fiyat: Record<KoltukKategorisi, number>;   // TL
  iptal?: { neden: string; at: string };
}

export interface KoltukRezervasyonu {
  seansId: string;
  satir: number;
  sutun: number;
  durum: Exclude<KoltukDurumu, "kullanilamaz">;   // "bos" kayıtta tutulmaz; "secili" = geçici tutma
  siparisId?: string;
  tutmaBitis?: string;                   // geçici tutma süresi (ISO)
}

export type BufeKategori = "misir" | "icecek" | "atistirmalik" | "menu";
export interface BufeUrunu {
  id: string;
  ad: Record<"tr" | "en" | "de" | "ar", string>;
  kategori: BufeKategori;
  boyut?: "Küçük" | "Orta" | "Büyük";
  fiyat: number;
  stok: number;
  aktif: boolean;
}
export interface BufeMenusu { id: string; ad: string; icerik: { urunId: string; adet: number }[]; fiyat: number; aktif: boolean }

export interface Bilet {
  kod: string;                           // CNQ-S3-2130-7F4K2Q
  seansId: string;
  satir: number;
  sutun: number;
  kategori: KoltukKategorisi;
  fiyat: number;
}
export interface Siparis {
  id: string;
  musteriId: string;
  biletler: Bilet[];
  bufe: { urunId?: string; menuId?: string; adet: number; birimFiyat: number }[];
  toplam: number;
  durum: SiparisDurumu;
  olusturma: string;
  kullanimZamani?: string;               // kapıda doğrulandı
}

// ---- Yönetim varlıkları ----
export interface Musteri { id: string; ad: string; eposta: string; favoriFilmler: number[]; siparisSayisi: number; durum: "aktif" | "engelli"; kayit: string }
export interface Kampanya {
  id: string; ad: string; tur: "yuzde" | "tutar" | "n-al-m-ode"; deger: number;
  kapsam: "bilet" | "bufe" | "ikisi"; baslangic: string; bitis: string; durum: "taslak" | "aktif" | "bitti";
}
export interface AbonelikPlani { id: string; ad: string; aylikFiyat: number; ayricalik: string[]; durum: "taslak" | "aktif" | "kapali" }   // ileride
```

## D2. Örnek veri (seed)

En az **12 film (8 vizyonda, 4 yakında), 2 sinema, 5 salon (IMAX, 2D, 3D dahil; en az biri VIP satırlı), 40 seans (önümüzdeki 7 gün), 30 sipariş (tüm durumlar), 12 büfe ürünü, 3 menü, 15 müşteri, 4 kampanya, 12 mesaj, 4 yönetici, 40 denetim kaydı** üret. Film adları ve kişiler **uydurmadır** (gerçek film/oyuncu adı kullanma). Çekirdek referans:

```ts
export const ornekHarita: KoltukHaritasi = {
  satir: 10, sutun: 14, koridorSutunlari: [6], vipSatirlari: [8, 9], kullanilamaz: [{ satir: 0, sutun: 0 }, { satir: 0, sutun: 13 }],
};

export const ornekFilm: Film = {
  id: 1, ad: { tr: "Örnek Film", en: "Sample Film" }, gradyan: "linear-gradient(135deg, #e11d48, #0f172a)",
  sinopsis: "Kısa örnek özet.", yonetmen: "Örnek Yönetmen", oyuncular: ["Örnek Oyuncu 1", "Örnek Oyuncu 2"],
  sureDk: 118, turler: ["Aksiyon", "Bilim Kurgu"], imdb: 7.4, yasSiniri: 13, durum: "vizyonda",
};

export const ornekSeans: Seans = {
  id: "s-001", filmId: 1, salonId: "salon-3", baslangic: "2026-10-18T21:30", dil: "tr", altyazi: "en",
  fiyat: { standart: 220, vip: 340 },
};

export const bufeSeed: BufeUrunu[] = [
  { id: "b1", ad: { tr: "Mısır", en: "Popcorn", de: "Popcorn", ar: "فشار" }, kategori: "misir", boyut: "Orta", fiyat: 120, stok: 200, aktif: true },
  { id: "b2", ad: { tr: "Kola", en: "Cola", de: "Cola", ar: "كولا" }, kategori: "icecek", boyut: "Büyük", fiyat: 80, stok: 300, aktif: true },
];
```

Fiyatlar örnektir (ürün fikrinde fiyat verilmemiştir); formlarda düzenlenebilir.

## E. Genel bileşen kitaplığı (jenerik, projeye bağımlı olmayan)

| Bileşen | Sözleşme (özet) |
|---|---|
| `AppShell` | Yan menü (daraltılabilir) + üst çubuk (arama, tema, dil, kullanıcı menüsü) + içerik alanı; `navItems: {to, label, icon, badge?}[]` |
| `DataTable<T>` | `columns: {key, header, render?, sortable?, width?}[]`, `rows: T[]`, `rowKey`, `onRowClick?`, sıralama/sayfalama/sütun gizleme/CSV, dört durum |
| `FilterBar` | Arama kutusu + `filters: {key, label, type: 'select'|'multi'|'range'|'date-range'|'toggle', options?}[]`; seçili filtreler çip olarak görünür, "Temizle" düğmesi |
| `StatusBadge` | `tone: 'success'|'warning'|'danger'|'info'|'neutral'`, `icon?`, `label`; renk + ikon + metin |
| `StatCard` | Başlık, değer, değişim (%), isteğe bağlı mini grafik |
| `Chart` (basit) | Çizgi, çubuk, halka, histogram; SVG ile, kütüphanesiz; erişilebilir tablo alternatifi |
| `FormField` | `label`, `hint`, `error`, `required`; çocuk olarak input/select/textarea |
| `Drawer` / `Modal` | Odak kapanı, Esc ile kapanma, `aria-modal` |
| `ConfirmDialog` | `title`, `message`, `confirmLabel`, `tone`, `requireReason?` |
| `Toast` | Başarı/hata/bilgi, 4 sn, kapatılabilir, `aria-live="polite"` |
| `EmptyState` | İkon + başlık + açıklama + eylem düğmesi |
| `Skeleton` | Satır, kart, grafik iskeletleri |
| `Tabs` | Klavye oklarıyla gezinme |
| `Stepper` | Adımlı durum çizgisi (`steps`, `current`, `terminal?`) |
| `MaskedValue` | Hassas değeri maskeler (`••••`), "Göster" düğmesi; her gösterim `onReveal` olayı üretir (denetim kaydı için) |
| `JsonDiff` | İki nesne arasında önce/sonra karşılaştırma (denetim günlüğünde) |
| `CopyText` | Kopyalanabilir monospace metin (kodlar, kimlikler) |
| `RichTextLite` | Basit biçimlendirme (kalın, liste, bağlantı); içerik sayfaları için |
| `ThemeToggle`, `LangSwitch` | Tema ve dil seçici |

**Bu projeye özel bileşenler**

| Bileşen | Sözleşme |
|---|---|
| `SeatMapEditor` | Salon haritası düzenleyici: satır/sütun sayısı, koridor sütunu ekle/çıkar, VIP satırı işaretle, koltuğu "kullanılamaz" yap; fare sürükleyerek çoklu seçim + **klavyeyle** ok tuşu/Boşluk; sahne çubuğu üstte |
| `SeatMapView` | Seans doluluğu: boş/dolu/seçili/kullanılamaz/VIP, **renk + şekil + etiket**; koltuk tıklanınca çekmece (sipariş bağlantısı) |
| `SeatLegend` | Açıklama (şekil + renk + ad) |
| `ScheduleGrid` | Seans takvimi: satırlar = salon, sütunlar = saat; film süresi kadar şerit; sürükle-taşı; çakışma kırmızı + metin uyarısı |
| `OverlapWarning` | "Salon S3, 21:30–23:35 arası dolu" |
| `PnrScanner` | Kapıda doğrulama: büyük tek alan (PNR yaz/yapıştır) → bilet kartı + "Kullanıldı işaretle" |
| `TicketCard` | PNR (mono), film, seans, koltuk, kategori, QR yer tutucu |
| `PosterThumb` | Afiş ya da gradyan |
| `MenuComposer` | Büfe kombo içeriği: ürün + adet; toplam ve indirim özeti |

## F. İş kuralları (`src/domain/rules.ts`) — referans uygulama

```ts
export const ALFA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";                 // 6 haneli rastgele bölüm
export const pnrBicimi = /^CNQ-S\d{1,2}-\d{4}-[A-HJ-NP-Z2-9]{6}$/;

export function pnrUret(salonNo: number, baslangic: string, rastgele6: string): string {
  const saat = baslangic.slice(11, 13) + baslangic.slice(14, 16);          // "2130"
  return `CNQ-S${salonNo}-${saat}-${rastgele6}`;
}

export const koltukAdi = (satir: number, sutun: number) => `${String.fromCharCode(65 + satir)}${sutun + 1}`;   // A1, B7 ...

export const koltukKategorisi = (h: KoltukHaritasi, satir: number): KoltukKategorisi =>
  h.vipSatirlari.includes(satir) ? "vip" : "standart";

export const kullanilabilirKoltuklar = (h: KoltukHaritasi) => {
  const liste: { satir: number; sutun: number }[] = [];
  for (let r = 0; r < h.satir; r++)
    for (let c = 0; c < h.sutun; c++)
      if (!h.koridorSutunlari.includes(c) && !h.kullanilamaz.some(k => k.satir === r && k.sutun === c)) liste.push({ satir: r, sutun: c });
  return liste;
};

export const kapasite = (h: KoltukHaritasi) => kullanilabilirKoltuklar(h).length;

// Seans çakışması: aynı salonda [baslangic, baslangic + film süresi + temizlik arası) aralıkları kesişmemeli
export function cakisiyorMu(a: Seans, b: Seans, filmler: Film[], temizlikDk = 15): boolean {
  if (a.salonId !== b.salonId || a.id === b.id) return false;
  const bit = (s: Seans) =>
    new Date(s.baslangic).getTime() + (filmler.find(f => f.id === s.filmId)!.sureDk + temizlikDk) * 60000;
  const ab = new Date(a.baslangic).getTime(), bb = new Date(b.baslangic).getTime();
  return ab < bit(b) && bb < bit(a);
}

export const biletFiyati = (s: Seans, kat: KoltukKategorisi) => s.fiyat[kat];
export const siparisToplami = (s: Siparis) =>
  s.biletler.reduce((t, b) => t + b.fiyat, 0) + s.bufe.reduce((t, k) => t + k.adet * k.birimFiyat, 0);

export const doluKoltukSayisi = (rezervasyonlar: KoltukRezervasyonu[], seansId: string) =>
  rezervasyonlar.filter(r => r.seansId === seansId && r.durum === "dolu").length;
export const dolulukYuzdesi = (dolu: number, h: KoltukHaritasi) => Math.round((dolu / kapasite(h)) * 100);
```

Kurallar:
- Bir koltuk aynı seansta **tek siparişe** satılır; "seçili" geçici tutmadır (süre dolunca boşa döner).
- **Satılmış bileti olan seans** iptal edilir ya da taşınırsa kapsamlı uyarı gösterilir (etkilenen bilet sayısı, otomatik iade seçeneği).
- Fiyat değişikliği satılmış biletleri etkilemez.
- Büfe kalemi biletle birlikte iptal/iadede **ayrı satır** olarak gösterilir.
- Salon haritası **yayınlanmış** ve satışta olan seansı olan bir salonda değiştirilirse koltuk çakışması denetlenir (dolu koltuk silinemez).
- Şablon/eski "etkinlik" kayıtları (spor, konser, tiyatro) panelde **görünmez**.
- Müşteri adı ve e-posta varsayılan maskeli; gösterim denetim kaydına yazılır.

## G. Ekranlar ve rotalar

| Rota | Ekran | İçerik ve davranış |
|---|---|---|
| `/` | **Panel Özeti** | KPI: günlük bilet, doluluk %, ciro (bilet + büfe), en çok izlenen film, seans doluluk ısı haritası, büfe/bilet oranı. Filtre: tarih, sinema, film. |
| `/filmler` | **Filmler** | `PosterThumb`'lı tablo: ad, tür, süre, IMDb, durum. Form: ad (4 dil), sinopsis, yönetmen, oyuncular, süre, tür çoklu seçim, afiş yükleme, yaş sınırı, durum. Vizyona al, yakında, arşivle. |
| `/seanslar` | **Seanslar** | `ScheduleGrid` (takvim) ve liste görünümü; seans formu (film, salon, saat, dil/altyazı, Standart/VIP fiyat) + `OverlapWarning`; haftalık çoğalt; iptal. |
| `/seanslar/:id` | **Seans Doluluğu** | `SeatMapView`, doluluk %, satılan koltuk detayı; koltuğu serbest bırak/bloke et. |
| `/salonlar` | **Salonlar** | Sinema → salon, tip, kapasite; `SeatMapEditor`; kopyala, yayınla. |
| `/bufe` | **Büfe** | Ürün tablosu + form; `MenuComposer` ile kombo; stok güncelle, pasifleştir. |
| `/siparisler` | **Siparişler & Biletler** | Tablo: sipariş no, müşteri (maskeli), film/seans, koltuklar, büfe, toplam, durum. Filtre: PNR arama, durum, film, tarih. Detayda `TicketCard`'lar; iptal/iade, bileti yeniden gönder. |
| `/kapi` | **Kapıda Doğrulama** | `PnrScanner`; sonuç: geçerli / kullanılmış / yanlış seans / geçersiz biçim. |
| `/musteriler` | **Müşteriler** | Tablo + detay (rezervasyon geçmişi, favori filmler); Engelle, Veriyi sil (KVKK). |
| `/kampanyalar` | **Kampanya / Abonelik** | Kampanya formu; abonelik planları (ileride, "Planlanan" etiketli). |
| `/mesajlar`, `/icerik` | **Mesajlar, İçerik** | Konuşma görünümü; sayfa × dil matrisi (4×4: TR/EN/DE/AR), RTL önizleme. |
| `/yoneticiler`, `/denetim`, `/ayarlar` | **Yöneticiler, Denetim, Ayarlar** | Rol–izin matrisi; `JsonDiff`'li günlük; tema/dil. |

## H. Kabul kriterleri

- [ ] `SeatMapEditor` ile 10×14 harita (1 koridor, 2 VIP satır, 2 kullanılamaz koltuk) kurulur; kapasite `10×13 − 2 = 128` görünür.
- [ ] Koltuk durumları renk **ve** şekil/ikon **ve** etiketle ayrılır; klavye ile seçilir.
- [ ] Seans formu çakışmayı (film süresi + 15 dk temizlik) anlık gösterir; çakışan kayıt kaydedilemez.
- [ ] Satılmış biletli seansın iptali/taşınması etkilenen bilet sayısını yazan onay ister.
- [ ] PNR doğrulaması `CNQ-S<n>-<hhmm>-<6>` biçimini denetler; kapıda 4 sonuç durumu ayrı gösterilir.
- [ ] Büfe satırları iade ekranında ayrı gösterilir.
- [ ] Hata/iptal durumları kırmızı marka rengi yerine `--durum-hata` + ikon + metinle verilir.
- [ ] RTL (AR) önizlemede koltuk haritası ayna çevrilmez; README'de gerekçesi yazar.
- [ ] 4 dil film/büfe adı yönetimi; PNR, e-posta LTR.
- [ ] Gündüz/gece; yalnız token (durum token'ları README'de gerekçeli); AA kontrast; 360 px'te harita yatay kaydırılabilir kapta, sayfa kaymaz.
- [ ] `README.md` ve ekran görüntüleri teslimde.

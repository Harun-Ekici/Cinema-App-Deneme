export type ListeDurumu = "yukleniyor" | "hata" | "bos" | "dolu";
export type UygulamaDili = "tr" | "en" | "ar" | "fa";

export const listeDurumMetinleri: Record<
  UygulamaDili,
  {
    yukleniyorFilmler: string;
    yukleniyorBiletler: string;
    filmHatasi: string;
    biletHatasi: string;
    tekrarDene: string;
    filmYokBaslik: string;
    filmYokAciklama: string;
    sonucYokBaslik: string;
    aramaSonucuYok: string;
    filtreleriTemizle: string;
    biletYokBaslik: string;
    biletYokAciklama: string;
    filmleriKesfet: string;
  }
> = {
  tr: {
    yukleniyorFilmler: "Filmler yükleniyor...",
    yukleniyorBiletler: "Biletleriniz yükleniyor...",
    filmHatasi: "Filmler yüklenemedi. Lütfen yeniden deneyin.",
    biletHatasi: "Biletleriniz yüklenemedi. Lütfen yeniden deneyin.",
    tekrarDene: "Tekrar dene",
    filmYokBaslik: "Henüz film yok",
    filmYokAciklama: "Şu anda listelenecek film bulunmuyor.",
    sonucYokBaslik: "Sonuç bulunamadı",
    aramaSonucuYok: "Aramanıza veya seçtiğiniz filtrelere uygun film yok.",
    filtreleriTemizle: "Filtreleri Temizle",
    biletYokBaslik: "Henüz biletiniz yok",
    biletYokAciklama: "Aktif veya geçmiş bir sinema biletiniz bulunmuyor.",
    filmleriKesfet: "Filmleri keşfet",
  },
  en: {
    yukleniyorFilmler: "Loading movies...",
    yukleniyorBiletler: "Loading your tickets...",
    filmHatasi: "Movies could not be loaded. Please try again.",
    biletHatasi: "Your tickets could not be loaded. Please try again.",
    tekrarDene: "Try again",
    filmYokBaslik: "No movies yet",
    filmYokAciklama: "There are no movies to show right now.",
    sonucYokBaslik: "No results found",
    aramaSonucuYok: "No movies match your search or selected filters.",
    filtreleriTemizle: "Clear filters",
    biletYokBaslik: "No tickets yet",
    biletYokAciklama: "You have no active or past movie tickets.",
    filmleriKesfet: "Explore movies",
  },
  ar: {
    yukleniyorFilmler: "جارٍ تحميل الأفلام...",
    yukleniyorBiletler: "جارٍ تحميل تذاكرك...",
    filmHatasi: "تعذر تحميل الأفلام. يرجى المحاولة مرة أخرى.",
    biletHatasi: "تعذر تحميل تذاكرك. يرجى المحاولة مرة أخرى.",
    tekrarDene: "حاول مرة أخرى",
    filmYokBaslik: "لا توجد أفلام بعد",
    filmYokAciklama: "لا توجد أفلام لعرضها الآن.",
    sonucYokBaslik: "لم يتم العثور على نتائج",
    aramaSonucuYok: "لا توجد أفلام تطابق البحث أو عوامل التصفية المحددة.",
    filtreleriTemizle: "مسح عوامل التصفية",
    biletYokBaslik: "لا توجد تذاكر بعد",
    biletYokAciklama: "ليس لديك تذاكر سينما حالية أو سابقة.",
    filmleriKesfet: "استكشف الأفلام",
  },
  fa: {
    yukleniyorFilmler: "در حال بارگذاری فیلم‌ها...",
    yukleniyorBiletler: "در حال بارگذاری بلیت‌های شما...",
    filmHatasi: "بارگذاری فیلم‌ها ممکن نشد. دوباره تلاش کنید.",
    biletHatasi: "بارگذاری بلیت‌های شما ممکن نشد. دوباره تلاش کنید.",
    tekrarDene: "تلاش دوباره",
    filmYokBaslik: "هنوز فیلمی وجود ندارد",
    filmYokAciklama: "در حال حاضر فیلمی برای نمایش وجود ندارد.",
    sonucYokBaslik: "نتیجه‌ای پیدا نشد",
    aramaSonucuYok: "فیلمی مطابق جستجو یا فیلترهای انتخاب‌شده پیدا نشد.",
    filtreleriTemizle: "پاک کردن فیلترها",
    biletYokBaslik: "هنوز بلیتی ندارید",
    biletYokAciklama: "بلیت سینمای فعال یا قبلی ندارید.",
    filmleriKesfet: "کاوش فیلم‌ها",
  },
};

export function uygulamaDiliniAl(): UygulamaDili {
  if (typeof document === "undefined") return "tr";
  const dil = document.documentElement.lang.slice(0, 2).toLowerCase();
  return dil === "en" || dil === "ar" || dil === "fa" ? dil : "tr";
}

export function gelistirmeDurumunuAl(): ListeDurumu | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;

  const durum = new URLSearchParams(window.location.search).get("durum");
  return durum === "yukleniyor" || durum === "hata" || durum === "bos" || durum === "dolu"
    ? durum
    : null;
}

export function gelistirmeDurumunuTemizle(): void {
  if (!import.meta.env.DEV || typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("durum");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

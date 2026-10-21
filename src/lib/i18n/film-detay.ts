import type { UygulamaDili } from "./liste-durumlari";

export const filmDetayMetinleri: Record<
  UygulamaDili,
  {
    geriDon: string;
    vizyonda: string;
    yakinda: string;
    sinopsis: string;
    yonetmen: string;
    oyuncular: string;
    seansSec: string;
    biletKategorisi: string;
    koltukSec: (adet: number) => string;
    perde: string;
    koltukAria: (kod: string, durum: string, tur: string) => string;
    dolu: string;
    secili: string;
    bos: string;
    standart: string;
    vip: string;
    vipSira: string;
    bufeyeEkle: string;
    azalt: string;
    artir: string;
    biletOzeti: (adet: number, koltuklar: string) => string;
    standartVipOzeti: (standart: number, vip: number, ekUcret: string) => string;
    dinamikFiyat: string;
    bufeSiparisleri: string;
    genelToplam: string;
    sepeteEkle: string;
    maxKoltukUyarisi: string;
    enAzBirKoltukUyarisi: string;
    sayfaBasligi: string;
    filmBulunamadi: string;
    filmBulunamadiAciklama: string;
    filmlereDon: string;
  }
> = {
  tr: {
    geriDon: "Geri Dön",
    vizyonda: "Vizyonda",
    yakinda: "Pek Yakında",
    sinopsis: "Sinopsis",
    yonetmen: "Yönetmen",
    oyuncular: "Oyuncular",
    seansSec: "1. Seans Saati Seçin",
    biletKategorisi: "2. Bilet Kategorisi",
    koltukSec: (adet) => `3. Koltuk Seçin (${adet} seçildi)`,
    perde: "PERDE / SCREEN",
    koltukAria: (kod, durum, tur) => `Koltuk ${kod} ${durum} ${tur}`,
    dolu: "Dolu",
    secili: "Seçili",
    bos: "Boş",
    standart: "Standart",
    vip: "VIP",
    vipSira: "VIP Sıra",
    bufeyeEkle: "4. Sinema Büfesi Ekle (Opsiyonel)",
    azalt: "Azalt",
    artir: "Artır",
    biletOzeti: (adet, koltuklar) => `Bilet (${adet} adet: ${koltuklar})`,
    standartVipOzeti: (standart, vip, ekUcret) => `↳ Standart (${standart}) + VIP (${vip}x +${ekUcret})`,
    dinamikFiyat: "Dinamik Fiyat",
    bufeSiparisleri: "Büfe Siparişleri",
    genelToplam: "Genel Toplam",
    sepeteEkle: "Sepete Ekle ve İlerle",
    maxKoltukUyarisi: "Tek seferde en fazla 6 koltuk seçebilirsiniz.",
    enAzBirKoltukUyarisi: "Lütfen en az 1 koltuk seçin.",
    sayfaBasligi: "Film bulunamadı — CineQ",
    filmBulunamadi: "Film bulunamadı",
    filmBulunamadiAciklama: "Bu film mevcut değil veya bağlantı geçersiz.",
    filmlereDon: "Filmlere Geri Dön",
  },
  en: {
    geriDon: "Go back",
    vizyonda: "Now showing",
    yakinda: "Coming soon",
    sinopsis: "Synopsis",
    yonetmen: "Director",
    oyuncular: "Cast",
    seansSec: "1. Choose a showtime",
    biletKategorisi: "2. Ticket category",
    koltukSec: (adet) => `3. Choose seats (${adet} selected)`,
    perde: "SCREEN",
    koltukAria: (kod, durum, tur) => `Seat ${kod}, ${durum}, ${tur}`,
    dolu: "Occupied",
    secili: "Selected",
    bos: "Available",
    standart: "Standard",
    vip: "VIP",
    vipSira: "VIP row",
    bufeyeEkle: "4. Add concessions (Optional)",
    azalt: "Decrease",
    artir: "Increase",
    biletOzeti: (adet, koltuklar) => `Tickets (${adet}: ${koltuklar})`,
    standartVipOzeti: (standart, vip, ekUcret) => `↳ Standard (${standart}) + VIP (${vip} × +${ekUcret})`,
    dinamikFiyat: "Dynamic pricing",
    bufeSiparisleri: "Concessions",
    genelToplam: "Total",
    sepeteEkle: "Add to cart and continue",
    maxKoltukUyarisi: "You can select up to 6 seats at a time.",
    enAzBirKoltukUyarisi: "Please select at least one seat.",
    sayfaBasligi: "Movie not found — CineQ",
    filmBulunamadi: "Movie not found",
    filmBulunamadiAciklama: "This movie is unavailable or the link is invalid.",
    filmlereDon: "Back to movies",
  },
  ar: {
    geriDon: "عودة",
    vizyonda: "يعرض الآن",
    yakinda: "قريبًا",
    sinopsis: "ملخص القصة",
    yonetmen: "المخرج",
    oyuncular: "طاقم التمثيل",
    seansSec: "١. اختر موعد العرض",
    biletKategorisi: "٢. فئة التذكرة",
    koltukSec: (adet) => `٣. اختر المقاعد (تم اختيار ${adet})`,
    perde: "الشاشة",
    koltukAria: (kod, durum, tur) => `المقعد ${kod}، ${durum}، ${tur}`,
    dolu: "مشغول",
    secili: "محدد",
    bos: "متاح",
    standart: "عادي",
    vip: "مميز",
    vipSira: "صف مميز",
    bufeyeEkle: "٤. أضف طلبات المقصف (اختياري)",
    azalt: "تقليل",
    artir: "زيادة",
    biletOzeti: (adet, koltuklar) => `التذاكر (${adet}: ${koltuklar})`,
    standartVipOzeti: (standart, vip, ekUcret) => `↳ عادي (${standart}) + مميز (${vip} × +${ekUcret})`,
    dinamikFiyat: "تسعير متغير",
    bufeSiparisleri: "طلبات المقصف",
    genelToplam: "الإجمالي",
    sepeteEkle: "أضف إلى السلة وتابع",
    maxKoltukUyarisi: "يمكنك اختيار ٦ مقاعد كحد أقصى في المرة الواحدة.",
    enAzBirKoltukUyarisi: "يرجى اختيار مقعد واحد على الأقل.",
    sayfaBasligi: "لم يتم العثور على الفيلم — CineQ",
    filmBulunamadi: "لم يتم العثور على الفيلم",
    filmBulunamadiAciklama: "هذا الفيلم غير متاح أو أن الرابط غير صالح.",
    filmlereDon: "العودة إلى الأفلام",
  },
  fa: {
    geriDon: "بازگشت",
    vizyonda: "در حال اکران",
    yakinda: "به‌زودی",
    sinopsis: "خلاصه داستان",
    yonetmen: "کارگردان",
    oyuncular: "بازیگران",
    seansSec: "۱. زمان نمایش را انتخاب کنید",
    biletKategorisi: "۲. دسته بلیت",
    koltukSec: (adet) => `۳. صندلی‌ها را انتخاب کنید (${adet} انتخاب‌شده)`,
    perde: "پرده نمایش",
    koltukAria: (kod, durum, tur) => `صندلی ${kod}، ${durum}، ${tur}`,
    dolu: "پر",
    secili: "انتخاب‌شده",
    bos: "خالی",
    standart: "معمولی",
    vip: "ویژه",
    vipSira: "ردیف ویژه",
    bufeyeEkle: "۴. افزودن خوراکی (اختیاری)",
    azalt: "کاهش",
    artir: "افزایش",
    biletOzeti: (adet, koltuklar) => `بلیت‌ها (${adet}: ${koltuklar})`,
    standartVipOzeti: (standart, vip, ekUcret) => `↳ معمولی (${standart}) + ویژه (${vip} × +${ekUcret})`,
    dinamikFiyat: "قیمت‌گذاری پویا",
    bufeSiparisleri: "سفارش خوراکی",
    genelToplam: "مجموع کل",
    sepeteEkle: "افزودن به سبد و ادامه",
    maxKoltukUyarisi: "در هر بار حداکثر ۶ صندلی می‌توانید انتخاب کنید.",
    enAzBirKoltukUyarisi: "لطفاً دست‌کم یک صندلی انتخاب کنید.",
    sayfaBasligi: "فیلم پیدا نشد — CineQ",
    filmBulunamadi: "فیلم پیدا نشد",
    filmBulunamadiAciklama: "این فیلم در دسترس نیست یا پیوند معتبر نیست.",
    filmlereDon: "بازگشت به فیلم‌ها",
  },
};

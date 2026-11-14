import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');

const deviceConfigs = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

const filmIds = [1, 2, 3, 4, 5, 6];
const staticPages = ['biletlerim', 'sepet', 'profil', 'iletisim', 'hakkinda', 'gizlilik', 'kosullar', 'izinler'];
const adminTabs = ['/', 'filmler', 'seanslar', 'salonlar', 'bufe', 'siparisler', 'kapi', 'musteriler'];

const routes = [
  '/',
  ...staticPages.map((page) => `/${page}`),
  ...filmIds.map((id) => `/film/${id}`),
  ...filmIds.map((id) => `/etkinlik/${id}`),
  '/film/detay',
  ...adminTabs.map((tab) => `/admin${tab === '/' ? '' : `#/${tab}`}`),
];

function slugifyRoute(route) {
  const normalized = route
    .replace(/^\/+/, '')
    .replace(/#\//g, '-')
    .replace(/[#?]/g, '-')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'root';
}

function buildMockData() {
  const now = new Date();
  const date = (offset, hour = 18) => {
    const dateTime = new Date(now);
    dateTime.setHours(hour, 0, 0, 0);
    dateTime.setDate(dateTime.getDate() + offset);
    return dateTime.toISOString();
  };

  const cinemas = [
    { id: 'sinema-1', ad: 'CineQ Merkez', sehir: 'İstanbul', adres: 'Örnek Mah. Sinema Cad. No:10' },
    { id: 'sinema-2', ad: 'CineQ Kıyı', sehir: 'İzmir', adres: 'Örnek Mah. Kıyı Sok. No:24' },
  ];

  const films = [
    { id: 1, ad: { tr: 'Örnek Film', en: 'Sample Film' }, gradyan: 'linear-gradient(135deg, var(--renk-ana), var(--renk-koyu))', sinopsis: 'Kısa örnek özet.', yonetmen: 'Örnek Yönetmen', oyuncular: ['Örnek Oyuncu 1', 'Örnek Oyuncu 2'], sureDk: 118, turler: ['Bilim Kurgu', 'Aksiyon'], imdb: 7.4, yasSiniri: 13, durum: 'vizyonda' },
    { id: 2, ad: { tr: 'Kızıl Ufkun Ötesi', en: 'Beyond the Red Horizon' }, gradyan: 'linear-gradient(135deg, #ef4444, #0f172a)', sinopsis: 'Gökyüzünün ötesinde kalan gizemli bir macera.', yonetmen: 'K. Yilmaz', oyuncular: ['A. Yıldız', 'M. Polat'], sureDk: 124, turler: ['Bilim Kurgu'], imdb: 7.9, yasSiniri: 13, durum: 'vizyonda' },
    { id: 3, ad: { tr: 'Sessiz Liman', en: 'Quiet Harbor' }, gradyan: 'linear-gradient(135deg, #14b8a6, #0f172a)', sinopsis: 'Şehirden kaçan iki dostun limana varışı.', yonetmen: 'N. Çelik', oyuncular: ['E. Kaya', 'S. Demir'], sureDk: 96, turler: ['Dram'], imdb: 7.1, yasSiniri: 0, durum: 'vizyonda' },
    { id: 4, ad: { tr: 'Bulutların Altında', en: 'Beneath the Clouds' }, gradyan: 'linear-gradient(135deg, #60a5fa, #0f172a)', sinopsis: 'Bir dağ kasabasında geçen sakin ama güçlü bir hikaye.', yonetmen: 'A. Toprak', oyuncular: ['B. Yaman', 'T. Aras'], sureDk: 106, turler: ['Drama'], imdb: 6.8, yasSiniri: 0, durum: 'yakinda' },
    { id: 5, ad: { tr: 'Son Perde', en: 'The Final Scene' }, gradyan: 'linear-gradient(135deg, #f59e0b, #0f172a)', sinopsis: 'Son sahneyi arayan sanatçılar kriz içindedir.', yonetmen: 'H. Erdem', oyuncular: ['C. Deniz', 'L. Akyol'], sureDk: 115, turler: ['Gerilim'], imdb: 7.5, yasSiniri: 16, durum: 'vizyonda' },
    { id: 6, ad: { tr: 'Derin Zaman', en: 'Deep Time' }, gradyan: 'linear-gradient(135deg, #a78bfa, #0f172a)', sinopsis: 'Zamanın katmanlarında saklı bir sır.', yonetmen: 'P. Karan', oyuncular: ['R. Işık', 'D. Karasu'], sureDk: 135, turler: ['Bilim Kurgu'], imdb: 8.1, yasSiniri: 13, durum: 'vizyonda' },
  ];

  const halls = [
    { id: 'salon-1', sinemaId: 'sinema-1', numara: 1, ad: 'Salon S1', tip: 'IMAX', harita: { satir: 10, sutun: 12, koridorSutunlari: [5], vipSatirlari: [8, 9], kullanilamaz: [{ satir: 0, sutun: 0 }, { satir: 0, sutun: 11 }] }, durum: 'yayinda' },
    { id: 'salon-2', sinemaId: 'sinema-1', numara: 2, ad: 'Salon S2', tip: '2D', harita: { satir: 9, sutun: 10, koridorSutunlari: [4], vipSatirlari: [7], kullanilamaz: [{ satir: 1, sutun: 4 }] }, durum: 'yayinda' },
    { id: 'salon-3', sinemaId: 'sinema-2', numara: 1, ad: 'Salon S1', tip: '3D', harita: { satir: 8, sutun: 12, koridorSutunlari: [5], vipSatirlari: [6], kullanilamaz: [{ satir: 3, sutun: 2 }] }, durum: 'yayinda' },
  ];

  const sessions = [
    { id: 'seans-001', filmId: 1, salonId: 'salon-1', baslangic: date(0, 11), dil: 'tr', altyazi: 'tr', fiyat: { tam: 180, standart: 180, ogrenci: 120, vip: 260 } },
    { id: 'seans-002', filmId: 2, salonId: 'salon-1', baslangic: date(0, 14), dil: 'tr', altyazi: 'en', fiyat: { tam: 200, standart: 200, ogrenci: 140, vip: 280 } },
    { id: 'seans-003', filmId: 3, salonId: 'salon-2', baslangic: date(1, 12), dil: 'tr', altyazi: 'tr', fiyat: { tam: 170, standart: 170, ogrenci: 110, vip: 245 } },
    { id: 'seans-004', filmId: 4, salonId: 'salon-2', baslangic: date(1, 18), dil: 'en', altyazi: 'tr', fiyat: { tam: 190, standart: 190, ogrenci: 125, vip: 270 } },
    { id: 'seans-005', filmId: 5, salonId: 'salon-3', baslangic: date(2, 15), dil: 'tr', altyazi: 'en', fiyat: { tam: 210, standart: 210, ogrenci: 135, vip: 300 } },
    { id: 'seans-006', filmId: 6, salonId: 'salon-3', baslangic: date(2, 20), dil: 'tr', altyazi: 'en', fiyat: { tam: 220, standart: 220, ogrenci: 150, vip: 330 } },
  ];

  const seatReservations = [
    { seansId: 'seans-001', satir: 1, sutun: 2, durum: 'dolu', siparisId: 'sip-100', tutmaBitis: date(0, 11) },
    { seansId: 'seans-001', satir: 1, sutun: 3, durum: 'dolu', siparisId: 'sip-101', tutmaBitis: date(0, 11) },
    { seansId: 'seans-002', satir: 2, sutun: 5, durum: 'dolu', siparisId: 'sip-102', tutmaBitis: date(0, 14) },
    { seansId: 'seans-003', satir: 4, sutun: 6, durum: 'dolu', siparisId: 'sip-103', tutmaBitis: date(1, 12) },
    { seansId: 'seans-005', satir: 5, sutun: 9, durum: 'dolu', siparisId: 'sip-104', tutmaBitis: date(2, 15) },
  ];

  const concessionProducts = [
    { id: 'bufe-01', ad: { tr: 'Mısır', en: 'Popcorn', ar: 'فشار' }, kategori: 'misir', boyut: 'Orta', fiyat: 120, stok: 80, aktif: true },
    { id: 'bufe-02', ad: { tr: 'Kola', en: 'Cola', ar: 'كولا' }, kategori: 'icecek', boyut: 'Büyük', fiyat: 80, stok: 65, aktif: true },
    { id: 'bufe-03', ad: { tr: 'Tuzlu Mısır', en: 'Salted Popcorn', ar: 'فشار مملح' }, kategori: 'misir', boyut: 'Büyük', fiyat: 145, stok: 55, aktif: true },
    { id: 'bufe-04', ad: { tr: 'Çikolata', en: 'Chocolate', ar: 'شوكولاتة' }, kategori: 'atistirmalik', fiyat: 55, stok: 90, aktif: true },
  ];

  const concessionMenus = [
    { id: 'menu-1', ad: 'İkili Keyif Menüsü', icerik: [{ urunId: 'bufe-01', adet: 1 }, { urunId: 'bufe-02', adet: 2 }], fiyat: 255, aktif: true, durum: 'aktif' },
    { id: 'menu-2', ad: 'Aile Paketi', icerik: [{ urunId: 'bufe-03', adet: 2 }, { urunId: 'bufe-04', adet: 2 }], fiyat: 420, aktif: true, durum: 'aktif' },
  ];

  const orders = [
    { id: 'sip-100', musteriId: 'guest', biletler: [{ kod: 'CNQ-S1-1100-A7F9Q2', seansId: 'seans-001', satir: 1, sutun: 2, kategori: 'standart', fiyat: 180 }], bufe: [{ urunId: 'bufe-01', adet: 2, birimFiyat: 120 }], toplam: 420, durum: 'odendi', olusturma: date(0, 10) },
    { id: 'sip-101', musteriId: 'guest', biletler: [{ kod: 'CNQ-S1-1400-C2Q5Z8', seansId: 'seans-002', satir: 2, sutun: 5, kategori: 'vip', fiyat: 280 }], bufe: [{ urunId: 'bufe-02', adet: 1, birimFiyat: 80 }], toplam: 360, durum: 'bekliyor', olusturma: date(1, 9) },
  ];

  const customers = [
    { id: 'musteri-01', ad: 'Ayşe Yılmaz', eposta: 'ayse@ornek.test', favoriFilmler: [1, 3], siparisSayisi: 2, durum: 'aktif', kayit: date(-12, 8) },
    { id: 'musteri-02', ad: 'Mehmet Demir', eposta: 'mehmet@ornek.test', favoriFilmler: [2, 5], siparisSayisi: 1, durum: 'aktif', kayit: date(-9, 10) },
  ];

  const campaigns = [
    { id: 'kampanya-1', ad: 'Hafta İçi Biletleri', tur: 'yuzde', deger: 15, kapsam: 'bilet', baslangic: date(-2, 9), bitis: date(6, 9), durum: 'aktif' },
    { id: 'kampanya-2', ad: 'Büfe Molası', tur: 'tutar', deger: 40, kapsam: 'bufe', baslangic: date(-1, 9), bitis: date(4, 9), durum: 'aktif' },
  ];

  const contactMessages = [
    { id: 'mesaj-01', name: 'Ece A.', email: 'ece@ornek.test', subject: 'Bilete erişim', message: 'Örnek destek talebi.', lang: 'tr', status: 'new', createdAt: date(-1, 8), replies: [] },
  ];

  const admins = [
    { id: 'admin-1', name: 'Deniz Yönetici', email: 'deniz@ornek.test', role: 'owner', active: true, lastLoginAt: date(-1, 12) },
    { id: 'admin-2', name: 'Ekin Destek', email: 'ekin@ornek.test', role: 'support', active: true, lastLoginAt: date(-2, 11) },
  ];

  const authSessions = [
    { id: 'auth-1', userId: 1, name: 'Deniz Yönetici', email: 'deniz@ornek.test', startedAt: date(-1, 9), endedAt: null, active: true },
  ];

  const auditLogs = [
    { id: 'audit-1', at: date(-1, 9), actorId: 'admin-1', action: 'login', entity: 'auth', entityId: 'auth-1', reason: 'Web demo girişi' },
    { id: 'audit-2', at: date(0, 10), actorId: 'admin-1', action: 'film_update', entity: 'film', entityId: '1', reason: 'Demo veri güncellemesi' },
  ];

  return { films, cinemas, halls, sessions, seatReservations, concessionProducts, concessionMenus, orders, customers, campaigns, contactMessages, admins, authSessions, auditLogs };
}

async function resolveServerUrl() {
  const ports = [Number(process.env.PORT || '4321'), 4321, 4322, 4323, 3000, 4173, 5173, 8080];
  const uniquePorts = [...new Set(ports.filter((port) => Number.isInteger(port) && port > 0))];

  for (const port of uniquePorts) {
    const target = `http://127.0.0.1:${port}`;
    try {
      const response = await fetch(target, { method: 'GET' });
      if (response.ok || response.status >= 200) {
        return target;
      }
    } catch {
      // no-op
    }
  }

  throw new Error('Astro development server could not be reached. Run `bun run dev -- --host 127.0.0.1 --port 4321` first.');
}

function buildInvokeHandler(data) {
  const normalized = { ...data };
  const flattenResource = (items) => items.map((item) => ({ ...item }));

  return async function invoke(command, args = {}) {
    const resourceName = typeof args.resource === 'string' ? args.resource : undefined;
    const resourceMap = {
      Film: normalized.films,
      Sinema: normalized.cinemas,
      Salon: normalized.halls,
      Seans: normalized.sessions,
      KoltukRezervasyonu: normalized.seatReservations,
      BufeUrunu: normalized.concessionProducts,
      BufeMenusu: normalized.concessionMenus,
      Siparis: normalized.orders,
      Musteri: normalized.customers,
      Kampanya: normalized.campaigns,
      ContactMessage: normalized.contactMessages,
    };

    if (command === 'vitrin_katalog') {
      return {
        films: normalized.films.map((film) => ({
          ...film,
          ad: JSON.stringify(film.ad),
          turler: film.turler,
          oyuncular: film.oyuncular,
          seanslar: normalized.sessions
            .filter((session) => session.filmId === film.id)
            .map((session) => ({
              id: session.id,
              salonId: session.salonId,
              baslangic: session.baslangic,
              dil: session.dil,
              altyazi: session.altyazi,
              fiyat: JSON.stringify(session.fiyat),
              salon: normalized.halls.find((hall) => hall.id === session.salonId),
              doluKoltuklar: normalized.seatReservations.filter((reservation) => reservation.seansId === session.id),
            })),
        })),
        bufe: normalized.concessionProducts.map((product) => ({ ...product, ad: JSON.stringify(product.ad) })),
        menuler: normalized.concessionMenus,
      };
    }

    if (command === 'auth_me') {
      return {
        user: { id: 1, name: 'Deniz Yönetici', email: 'deniz@ornek.test', status: 'active' },
        roles: ['owner', 'admin'],
        superAdmin: true,
        permissions: ['ViewAny:Film', 'ViewAny:Sinema', 'ViewAny:Salon', 'ViewAny:Siparis'],
      };
    }

    if (command === 'auth_owner_setup_required') return false;
    if (command === 'auth_login') return { user: { id: 1, name: 'Deniz Yönetici', email: args.email || 'deniz@ornek.test', status: 'active' }, roles: ['owner'], superAdmin: true, permissions: ['ViewAny:Film', 'ViewAny:Sinema', 'ViewAny:Salon', 'ViewAny:Siparis'] };
    if (command === 'auth_register') return { user: { id: 1, name: args.name || 'Demo Yönetici', email: args.email || 'deniz@ornek.test', status: 'active' }, roles: ['owner'], superAdmin: true, permissions: ['ViewAny:Film', 'ViewAny:Sinema', 'ViewAny:Salon', 'ViewAny:Siparis'] };
    if (command === 'auth_logout') return null;
    if (command === 'auth_session_index') return normalized.authSessions;
    if (command === 'user_index') return normalized.admins;
    if (command === 'cineq_dashboard') {
      const from = args.from ? new Date(args.from) : new Date();
      const to = args.to ? new Date(args.to) : new Date();
      const entries = normalized.sessions.filter((session) => {
        const day = new Date(session.baslangic);
        return day >= from && day <= to;
      });
      const bilet = normalized.orders.reduce((sum, order) => sum + order.biletler.length, 0);
      const ciro = normalized.orders.reduce((sum, order) => sum + Number(order.toplam || 0), 0);
      const seansDoluluk = entries.map((session) => ({
        seansId: session.id,
        baslangic: session.baslangic,
        dolu: normalized.seatReservations.filter((reservation) => reservation.seansId === session.id && reservation.durum === 'dolu').length,
        yuzde: 62,
      }));
      return { bilet, ciro, ortalamaDoluluk: 64, seansDoluluk, enCokIzlenen: [{ filmId: 1, ad: 'Örnek Film', bilet: 42 }, { filmId: 2, ad: 'Kızıl Ufkun Ötesi', bilet: 31 }], period: 'today' };
    }

    if (command === 'crud_index') {
      const items = resourceMap[resourceName] ?? [];
      const page = Number(args.query?.page ?? 1);
      const pageSize = Number(args.query?.pageSize ?? 100);
      const sliced = items.slice((page - 1) * pageSize, page * pageSize);
      return { items: sliced, total: items.length };
    }

    if (command === 'crud_store') {
      const data = args.data ?? {};
      const id = data.id ?? `demo-${Date.now()}`;
      const collection = resourceMap[resourceName] ?? [];
      collection.push({ ...data, id });
      return { ...data, id };
    }

    if (command === 'crud_update') {
      const collection = resourceMap[resourceName] ?? [];
      const targetIndex = collection.findIndex((item) => String(item.id) === String(args.id));
      if (targetIndex >= 0) {
        collection[targetIndex] = { ...collection[targetIndex], ...args.data };
        return collection[targetIndex];
      }
      return { ...args.data, id: args.id };
    }

    if (command === 'salon_yayinla') {
      const hall = normalized.halls.find((item) => item.id === args.id);
      if (hall) hall.durum = 'yayinda';
      return hall ?? { id: args.id, durum: 'yayinda' };
    }

    if (command === 'seans_olustur') {
      const payload = args.girdi ?? {};
      const next = { ...payload, id: `demo-seans-${Date.now()}` };
      normalized.sessions.push(next);
      return next;
    }

    if (command === 'seans_guncelle') {
      const session = normalized.sessions.find((item) => item.id === args.id);
      if (session) Object.assign(session, args.girdi);
      return session ?? { ...args.girdi, id: args.id };
    }

    if (command === 'seans_iptal') {
      const session = normalized.sessions.find((item) => item.id === args.id);
      if (session) session.iptal = { neden: args.neden || 'Demo iptali', at: new Date().toISOString() };
      return session ?? { id: args.id, iptal: { neden: args.neden || 'Demo iptali', at: new Date().toISOString() } };
    }

    if (command === 'misafir_biletlerim') return [];
    if (command === 'misafir_siparis_olustur') return { ok: true, orderId: `demo-order-${Date.now()}` };
    if (command === 'misafir_siparis_iptal') return { ok: true };
    if (command === 'bilet_dogrula') return { valid: true, order: normalized.orders[0] ?? null };
    if (command === 'permissions_status') return [];
    if (command === 'permission_request') return [];
    if (command === 'bildirim_gonder') return undefined;
    if (command === 'bilet_hesapla') {
      const girdi = args.girdi ?? {};
      return {
        pnrKodu: `CNQ-S1-${String(girdi.seans || '19:30').replace(':', '')}-${String(Date.now()).slice(-6)}`,
        filmAdi: girdi.filmAdi || 'Örnek Film',
        salon: girdi.salon || 'Salon S1',
        seans: girdi.seans || '19:30',
        adet: Number(girdi.adet || 1),
        dogrulamaOzeti: 'Demo bilet doğrulama başarılı.',
      };
    }

    return null;
  };
}

async function captureScreenshots() {
  fs.rmSync(screenshotsDir, { recursive: true, force: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const serverUrl = await resolveServerUrl();
  const browser = await chromium.launch({ headless: true });
  const mockData = buildMockData();

  try {
    const createdFiles = [];
    const seen = new Set();

    for (const route of routes) {
      const key = route;
      if (seen.has(key)) continue;
      seen.add(key);

      for (const device of deviceConfigs) {
        const page = await browser.newPage({
          viewport: { width: device.width, height: device.height },
          isMobile: device.name === 'phone',
          hasTouch: device.name === 'phone',
          deviceScaleFactor: 1,
        });

        await page.addInitScript((mock) => {
          window.__TAURI__ = {};
          window.__TAURI_INTERNALS__ = {
            invoke: async (command, args = {}) => {
              const resourceName = typeof args.resource === 'string' ? args.resource : undefined;
              const resourceMap = {
                Film: mock.films,
                Sinema: mock.cinemas,
                Salon: mock.halls,
                Seans: mock.sessions,
                KoltukRezervasyonu: mock.seatReservations,
                BufeUrunu: mock.concessionProducts,
                BufeMenusu: mock.concessionMenus,
                Siparis: mock.orders,
                Musteri: mock.customers,
                Kampanya: mock.campaigns,
                ContactMessage: mock.contactMessages,
              };

              if (command === 'vitrin_katalog') {
                return {
                  films: mock.films.map((film) => ({ ...film, ad: JSON.stringify(film.ad), seanslar: mock.sessions.filter((session) => session.filmId === film.id).map((session) => ({ ...session, fiyat: JSON.stringify(session.fiyat), salon: mock.halls.find((hall) => hall.id === session.salonId), doluKoltuklar: mock.seatReservations.filter((reservation) => reservation.seansId === session.id) })) })),
                  bufe: mock.concessionProducts.map((product) => ({ ...product, ad: JSON.stringify(product.ad) })),
                  menuler: mock.concessionMenus,
                };
              }

              if (command === 'auth_me') {
                return { user: { id: 1, name: 'Deniz Yönetici', email: 'deniz@ornek.test', status: 'active' }, roles: ['owner', 'admin'], superAdmin: true, permissions: ['ViewAny:Film', 'ViewAny:Sinema', 'ViewAny:Salon', 'ViewAny:Siparis'] };
              }

              if (command === 'auth_owner_setup_required') return false;
              if (command === 'auth_login') return { user: { id: 1, name: 'Deniz Yönetici', email: 'deniz@ornek.test', status: 'active' }, roles: ['owner'], superAdmin: true, permissions: ['ViewAny:Film', 'ViewAny:Sinema', 'ViewAny:Salon', 'ViewAny:Siparis'] };
              if (command === 'user_index') return mock.admins;
              if (command === 'auth_session_index') return mock.authSessions;
              if (command === 'cineq_dashboard') return { bilet: 42, ciro: 12480, ortalamaDoluluk: 68, seansDoluluk: mock.sessions.slice(0, 5).map((session, index) => ({ seansId: session.id, baslangic: session.baslangic, dolu: 14 + index, yuzde: 68 + index })), enCokIzlenen: [{ filmId: 1, ad: 'Örnek Film', bilet: 42 }, { filmId: 2, ad: 'Kızıl Ufkun Ötesi', bilet: 31 }], period: 'today' };
              if (command === 'crud_index') {
                const items = resourceMap[resourceName] ?? [];
                return { items, total: items.length };
              }
              if (command === 'bilet_hesapla') return { pnrKodu: 'CNQ-S1-1920-9A4C7E', filmAdi: 'Örnek Film', salon: 'Salon S1', seans: '19:20', adet: 2, dogrulamaOzeti: 'Demo bilet doğrulama başarılı.' };
              if (command === 'misafir_biletlerim') return [];
              if (command === 'misafir_siparis_olustur') return { ok: true };
              if (command === 'misafir_siparis_iptal') return { ok: true };
              if (command === 'permissions_status') return [];
              if (command === 'permission_request') return [];
              if (command === 'bildirim_gonder') return undefined;
              return null;
            },
          };

          const style = document.createElement('style');
          style.textContent = '#astro-dev-toolbar { display: none !important; }';
          document.head.appendChild(style);
        }, mockData);

        try {
          const fullUrl = new URL(route, serverUrl).toString();
          await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
          await page.evaluate(() => {
            document.querySelector('astro-dev-toolbar')?.remove();
          });
          await page.waitForTimeout(1200);
          const filename = `${slugifyRoute(route)}-${device.name}.png`;
          const destination = path.join(screenshotsDir, filename);
          await page.screenshot({ path: destination, fullPage: true });
          createdFiles.push(destination);
          console.log(`Saved ${filename}`);
        } finally {
          await page.close();
        }
      }
    }

    console.log(`\nTotal screenshots: ${createdFiles.length}`);
    console.log(`Folder: ${screenshotsDir}`);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch((error) => {
  console.error(error);
  process.exit(1);
});

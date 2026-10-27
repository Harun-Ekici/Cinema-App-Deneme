import { invoke } from "@tauri-apps/api/core";
import { mockAdapter, type AdminCollection, type MockAdapter } from "../api/mockAdapter";
import { seedData, type AdminSeedData } from "../api/seed";
import type {
  AdminAuthSession as AuthSessionRecord,
  AdminUser,
  AuditLogEntry,
  BufeMenusu,
  BufeUrunu,
  ContactMessage,
  Film,
  FilmDurumu,
  Kampanya,
  KoltukRezervasyonu,
  Musteri,
  Salon,
  SalonTipi,
  Seans,
  Siparis,
  Sinema,
  Tur,
} from "../domain/types";

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

export interface AdminAuthSession {
  user: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
  roles: string[];
  superAdmin: boolean;
  permissions: string[];
}

export interface DashboardMetrics {
  bilet: number;
  ciro: number;
  ortalamaDoluluk: number;
  seansDoluluk: {
    seansId: string;
    baslangic: string;
    dolu: number;
    yuzde: number;
  }[];
  enCokIzlenen: {
    filmId: number;
    ad: string | null;
    bilet: number;
  }[];
  period: "today" | "all";
}

export interface AdminDataAdapter extends MockAdapter {
  readonly isTauri: boolean;
  loadDashboardMetrics(): Promise<DashboardMetrics | null>;
  saveFilm(film: Film): Promise<Film>;
  createHall(input: Pick<Salon, "sinemaId" | "numara" | "ad" | "tip">): Promise<Salon>;
  publishHall(id: string): Promise<Salon>;
  createSession(session: Omit<Seans, "id">): Promise<Seans>;
  updateSession(session: Seans): Promise<Seans>;
  cancelSession(id: string, reason: string, refund: boolean): Promise<Seans>;
  refundOrder(id: string, reason: string): Promise<Siparis>;
  verifyTicket(code: string, use: boolean): Promise<unknown>;
}

const nativeCollections = new Set<AdminCollection>([
  "films", "cinemas", "halls", "sessions", "seatReservations", "concessionProducts",
  "concessionMenus", "orders", "customers", "campaigns", "contactMessages",
  "admins", "authSessions", "auditLogs",
]);
const requiredPermissions = ["ViewAny:Film", "ViewAny:Sinema", "ViewAny:Salon", "ViewAny:Siparis"];
const filmGenres = new Set<Tur>(["Aksiyon", "Dram", "Animasyon", "Bilim Kurgu", "Komedi", "Gerilim", "Belgesel"]);
export const OWNER_ACCOUNT_EMAIL = "harunekici@gmail.com";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJsonRecord(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readJsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function readArray(value: unknown): unknown[] {
  const parsed = readJsonValue(value);
  return Array.isArray(parsed) ? parsed : [];
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mapFilm(value: unknown): Film {
  if (!isRecord(value)) throw new Error("SQLite film kaydı nesne biçiminde değil.");
  const names = readJsonRecord(value.ad);
  const ad: Film["ad"] = {
    tr: text(names.tr, text(value.ad, "İsimsiz film")),
    ...(typeof names.en === "string" ? { en: names.en } : {}),
    ...(typeof names.de === "string" ? { de: names.de } : {}),
    ...(typeof names.ar === "string" ? { ar: names.ar } : {}),
  };
  const genres = Array.isArray(value.turler)
    ? value.turler.filter((genre): genre is Tur => typeof genre === "string" && filmGenres.has(genre as Tur))
    : [];
  const status: FilmDurumu = value.durum === "vizyonda" || value.durum === "arsiv" ? value.durum : "yakinda";
  return {
    id: number(value.id),
    ad,
    ...(typeof value.afis === "string" ? { afis: value.afis } : {}),
    gradyan: text(value.gradyan),
    sinopsis: text(value.sinopsis),
    yonetmen: text(value.yonetmen),
    oyuncular: Array.isArray(value.oyuncular) ? value.oyuncular.filter((actor): actor is string => typeof actor === "string") : [],
    sureDk: number(value.sureDk, 100),
    turler: genres,
    ...(typeof value.imdb === "number" ? { imdb: value.imdb } : {}),
    yasSiniri: number(value.yasSiniri),
    durum: status,
  };
}

function mapCinema(value: unknown): Sinema {
  if (!isRecord(value)) throw new Error("SQLite sinema kaydı nesne biçiminde değil.");
  return {
    id: text(value.id),
    ad: text(value.ad, "İsimsiz sinema"),
    sehir: text(value.sehir),
    adres: text(value.adres),
  };
}

function mapHall(value: unknown): Salon {
  if (!isRecord(value)) throw new Error("SQLite salon kaydı nesne biçiminde değil.");
  const map = readJsonRecord(value.harita);
  const mapSeats = Array.isArray(map.kullanilamaz) ? map.kullanilamaz.filter(isRecord).map((seat) => ({
    satir: number(seat.satir),
    sutun: number(seat.sutun),
  })) : [];
  const hallType: SalonTipi = value.tip === "IMAX" || value.tip === "3D" ? value.tip : "2D";
  return {
    id: text(value.id),
    sinemaId: text(value.sinemaId),
    numara: number(value.numara),
    ad: text(value.ad, "İsimsiz salon"),
    tip: hallType,
    harita: {
      satir: number(map.satir),
      sutun: number(map.sutun),
      koridorSutunlari: Array.isArray(map.koridorSutunlari) ? map.koridorSutunlari.filter((item): item is number => typeof item === "number") : [],
      vipSatirlari: Array.isArray(map.vipSatirlari) ? map.vipSatirlari.filter((item): item is number => typeof item === "number") : [],
      kullanilamaz: mapSeats,
    },
    durum: value.durum === "yayinda" ? "yayinda" : "taslak",
  };
}

function mapSession(value: unknown): Seans {
  if (!isRecord(value)) throw new Error("SQLite seans kaydı nesne biçiminde değil.");
  const price = readJsonRecord(value.fiyat);
  const fullPrice = number(price.tam, number(price.standart));
  return {
    id: text(value.id),
    filmId: number(value.filmId),
    salonId: text(value.salonId),
    baslangic: text(value.baslangic),
    dil: value.dil === "en" || value.dil === "de" || value.dil === "ar" ? value.dil : "tr",
    ...(typeof value.altyazi === "string" ? { altyazi: value.altyazi as Seans["altyazi"] } : {}),
    fiyat: {
      standart: fullPrice,
      tam: fullPrice,
      ogrenci: number(price.ogrenci, fullPrice),
      vip: number(price.vip, fullPrice),
    },
    ...(value.iptal ? { iptal: readJsonRecord(value.iptal) as Seans["iptal"] } : {}),
  };
}

function mapSeatReservation(value: unknown): KoltukRezervasyonu {
  if (!isRecord(value)) throw new Error("SQLite koltuk rezervasyonu nesne biçiminde değil.");
  return {
    seansId: text(value.seansId),
    satir: number(value.satir),
    sutun: number(value.sutun),
    durum: value.durum === "secili" ? "secili" : "dolu",
    ...(typeof value.siparisId === "string" ? { siparisId: value.siparisId } : {}),
    ...(typeof value.tutmaBitis === "string" ? { tutmaBitis: value.tutmaBitis } : {}),
  };
}

function mapConcessionProduct(value: unknown): BufeUrunu {
  if (!isRecord(value)) throw new Error("SQLite büfe ürünü nesne biçiminde değil.");
  const names = readJsonRecord(value.ad);
  const category = value.kategori;
  return {
    id: text(value.id),
    ad: {
      tr: text(names.tr, text(value.ad)),
      en: text(names.en, text(names.tr, text(value.ad))),
      de: text(names.de, text(names.tr, text(value.ad))),
      ar: text(names.ar, text(names.tr, text(value.ad))),
    },
    kategori: category === "misir" || category === "icecek" || category === "menu" ? category : "atistirmalik",
    ...(typeof value.boyut === "string" ? { boyut: value.boyut as BufeUrunu["boyut"] } : {}),
    fiyat: number(value.fiyat),
    stok: number(value.stok),
    aktif: value.aktif === true || value.aktif === 1,
  };
}

function mapConcessionMenu(value: unknown): BufeMenusu {
  if (!isRecord(value)) throw new Error("SQLite büfe menüsü nesne biçiminde değil.");
  return {
    id: text(value.id),
    ad: text(value.ad),
    icerik: readArray(value.icerik).filter(isRecord).map((item) => ({
      urunId: text(item.urunId),
      adet: number(item.adet),
    })),
    fiyat: number(value.fiyat),
    aktif: value.aktif === true || value.aktif === 1,
    durum: value.durum === "aktif" || value.durum === "deaktif" ? value.durum : "taslak",
  };
}

function mapOrder(value: unknown): Siparis {
  if (!isRecord(value)) throw new Error("SQLite sipariş kaydı nesne biçiminde değil.");
  const tickets = readArray(value.biletler).filter(isRecord);
  const buffet = readArray(value.bufe).filter(isRecord);
  const status = value.durum;
  return {
    id: text(value.id),
    musteriId: text(value.musteriId, "guest"),
    biletler: tickets.map((ticket) => ({
      kod: text(ticket.kod),
      seansId: text(ticket.seansId),
      satir: number(ticket.satir),
      sutun: number(ticket.sutun),
      kategori: ticket.kategori === "vip" ? "vip" : "standart",
      fiyat: number(ticket.fiyat),
    })),
    bufe: buffet.map((item) => ({
      ...(typeof item.urunId === "string" ? { urunId: item.urunId } : {}),
      ...(typeof item.menuId === "string" ? { menuId: item.menuId } : {}),
      adet: number(item.adet),
      birimFiyat: number(item.birimFiyat),
    })),
    toplam: number(value.toplam),
    durum: status === "odendi" || status === "kullanildi" || status === "iptal" || status === "iade" ? status : "bekliyor",
    olusturma: text(value.olusturma),
    ...(typeof value.kullanimZamani === "string" ? { kullanimZamani: value.kullanimZamani } : {}),
  };
}

function mapCustomer(value: unknown): Musteri {
  if (!isRecord(value)) throw new Error("SQLite müşteri kaydı nesne biçiminde değil.");
  return {
    id: text(value.id),
    ad: text(value.ad),
    eposta: text(value.eposta),
    favoriFilmler: readArray(value.favoriFilmler).filter((id): id is number => typeof id === "number"),
    siparisSayisi: number(value.siparisSayisi),
    durum: value.durum === "engelli" ? "engelli" : "aktif",
    kayit: text(value.kayit),
  };
}

function mapCampaign(value: unknown): Kampanya {
  if (!isRecord(value)) throw new Error("SQLite kampanya kaydı nesne biçiminde değil.");
  return {
    id: text(value.id),
    ad: text(value.ad),
    tur: value.tur === "tutar" || value.tur === "n-al-m-ode" ? value.tur : "yuzde",
    deger: number(value.deger),
    kapsam: value.kapsam === "bilet" || value.kapsam === "bufe" ? value.kapsam : "ikisi",
    baslangic: text(value.baslangic),
    bitis: text(value.bitis),
    durum: value.durum === "aktif" || value.durum === "bitti" ? value.durum : "taslak",
  };
}

function mapContactMessage(value: unknown): ContactMessage {
  if (!isRecord(value)) throw new Error("SQLite iletişim kaydı nesne biçiminde değil.");
  const status = value.status;
  return {
    id: text(value.id),
    name: text(value.name),
    email: text(value.email),
    ...(typeof value.subject === "string" ? { subject: value.subject } : {}),
    message: text(value.message),
    lang: value.lang === "en" || value.lang === "de" || value.lang === "ar" || value.lang === "fa" ? value.lang : "tr",
    status: status === "in-progress" || status === "answered" || status === "spam" ? status : "new",
    ...(typeof value.assignee === "string" ? { assignee: value.assignee } : {}),
    createdAt: text(value.createdAt),
    replies: readArray(value.replies).filter(isRecord).map((reply) => ({
      id: text(reply.id),
      authorId: text(reply.authorId),
      body: text(reply.body),
      at: text(reply.at),
      internal: reply.internal === true,
    })),
  };
}

function mapAdminUser(value: unknown): AdminUser {
  if (!isRecord(value)) throw new Error("SQLite yönetici hesabı nesne biçiminde değil.");
  const role = value.role;
  return {
    id: typeof value.id === "number" ? String(value.id) : text(value.id),
    name: text(value.name),
    email: text(value.email),
    role: role === "support" || role === "content" || role === "viewer" ? role : "owner",
    active: value.active === true,
    ...(typeof value.lastLoginAt === "string" ? { lastLoginAt: value.lastLoginAt } : {}),
  };
}

function mapAuthSession(value: unknown): AuthSessionRecord {
  if (!isRecord(value)) throw new Error("SQLite oturum kaydı nesne biçiminde değil.");
  return {
    id: text(value.id),
    userId: number(value.userId),
    name: text(value.name),
    email: text(value.email),
    startedAt: text(value.startedAt),
    endedAt: typeof value.endedAt === "string" ? value.endedAt : null,
    active: value.active === true,
  };
}

function mapAuditLog(value: unknown): AuditLogEntry {
  if (!isRecord(value)) throw new Error("SQLite denetim kaydı nesne biçiminde değil.");
  return {
    id: text(value.id),
    at: text(value.at),
    actorId: text(value.actorId),
    action: text(value.action),
    entity: text(value.entity),
    entityId: text(value.entityId),
    ...(typeof value.reason === "string" ? { reason: value.reason } : {}),
    ...(value.before !== undefined ? { before: value.before } : {}),
    ...(value.after !== undefined ? { after: value.after } : {}),
  };
}

function mapDashboard(value: unknown, period: DashboardMetrics["period"]): DashboardMetrics {
  if (!isRecord(value)) throw new Error("SQLite dashboard yanıtı nesne biçiminde değil.");
  const sessions = Array.isArray(value.seansDoluluk) ? value.seansDoluluk.filter(isRecord).map((session) => ({
    seansId: text(session.seansId),
    baslangic: text(session.baslangic),
    dolu: number(session.dolu),
    yuzde: number(session.yuzde),
  })) : [];
  const topFilms = Array.isArray(value.enCokIzlenen) ? value.enCokIzlenen.filter(isRecord).map((film) => ({
    filmId: number(film.filmId),
    ad: typeof film.ad === "string" ? film.ad : null,
    bilet: number(film.bilet),
  })) : [];
  return {
    bilet: number(value.bilet),
    ciro: number(value.ciro),
    ortalamaDoluluk: number(value.ortalamaDoluluk),
    seansDoluluk: sessions,
    enCokIzlenen: topFilms,
    period,
  };
}

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && typeof window.__TAURI__ === "object" && window.__TAURI__ !== null;
}

function parseSession(value: unknown): AdminAuthSession | null {
  if (value === null) return null;
  if (typeof value !== "object" || value === null) {
    throw new Error("Tauri kimlik doğrulama yanıtı geçersiz.");
  }

  const session = value as Partial<AdminAuthSession>;
  if (
    typeof session.user?.id !== "number" ||
    typeof session.user.name !== "string" ||
    typeof session.user.email !== "string" ||
    !Array.isArray(session.roles) ||
    !session.roles.every((role) => typeof role === "string") ||
    typeof session.superAdmin !== "boolean" ||
    !Array.isArray(session.permissions) ||
    !session.permissions.every((permission) => typeof permission === "string")
  ) {
    throw new Error("Tauri kimlik doğrulama yanıtı beklenen oturum biçiminde değil.");
  }
  return session as AdminAuthSession;
}

export function hasAdminReadAccess(session: AdminAuthSession): boolean {
  return session.superAdmin || requiredPermissions.every((permission) => session.permissions.includes(permission));
}

export async function authMe(): Promise<AdminAuthSession | null> {
  return parseSession(await invoke<unknown>("auth_me"));
}

export async function authOwnerSetupRequired(): Promise<boolean> {
  const result: unknown = await invoke("auth_owner_setup_required");
  if (typeof result !== "boolean") throw new Error("Owner parola kurulumu yanıtı geçersiz.");
  return result;
}

export async function authSetOwnerInitialPassword(password: string): Promise<AdminAuthSession> {
  const session = parseSession(await invoke<unknown>("auth_owner_set_initial_password", { password }));
  if (!session) throw new Error("Owner parola kurulumu oturum döndürmedi.");
  return session;
}

export async function authLogin(email: string, password: string): Promise<AdminAuthSession> {
  const session = parseSession(await invoke<unknown>("auth_login", { email, password }));
  if (!session) throw new Error("Giriş yanıtında oturum bulunamadı.");
  return session;
}

export async function authRegister(name: string, email: string, password: string): Promise<AdminAuthSession> {
  const session = parseSession(await invoke<unknown>("auth_register", { name, email, password }));
  if (!session) throw new Error("Kayıt yanıtında oturum bulunamadı.");
  return session;
}

export async function authLogout(): Promise<void> {
  await invoke<void>("auth_logout");
}

async function listResource<T>(resource: string, map: (value: unknown) => T): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const value: unknown = await invoke<unknown>("crud_index", {
      resource,
      query: { page, pageSize: 100 },
    });
    if (!isRecord(value) || !Array.isArray(value.items) || typeof value.total !== "number" || !Number.isFinite(value.total)) {
      throw new Error(`${resource} listesi beklenen SQLite yanıt biçiminde değil.`);
    }
    items.push(...value.items.map(map));
    total = value.total;
    if (value.items.length === 0) break;
    page += 1;
  }

  return items;
}

async function loadNativeCollection<K extends AdminCollection>(collection: K): Promise<AdminSeedData[K]> {
  if (collection === "films") return await listResource("Film", mapFilm) as AdminSeedData[K];
  if (collection === "cinemas") return await listResource("Sinema", mapCinema) as AdminSeedData[K];
  if (collection === "halls") return await listResource("Salon", mapHall) as AdminSeedData[K];
  if (collection === "sessions") return await listResource("Seans", mapSession) as AdminSeedData[K];
  if (collection === "seatReservations") return await listResource("KoltukRezervasyonu", mapSeatReservation) as AdminSeedData[K];
  if (collection === "concessionProducts") return await listResource("BufeUrunu", mapConcessionProduct) as AdminSeedData[K];
  if (collection === "concessionMenus") return await listResource("BufeMenusu", mapConcessionMenu) as AdminSeedData[K];
  if (collection === "orders") return await listResource("Siparis", mapOrder) as AdminSeedData[K];
  if (collection === "customers") return await listResource("Musteri", mapCustomer) as AdminSeedData[K];
  if (collection === "campaigns") return await listResource("Kampanya", mapCampaign) as AdminSeedData[K];
  if (collection === "contactMessages") return await listResource("ContactMessage", mapContactMessage) as AdminSeedData[K];
  if (collection === "admins") {
    const users: unknown = await invoke("user_index");
    if (!Array.isArray(users)) throw new Error("SQLite kullanıcı listesi beklenen biçimde değil.");
    return users.map(mapAdminUser) as AdminSeedData[K];
  }
  if (collection === "authSessions") {
    const sessions: unknown = await invoke("auth_session_index");
    if (!Array.isArray(sessions)) throw new Error("SQLite oturum listesi beklenen biçimde değil.");
    return sessions.map(mapAuthSession) as AdminSeedData[K];
  }
  if (collection === "auditLogs") return await listResource("AuditLog", mapAuditLog) as AdminSeedData[K];
  throw new Error(`Tauri "${collection}" koleksiyonu yüklenemedi.`);
}

function filmPayload(film: Film): Omit<Film, "id"> {
  const { id: _id, ...payload } = film;
  return payload;
}

function nativeResource(collection: AdminCollection): { resource: string; map: (value: unknown) => unknown } {
  switch (collection) {
    case "films": return { resource: "Film", map: mapFilm };
    case "cinemas": return { resource: "Sinema", map: mapCinema };
    case "halls": return { resource: "Salon", map: mapHall };
    case "sessions": return { resource: "Seans", map: mapSession };
    case "concessionProducts": return { resource: "BufeUrunu", map: mapConcessionProduct };
    case "concessionMenus": return { resource: "BufeMenusu", map: mapConcessionMenu };
    case "orders": return { resource: "Siparis", map: mapOrder };
    case "customers": return { resource: "Musteri", map: mapCustomer };
    case "campaigns": return { resource: "Kampanya", map: mapCampaign };
    case "contactMessages": return { resource: "ContactMessage", map: mapContactMessage };
    default: throw new Error(`Tauri "${collection}" koleksiyonu düzenlenemez.`);
  }
}

function itemId(item: unknown): string {
  if (!isRecord(item) || (typeof item.id !== "string" && typeof item.id !== "number")) {
    throw new Error("SQLite kayıt eşleştirmesi için geçerli kimlik gerekli.");
  }
  return String(item.id);
}

function toNativeData(collection: AdminCollection, item: unknown): Record<string, unknown> {
  if (!isRecord(item)) throw new Error(`"${collection}" kaydı nesne olmalıdır.`);
  const { id: _id, ...data } = item;
  if (collection === "sessions") {
    const session = mapSession(item);
    return {
      filmId: session.filmId,
      salonId: session.salonId,
      baslangic: session.baslangic,
      dil: session.dil,
      altyazi: session.altyazi,
      fiyat: {
        tam: session.fiyat.tam ?? session.fiyat.standart,
        ogrenci: session.fiyat.ogrenci ?? session.fiyat.standart,
        vip: session.fiyat.vip,
      },
    };
  }
  return data;
}

async function syncNativeCollection<K extends AdminCollection>(collection: K, items: AdminSeedData[K]): Promise<void> {
  if (collection === "seatReservations" || collection === "admins" || collection === "authSessions" || collection === "auditLogs") {
    throw new Error(`SQLite "${collection}" koleksiyonu salt okunurdur.`);
  }
  const { resource, map } = nativeResource(collection);
  const current = await loadNativeCollection(collection) as unknown[];
  for (const item of items as unknown[]) {
    const id = itemId(item);
    const existing = current.find((candidate) => itemId(candidate) === id);
    const payload = toNativeData(collection, item);
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(map({ ...payload, id }))) {
        if (collection === "sessions") {
          await invoke("seans_guncelle", { id, girdi: payload });
        } else {
          await invoke("crud_update", { resource, id, data: payload });
        }
      }
    } else if (collection === "sessions") {
      await invoke("seans_olustur", { girdi: payload });
    } else {
      await invoke("crud_store", { resource, data: { id, ...payload } });
    }
  }
}

export const tauriAdapter: AdminDataAdapter = {
  ...mockAdapter,
  isTauri: true,
  loadAll: async () => {
    const [
      films, cinemas, halls, sessions, seatReservations, concessionProducts, concessionMenus,
      orders, customers, campaigns, contactMessages, admins, authSessions, auditLogs,
    ] = await Promise.all([
      loadNativeCollection("films"), loadNativeCollection("cinemas"), loadNativeCollection("halls"),
      loadNativeCollection("sessions"), loadNativeCollection("seatReservations"),
      loadNativeCollection("concessionProducts"), loadNativeCollection("concessionMenus"),
      loadNativeCollection("orders"), loadNativeCollection("customers"), loadNativeCollection("campaigns"),
      loadNativeCollection("contactMessages"), loadNativeCollection("admins"),
      loadNativeCollection("authSessions"), loadNativeCollection("auditLogs"),
    ]);
    return {
      ...structuredClone(seedData),
      films, cinemas, halls, sessions, seatReservations, concessionProducts, concessionMenus,
      orders, customers, campaigns, contactMessages, admins, authSessions, auditLogs,
    };
  },
  list: loadNativeCollection,
  replace: async (collection, items) => {
    if (nativeCollections.has(collection)) {
      await syncNativeCollection(collection, items);
      return;
    }
    return mockAdapter.replace(collection, items);
  },
  replaceMany: async (updates) => {
    const tasks = Object.entries(updates) as [AdminCollection, AdminSeedData[AdminCollection]][];
    await Promise.all(tasks.map(([collection, items]) => tauriAdapter.replace(collection, items)));
  },
  reset: async () => {
    throw new Error("Yönetim verilerini sıfırlama bu aşamada Tauri ortamında desteklenmiyor.");
  },
  saveFilm: async (film) => {
    if (film.id === 0) {
      return mapFilm(await invoke<unknown>("crud_store", { resource: "Film", data: filmPayload(film) }));
    }
    return mapFilm(await invoke<unknown>("crud_update", {
      resource: "Film",
      id: film.id,
      data: filmPayload(film),
    }));
  },
  createHall: async (input) => {
    const defaultMap = seedData.halls[0]?.harita;
    if (!defaultMap) throw new Error("Varsayılan salon haritası bulunamadı.");
    const nextHall = mapHall(await invoke<unknown>("crud_store", {
      resource: "Salon",
      data: {
        ...input,
        harita: defaultMap,
        durum: "taslak",
      },
    }));
    return nextHall;
  },
  publishHall: async (id) => mapHall(await invoke<unknown>("salon_yayinla", { id })),
  createSession: async (session) => mapSession(await invoke<unknown>("seans_olustur", {
    girdi: {
      filmId: session.filmId,
      salonId: session.salonId,
      baslangic: session.baslangic,
      dil: session.dil,
      altyazi: session.altyazi,
      fiyat: {
        tam: session.fiyat.tam ?? session.fiyat.standart,
        ogrenci: session.fiyat.ogrenci ?? session.fiyat.standart,
        vip: session.fiyat.vip,
      },
    },
  })),
  updateSession: async (session) => mapSession(await invoke<unknown>("seans_guncelle", {
    id: session.id,
    girdi: toNativeData("sessions", session),
  })),
  cancelSession: async (id, reason, refund) => mapSession(await invoke<unknown>("seans_iptal", {
    id,
    neden: reason,
    otomatikIade: refund,
  })),
  refundOrder: async (id, reason) => mapOrder(await invoke<unknown>("siparis_iade", { id, neden: reason })),
  verifyTicket: (code, use) => invoke("bilet_dogrula", { kod: code, kullan: use }),
  loadDashboardMetrics: async () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const todayMetrics = mapDashboard(await invoke<unknown>("cineq_dashboard", {
      from: `${today}T00:00:00`,
      to: `${today}T23:59:59`,
    }), "today");
    if (
      todayMetrics.bilet > 0 ||
      todayMetrics.ciro > 0 ||
      todayMetrics.seansDoluluk.length > 0 ||
      todayMetrics.enCokIzlenen.length > 0
    ) {
      return todayMetrics;
    }
    return mapDashboard(await invoke<unknown>("cineq_dashboard"), "all");
  },
};

const browserAdapter: AdminDataAdapter = {
  ...mockAdapter,
  isTauri: false,
  loadDashboardMetrics: async () => null,
  saveFilm: async (film) => film,
  createHall: async (input) => ({
    ...input,
    id: `browser-hall-${crypto.randomUUID()}`,
    harita: structuredClone(seedData.halls[0]?.harita ?? {
      satir: 0,
      sutun: 0,
      koridorSutunlari: [],
      vipSatirlari: [],
      kullanilamaz: [],
    }),
    durum: "taslak",
  }),
  publishHall: async (id) => {
    const halls = await mockAdapter.list("halls");
    const hall = halls.find((item) => item.id === id);
    if (!hall) throw new Error("Salon bulunamadı.");
    const published = { ...hall, durum: "yayinda" as const };
    await mockAdapter.replace("halls", halls.map((item) => item.id === id ? published : item));
    return published;
  },
  createSession: async (session) => ({ ...session, id: `browser-session-${crypto.randomUUID()}` }),
  updateSession: async (session) => session,
  cancelSession: async (id) => {
    const session = (await mockAdapter.list("sessions")).find((item) => item.id === id);
    if (!session) throw new Error("Seans bulunamadı.");
    const canceled = { ...session, iptal: { neden: "İptal edildi", at: new Date().toISOString() } };
    await mockAdapter.replace("sessions", (await mockAdapter.list("sessions")).map((item) => item.id === id ? canceled : item));
    return canceled;
  },
  refundOrder: async (id) => {
    const order = (await mockAdapter.list("orders")).find((item) => item.id === id);
    if (!order) throw new Error("Sipariş bulunamadı.");
    const refunded = { ...order, durum: "iade" as const };
    await mockAdapter.replace("orders", (await mockAdapter.list("orders")).map((item) => item.id === id ? refunded : item));
    return refunded;
  },
  verifyTicket: async () => {
    throw new Error("Kapı doğrulaması yalnızca Tauri/SQLite ortamında kullanılabilir.");
  },
};

export function getAdminDataAdapter(): AdminDataAdapter {
  return isTauriRuntime() ? tauriAdapter : browserAdapter;
}

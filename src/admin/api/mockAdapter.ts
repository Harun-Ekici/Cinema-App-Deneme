import { seedData, type AdminSeedData } from "./seed";

export type AdminCollection = keyof AdminSeedData;

export interface MockAdapter {
  loadAll(): Promise<AdminSeedData>;
  list<K extends AdminCollection>(collection: K): Promise<AdminSeedData[K]>;
  replace<K extends AdminCollection>(collection: K, items: AdminSeedData[K]): Promise<void>;
  replaceMany(updates: Partial<AdminSeedData>): Promise<void>;
  reset(): Promise<AdminSeedData>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStorage(): Storage {
  if (typeof window === "undefined") {
    throw new Error("Yönetim mock adaptörü tarayıcı localStorage alanı gerektirir.");
  }
  return window.localStorage;
}

function waitForRequest(): Promise<void> {
  const gecikmeMs = 300 + Math.floor(Math.random() * 301);
  return new Promise((resolve) => setTimeout(resolve, gecikmeMs));
}

async function runRequest<T>(action: () => T): Promise<T> {
  await waitForRequest();
  if (Math.random() < 0.05) {
    throw new Error("Mock API isteği başarısız oldu. Lütfen yeniden deneyin.");
  }
  return action();
}

function readCollection<K extends AdminCollection>(collection: K): AdminSeedData[K] {
  const storage = getStorage();
  const key = `cineq-admin:${collection}`;
  const saved = storage.getItem(key);
  if (saved === null) {
    const initialData = structuredClone(seedData[collection]);
    storage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }

  const parsed = JSON.parse(saved) as AdminSeedData[K];
  if (!Array.isArray(parsed) || !parsed.every(isRecord)) {
    throw new Error(`localStorage içindeki "${key}" kaydı geçerli bir liste değil.`);
  }
  return structuredClone(parsed);
}

function writeCollection<K extends AdminCollection>(collection: K, items: AdminSeedData[K]): void {
  if (!Array.isArray(items) || !items.every(isRecord)) {
    throw new Error(`"${collection}" koleksiyonu kayıt listesi olmalıdır.`);
  }
  getStorage().setItem(`cineq-admin:${collection}`, JSON.stringify(items));
}

function writeCollections(updates: Partial<AdminSeedData>): void {
  const entries = Object.entries(updates) as [AdminCollection, AdminSeedData[AdminCollection]][];
  if (entries.length === 0) throw new Error("Güncellenecek yönetim koleksiyonu belirtilmedi.");
  for (const [collection, items] of entries) {
    if (!Array.isArray(items) || !items.every(isRecord)) {
      throw new Error(`"${collection}" koleksiyonu kayıt listesi olmalıdır.`);
    }
  }
  const storage = getStorage();
  for (const [collection, items] of entries) {
    storage.setItem(`cineq-admin:${collection}`, JSON.stringify(items));
  }
}

export const mockAdapter: MockAdapter = {
  loadAll: () =>
    runRequest(() => ({
      films: readCollection("films"),
      cinemas: readCollection("cinemas"),
      halls: readCollection("halls"),
      sessions: readCollection("sessions"),
      seatReservations: readCollection("seatReservations"),
      concessionProducts: readCollection("concessionProducts"),
      concessionMenus: readCollection("concessionMenus"),
      orders: readCollection("orders"),
      customers: readCollection("customers"),
      campaigns: readCollection("campaigns"),
      contactMessages: readCollection("contactMessages"),
      admins: readCollection("admins"),
      authSessions: readCollection("authSessions"),
      auditLogs: readCollection("auditLogs"),
    })),
  list: (collection) => runRequest(() => readCollection(collection)),
  replace: (collection, items) => runRequest(() => writeCollection(collection, items)),
  replaceMany: (updates) => runRequest(() => writeCollections(updates)),
  reset: () =>
    runRequest(() => {
      const storage = getStorage();
      const restored = structuredClone(seedData);
      const collections: AdminCollection[] = [
        "films",
        "cinemas",
        "halls",
        "sessions",
        "seatReservations",
        "concessionProducts",
        "concessionMenus",
        "orders",
        "customers",
        "campaigns",
        "contactMessages",
        "admins",
        "authSessions",
        "auditLogs",
      ];
      for (const collection of collections) {
        storage.setItem(`cineq-admin:${collection}`, JSON.stringify(restored[collection]));
      }
      return restored;
    }),
};

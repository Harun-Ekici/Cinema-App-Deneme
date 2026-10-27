import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAdminDataAdapter, type DashboardMetrics } from "./data/tauriAdapter";
import type { AdminSeedData } from "./api/seed";
import type { AdminCollection } from "./api/mockAdapter";
import type { Film, Salon, Seans, Siparis } from "./domain/types";

interface AdminDataContextValue {
  data: AdminSeedData | null;
  dashboardMetrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  replaceCollection: <K extends AdminCollection>(collection: K, items: AdminSeedData[K]) => Promise<void>;
  replaceCollections: (updates: Partial<AdminSeedData>) => Promise<void>;
  saveFilm: (film: Film) => Promise<Film>;
  createHall: (input: Pick<Salon, "sinemaId" | "numara" | "ad" | "tip">) => Promise<Salon>;
  publishHall: (id: string) => Promise<Salon>;
  createSession: (session: Omit<Seans, "id">) => Promise<Seans>;
  updateSession: (session: Seans) => Promise<Seans>;
  cancelSession: (id: string, reason: string, refund: boolean) => Promise<Seans>;
  refundOrder: (id: string, reason: string) => Promise<Siparis>;
  verifyTicket: (code: string, use: boolean) => Promise<unknown>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminSeedData | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const adapter = getAdminDataAdapter();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextData, metrics] = await Promise.all([
        adapter.loadAll(),
        adapter.loadDashboardMetrics(),
      ]);
      setData(nextData);
      setDashboardMetrics(metrics);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Yönetim verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replaceCollection = useCallback(async <K extends AdminCollection>(
    collection: K,
    items: AdminSeedData[K],
  ) => {
    await adapter.replace(collection, items);
    setData((current) => current ? { ...current, [collection]: items } : current);
  }, [adapter]);

  const replaceCollections = useCallback(async (updates: Partial<AdminSeedData>) => {
    await adapter.replaceMany(updates);
    setData((current) => current ? { ...current, ...updates } : current);
  }, [adapter]);

  const saveFilm = useCallback(async (film: Film) => {
    const current = data?.films ?? [];
    const saved = adapter.isTauri
      ? await adapter.saveFilm(film)
      : { ...film, id: film.id || Math.max(0, ...current.map((item) => item.id)) + 1 };
    const next = film.id === 0
      ? [saved, ...current]
      : current.map((item) => item.id === saved.id ? saved : item);
    if (!adapter.isTauri) await adapter.replace("films", next);
    setData((value) => value ? { ...value, films: next } : value);
    return saved;
  }, [adapter, data?.films]);

  const createHall = useCallback(async (input: Pick<Salon, "sinemaId" | "numara" | "ad" | "tip">) => {
    const hall = await adapter.createHall(input);
    if (!adapter.isTauri) await adapter.replace("halls", [hall, ...(data?.halls ?? [])]);
    setData((value) => value ? { ...value, halls: [hall, ...(value.halls ?? [])] } : value);
    return hall;
  }, [adapter, data?.halls]);

  const publishHall = useCallback(async (id: string) => {
    const hall = await adapter.publishHall(id);
    setData((value) => value ? {
      ...value,
      halls: value.halls.map((item) => item.id === id ? hall : item),
    } : value);
    return hall;
  }, [adapter]);

  const createSession = useCallback(async (session: Omit<Seans, "id">) => {
    const saved = await adapter.createSession(session);
    setData((value) => value ? { ...value, sessions: [...value.sessions, saved] } : value);
    return saved;
  }, [adapter]);

  const updateSession = useCallback(async (session: Seans) => {
    const saved = await adapter.updateSession(session);
    setData((value) => value ? {
      ...value,
      sessions: value.sessions.map((item) => item.id === saved.id ? saved : item),
    } : value);
    return saved;
  }, [adapter]);

  const cancelSession = useCallback(async (id: string, reason: string, refund: boolean) => {
    const canceled = await adapter.cancelSession(id, reason, refund);
    await reload();
    return canceled;
  }, [adapter, reload]);

  const refundOrder = useCallback(async (id: string, reason: string) => {
    const refunded = await adapter.refundOrder(id, reason);
    await reload();
    return refunded;
  }, [adapter, reload]);

  const verifyTicket = useCallback((code: string, use: boolean) => adapter.verifyTicket(code, use), [adapter]);

  const value = useMemo(
    () => ({
      data, dashboardMetrics, loading, error, reload, replaceCollection, replaceCollections, saveFilm,
      createHall, publishHall, createSession, updateSession, cancelSession, refundOrder, verifyTicket,
    }),
    [
      data, dashboardMetrics, error, loading, reload, replaceCollection, replaceCollections, saveFilm,
      createHall, publishHall, createSession, updateSession, cancelSession, refundOrder, verifyTicket,
    ],
  );
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataContextValue {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error("useAdminData, AdminDataProvider içinde kullanılmalıdır.");
  return context;
}

export function requireAdminData(data: AdminSeedData | null): AdminSeedData {
  if (!data) throw new Error("Yönetim verisi yüklenmeden ekran oluşturulamaz.");
  return data;
}

export function LoadingState({ label = "Yönetim verileri yükleniyor..." }: { label?: string }) {
  return <div className="admin-state-card" role="status"><span className="admin-spinner" aria-hidden="true" />{label}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="admin-state-card admin-state-card--error" role="alert"><strong>Veriler yüklenemedi</strong><span>{message}</span><button className="admin-button" type="button" onClick={onRetry}>Tekrar dene</button></div>;
}

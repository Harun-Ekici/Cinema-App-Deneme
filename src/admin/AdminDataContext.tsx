import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mockAdapter } from "./api/mockAdapter";
import type { AdminSeedData } from "./api/seed";
import type { AdminCollection } from "./api/mockAdapter";

interface AdminDataContextValue {
  data: AdminSeedData | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  replaceCollection: <K extends AdminCollection>(collection: K, items: AdminSeedData[K]) => Promise<void>;
  replaceCollections: (updates: Partial<AdminSeedData>) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminSeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await mockAdapter.loadAll());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Yönetim verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replaceCollection = useCallback(async <K extends AdminCollection>(
    collection: K,
    items: AdminSeedData[K],
  ) => {
    await mockAdapter.replace(collection, items);
    setData((current) => current ? { ...current, [collection]: items } : current);
  }, []);

  const replaceCollections = useCallback(async (updates: Partial<AdminSeedData>) => {
    await mockAdapter.replaceMany(updates);
    setData((current) => current ? { ...current, ...updates } : current);
  }, []);

  const value = useMemo(
    () => ({ data, loading, error, reload, replaceCollection, replaceCollections }),
    [data, error, loading, reload, replaceCollection, replaceCollections],
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

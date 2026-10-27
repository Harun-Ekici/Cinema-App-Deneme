import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, type SyntheticEvent } from "react";
import {
  authLogin,
  authLogout,
  authMe,
  authOwnerSetupRequired,
  authRegister,
  authSetOwnerInitialPassword,
  hasAdminReadAccess,
  isTauriRuntime,
  OWNER_ACCOUNT_EMAIL,
  type AdminAuthSession,
} from "../data/tauriAdapter";
import { AdminIcon } from "./AdminIcon";

const canCreateFirstAdmin = import.meta.env.DEV;
interface AdminAuthContextValue {
  session: AdminAuthSession | null;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth, AdminAuthGate içinde kullanılmalıdır.");
  return context;
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const tauri = isTauriRuntime();
  const [loading, setLoading] = useState(tauri);
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [checkError, setCheckError] = useState("");
  const [ownerSetupRequired, setOwnerSetupRequired] = useState(false);

  const logout = useCallback(async () => {
    if (tauri) await authLogout();
    setSession(null);
  }, [tauri]);
  const authValue = useMemo(() => ({ session, logout }), [logout, session]);

  const checkSession = useCallback(async () => {
    setLoading(true);
    setCheckError("");
    setOwnerSetupRequired(false);
    try {
      const current = await authMe();
      if (current && hasAdminReadAccess(current)) {
        setSession(current);
      } else {
        if (current) await authLogout();
        setSession(null);
        setOwnerSetupRequired(await authOwnerSetupRequired());
      }
    } catch (reason) {
      setCheckError(reason instanceof Error ? reason.message : "Oturum doğrulanamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tauri) void checkSession();
  }, [checkSession, tauri]);

  if (!tauri) return <AdminAuthContext.Provider value={authValue}>{children}</AdminAuthContext.Provider>;
  if (loading) {
    return <main className="admin-auth-page"><div className="admin-state-card" role="status"><span className="admin-spinner" aria-hidden="true" />Oturum doğrulanıyor...</div></main>;
  }
  if (session) return <AdminAuthContext.Provider value={authValue}>{children}</AdminAuthContext.Provider>;

  return (
    <AdminSignIn
      canCreateFirstAdmin={canCreateFirstAdmin}
      checkError={checkError}
      ownerSetupRequired={ownerSetupRequired}
      onRetry={() => void checkSession()}
      onSession={(next) => {
        setOwnerSetupRequired(false);
        setSession(next);
      }}
    />
  );
}

function AdminSignIn({
  canCreateFirstAdmin,
  checkError,
  ownerSetupRequired,
  onRetry,
  onSession,
}: {
  canCreateFirstAdmin: boolean;
  checkError: string;
  ownerSetupRequired: boolean;
  onRetry: () => void;
  onSession: (session: AdminAuthSession) => void;
}) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (ownerSetupRequired && password !== passwordConfirmation) {
        throw new Error("Parola alanları eşleşmiyor.");
      }
      const next = ownerSetupRequired
        ? await authSetOwnerInitialPassword(password)
        : registering
          ? await authRegister(name, email, password)
          : await authLogin(email, password);
      if (!hasAdminReadAccess(next)) {
        await authLogout();
        throw new Error("Bu hesap yönetim paneli için gerekli okuma izinlerine sahip değil.");
      }
      onSession(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Oturum açılamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-panel admin-auth-card" aria-labelledby="admin-auth-title">
        <div className="admin-auth-brand"><AdminIcon name="film" /><span>CineQ Yönetim</span></div>
        <h1 id="admin-auth-title">{ownerSetupRequired ? "Owner parolasını oluştur" : registering ? "İlk yönetici hesabı" : "Yönetici girişi"}</h1>
        <p>{ownerSetupRequired ? `${OWNER_ACCOUNT_EMAIL} hesabı için ilk parola yalnızca bir kez belirlenir.` : registering ? "Geliştirme ortamında boş veritabanındaki ilk hesap yönetici olur." : "SQLite verilerine erişmek için yetkili hesabınızla giriş yapın."}</p>
        {checkError && <p className="admin-inline-error" role="alert">{checkError}<button className="admin-button admin-button--quiet" type="button" onClick={onRetry}>Oturumu yeniden denetle</button></p>}
        <form className="admin-form" onSubmit={(event) => void submit(event)}>
          {registering && <label className="admin-field"><span>Ad soyad</span><input autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label>}
          {!ownerSetupRequired && <label className="admin-field"><span>E-posta</span><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
          {ownerSetupRequired && <label className="admin-field"><span>E-posta</span><input type="email" value={OWNER_ACCOUNT_EMAIL} readOnly /></label>}
          <label className="admin-field"><span>{ownerSetupRequired ? "Yeni parola" : "Parola"}</span><input type="password" autoComplete={registering || ownerSetupRequired ? "new-password" : "current-password"} minLength={registering || ownerSetupRequired ? 8 : undefined} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {ownerSetupRequired && <label className="admin-field"><span>Yeni parola (tekrar)</span><input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} /></label>}
          {error && <p className="admin-inline-error" role="alert">{error}</p>}
          <button className="admin-button admin-button--primary" type="submit" disabled={submitting}>
            {submitting ? "Denetleniyor..." : ownerSetupRequired ? "Parolayı oluştur ve giriş yap" : registering ? "Hesap oluştur ve devam et" : "Giriş yap"}
          </button>
        </form>
        {!ownerSetupRequired && canCreateFirstAdmin && (
          <button className="admin-button admin-button--quiet admin-auth-toggle" type="button" onClick={() => { setRegistering((value) => !value); setError(""); }}>
            {registering ? "Mevcut hesapla giriş yap" : "Geliştirme: ilk yönetici hesabını oluştur"}
          </button>
        )}
      </section>
    </main>
  );
}

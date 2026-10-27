import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import type { AdminRole, Lang } from "../domain/types";
import { useAdminAuth } from "./AdminAuthGate";
import { useAdminData } from "../AdminDataContext";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: AdminIconName;
}

export interface AppShellProps {
  children: ReactNode;
  role?: AdminRole;
  lang?: Lang;
  onLangChange?: (lang: Lang) => void;
}

const navItems: AdminNavItem[] = [
  { to: "/", label: "Genel Bakış", icon: "dashboard" },
  { to: "/filmler", label: "Filmler", icon: "film" },
  { to: "/seanslar", label: "Seanslar", icon: "calendar" },
  { to: "/salonlar", label: "Salonlar", icon: "building" },
  { to: "/bufe", label: "Büfe", icon: "popcorn" },
  { to: "/siparisler", label: "Siparişler", icon: "receipt" },
  { to: "/kapi", label: "Kapı", icon: "scan" },
  { to: "/musteriler", label: "Müşteriler", icon: "users" },
];

const roleLabels: Record<string, string> = {
  owner: "Sahip",
  support: "Destek",
  content: "İçerik",
  viewer: "İzleyici",
  admin: "Yönetici",
  cinema_manager: "Sinema yöneticisi",
  box_office: "Gişe",
};

const languages: { code: Lang; label: string }[] = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

function storedTheme(): "gunduz" | "gece" {
  try {
    return window.localStorage.getItem("cineq-admin:theme") === "gece" ? "gece" : "gunduz";
  } catch {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "gece" : "gunduz";
  }
}

export function AppShell({ children, role = "owner", lang = "tr", onLangChange }: AppShellProps) {
  const [theme, setTheme] = useState<"gunduz" | "gece">(storedTheme);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState<"sidebar" | "topbar" | null>(null);
  const [profileError, setProfileError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAdminAuth();
  const { data } = useAdminData();
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const pendingOrders = orders.filter((order) => order?.durum === "bekliyor").length;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const gatePendingOrders = orders.filter((order) => order?.durum === "odendi" && order.olusturma?.slice(0, 10) === today).length;
  const userName = session?.user.name || "Yönetici";
  const initials = userName.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase("tr-TR") || "Y";
  const userRole = session?.roles.length
    ? session.roles.map((item) => roleLabels[item] ?? item).join(", ")
    : session ? (session.superAdmin ? "Süper yönetici" : roleLabels[role]) : "Önizleme";

  async function handleLogout() {
    setProfileError("");
    try {
      await logout();
      setProfileMenu(null);
    } catch (reason) {
      setProfileError(reason instanceof Error ? reason.message : "Oturum kapatılamadı.");
    }
  }

  useEffect(() => {
    document.documentElement.dataset.tema = theme;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem("cineq-admin:theme", theme);
    } catch (error) {
      console.warn("Yönetim paneli teması bu tarayıcıda kalıcı kaydedilemedi.", error);
    }
  }, [lang, theme]);

  useEffect(() => {
    setProfileMenu(null);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const activePage = navItems.find((item) =>
    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to),
  );

  return (
    <div className="admin-app-shell">
      <aside className="admin-sidebar" aria-label="Yönetim menüsü">
        <NavLink className="admin-brand" to="/" aria-label="CineQ yönetim paneli ana sayfası">
          <img className="admin-brand__mark" src="/cineq-logo.svg" alt="" width={42} height={42} />
          <span><strong>CineQ</strong><small>Yönetim paneli</small></span>
        </NavLink>
        <div className="admin-sidebar__label">MENÜ</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `admin-nav__link${isActive ? " is-active" : ""}`}
            >
              <span className="admin-nav__icon"><AdminIcon name={item.icon} /></span>
              <span>{item.label}</span>
              {item.to === "/siparisler" && pendingOrders > 0 && <span className="admin-nav__badge">{pendingOrders}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-profile-wrap">
            <button className="admin-profile-trigger admin-profile-trigger--sidebar" type="button" aria-expanded={profileMenu === "sidebar"} onClick={() => { setProfileMenu((value) => value === "sidebar" ? null : "sidebar"); setProfileError(""); }}>
              <span className="admin-avatar" aria-hidden="true">{initials}</span>
              <span className="admin-user-copy"><strong>{userName}</strong><small>{session?.user.email ?? "Yönetim hesabı"}</small></span>
            </button>
            <span className="admin-role-badge">{userRole}</span>
            {profileMenu === "sidebar" && <div className="admin-profile-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { window.location.href = "/"; }}>Müşteri Arayüzüne Dön</button>
              <button type="button" role="menuitem" onClick={() => void handleLogout()}>Oturumu Kapat</button>
              {profileError && <p className="admin-inline-error" role="alert">{profileError}</p>}
            </div>}
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><span>Yönetim</span><span aria-hidden="true">/</span><strong>{activePage?.label ?? "Yönetim"}</strong></div>
          <div className="admin-topbar__controls">
            <label className="admin-language-control">
              <span className="sr-only">Arayüz dili</span>
              <select value={lang} onChange={(event) => onLangChange?.(event.target.value as Lang)}>
                {languages.map((language) => <option value={language.code} key={language.code}>{language.label}</option>)}
              </select>
            </label>
            <button
              className="admin-icon-button"
              type="button"
              aria-label={theme === "gece" ? "Gündüz temasına geç" : "Gece temasına geç"}
              onClick={() => setTheme((value) => value === "gece" ? "gunduz" : "gece")}
            ><AdminIcon name={theme === "gece" ? "sun" : "moon"} /></button>
            <div className="admin-notification-wrap">
              <button
                className="admin-icon-button admin-notification-button"
                type="button"
                aria-label="Bildirimler"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((value) => !value)}
              >
                <AdminIcon name="bell" /><span className="admin-notification-dot" />
              </button>
              {notificationsOpen && (
                <div className="admin-notification-popover">
                  <strong>Bildirimler</strong>
                  <button className="admin-notification-link" type="button" onClick={() => { setNotificationsOpen(false); navigate("/kapi"); }}>Bugün {gatePendingOrders} sipariş kapıda doğrulama bekliyor.</button>
                  <p>Bir büfe ürününün stoğu kritik seviyede.</p>
                </div>
              )}
            </div>
            <div className="admin-profile-wrap">
              <button className="admin-profile-trigger admin-topbar__identity" type="button" aria-expanded={profileMenu === "topbar"} onClick={() => { setProfileMenu((value) => value === "topbar" ? null : "topbar"); setProfileError(""); }}><span className="admin-avatar admin-avatar--small" aria-hidden="true">{initials}</span><strong>{userName}</strong></button>
              {profileMenu === "topbar" && <div className="admin-profile-menu admin-profile-menu--topbar" role="menu">
                <button type="button" role="menuitem" onClick={() => { window.location.href = "/"; }}>Müşteri Arayüzüne Dön</button>
                <button type="button" role="menuitem" onClick={() => void handleLogout()}>Oturumu Kapat</button>
                {profileError && <p className="admin-inline-error" role="alert">{profileError}</p>}
              </div>}
            </div>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

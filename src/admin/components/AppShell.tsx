import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import type { AdminRole, Lang } from "../domain/types";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: AdminIconName;
  badge?: string;
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
  { to: "/siparisler", label: "Siparişler", icon: "receipt", badge: "5" },
  { to: "/kapi", label: "Kapı", icon: "scan" },
  { to: "/musteriler", label: "Müşteriler", icon: "users" },
];

const roleLabels: Record<AdminRole, string> = {
  owner: "Sahip",
  support: "Destek",
  content: "İçerik",
  viewer: "İzleyici",
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
  const location = useLocation();

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
              {item.badge && <span className="admin-nav__badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span className="admin-avatar" aria-hidden="true">DY</span>
          <span className="admin-user-copy"><strong>Deniz Yönetici</strong><small>Yönetici hesabı</small></span>
          <span className="admin-role-badge">{roleLabels[role]}</span>
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
                <div className="admin-notification-popover" role="status">
                  <strong>Bildirimler</strong>
                  <p>Bugün 5 sipariş kapıda doğrulama bekliyor.</p>
                  <p>Bir büfe ürününün stoğu kritik seviyede.</p>
                </div>
              )}
            </div>
            <span className="admin-topbar__identity"><span className="admin-avatar admin-avatar--small">DY</span><strong>Deniz</strong></span>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

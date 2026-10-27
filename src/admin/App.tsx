import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { AdminDataProvider, ErrorState, LoadingState, useAdminData } from "./AdminDataContext";
import { AppShell } from "./components/AppShell";
import type { Lang } from "./domain/types";
import "./styles/tokens.css";
import "./styles/admin.css";
import Auditoriums from "./features/Auditoriums";
import Concessions from "./features/Concessions";
import Customers from "./features/Customers";
import Dashboard from "./features/Dashboard";
import Gate from "./features/Gate";
import Movies from "./features/Movies";
import Orders from "./features/Orders";
import Schedules from "./features/Schedules";

function AdminRoutes() {
  const { loading, error, reload } = useAdminData();
  const [lang, setLang] = useState<Lang>("tr");

  if (loading) {
    return <AppShell lang={lang} onLangChange={setLang}><LoadingState /></AppShell>;
  }
  if (error) {
    return <AppShell lang={lang} onLangChange={setLang}><ErrorState message={error} onRetry={() => void reload()} /></AppShell>;
  }

  return (
    <AppShell lang={lang} onLangChange={setLang}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/filmler" element={<Movies />} />
        <Route path="/seanslar" element={<Schedules />} />
        <Route path="/salonlar" element={<Auditoriums />} />
        <Route path="/bufe" element={<Concessions />} />
        <Route path="/siparisler" element={<Orders />} />
        <Route path="/kapi" element={<Gate />} />
        <Route path="/musteriler" element={<Customers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AdminDataProvider>
        <AdminRoutes />
      </AdminDataProvider>
    </HashRouter>
  );
}

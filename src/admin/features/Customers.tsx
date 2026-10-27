import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default function Customers() {
  const { data, replaceCollection } = useAdminData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const adminData = requireAdminData(data);

  const selectedCustomer = selectedId ? adminData.customers.find((customer) => customer.id === selectedId) : undefined;
  const columns = useMemo(() => [
    { key: "name", header: "Müşteri", value: (customer: typeof adminData.customers[number]) => customer.ad },
    { key: "email", header: "E-posta", value: (customer: typeof adminData.customers[number]) => customer.eposta },
    { key: "orders", header: "Sipariş", value: (customer: typeof adminData.customers[number]) => customer.siparisSayisi },
    { key: "spend", header: "Toplam harcama", value: (customer: typeof adminData.customers[number]) => adminData.orders.filter((order) => order.musteriId === customer.id && order.durum !== "iptal" && order.durum !== "iade").reduce((total, order) => total + order.toplam, 0), render: (customer: typeof adminData.customers[number]) => <strong>{money.format(adminData.orders.filter((order) => order.musteriId === customer.id && order.durum !== "iptal" && order.durum !== "iade").reduce((total, order) => total + order.toplam, 0))}</strong> },
    { key: "registered", header: "Kayıt tarihi", value: (customer: typeof adminData.customers[number]) => customer.kayit },
    { key: "status", header: "Durum", value: (customer: typeof adminData.customers[number]) => customer.durum, render: (customer: typeof adminData.customers[number]) => <StatusBadge tone={customer.durum === "aktif" ? "success" : "danger"} label={customer.durum === "aktif" ? "Aktif" : "Engelli"} /> },
  ], [adminData]);

  async function toggleBlocked(customer: typeof adminData.customers[number]) {
    try {
      await replaceCollection("customers", adminData.customers.map((item) =>
        item.id === customer.id ? { ...item, durum: item.durum === "aktif" ? "engelli" : "aktif" } : item,
      ));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Müşteri durumu değiştirilemedi.");
    }
  }

  const customerOrders = selectedCustomer
    ? adminData.orders.filter((order) => order.musteriId === selectedCustomer.id)
    : [];

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">MÜŞTERİ İLİŞKİLERİ</p><h1>Müşteriler</h1><p>Müşteri geçmişini kişisel verileri koruyarak inceleyin.</p></div><span className="admin-muted">{adminData.customers.length} profil</span></div>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Yönetici ve personel hesapları</h2><p>Kimlik doğrulama altyapısındaki gerçek kullanıcı kayıtları.</p></div></div><DataTable caption="Yönetici ve personel hesapları" rows={adminData.admins} rowKey={(user) => user.id} columns={[
        { key: "name", header: "Ad", value: (user) => user.name },
        { key: "email", header: "E-posta", value: (user) => user.email },
        { key: "role", header: "Rol", value: (user) => user.role },
        { key: "lastLogin", header: "Son giriş", value: (user) => user.lastLoginAt ?? "Henüz giriş yok" },
        { key: "active", header: "Durum", value: (user) => user.active ? "Aktif" : "Pasif", render: (user) => <StatusBadge tone={user.active ? "success" : "neutral"} label={user.active ? "Aktif" : "Pasif"} /> },
      ]} /></section>
      <div className="admin-customer-layout"><section><DataTable caption="SQLite müşteri profilleri" rows={adminData.customers} rowKey={(customer) => customer.id} selectable searchPlaceholder="Müşteri ara..." columns={columns} actions={(customer) => <div className="admin-action-group"><button className="admin-button admin-button--quiet" type="button" onClick={() => setSelectedId(customer.id)}><AdminIcon name="history" />Geçmiş</button><button className="admin-button admin-button--quiet" type="button" onClick={() => void toggleBlocked(customer)}><AdminIcon name={customer.durum === "aktif" ? "block" : "active"} />{customer.durum === "aktif" ? "Engelle" : "Aktifleştir"}</button></div>} /></section>
        <aside className="admin-panel admin-customer-detail"><div className="admin-section-heading"><div><h2>Rezervasyon geçmişi</h2><p>{selectedCustomer ? "SQLite müşteri kaydı" : "Bir müşteri seçin"}</p></div></div>
          {selectedCustomer ? <><div className="admin-customer-identity"><span className="admin-avatar">{selectedCustomer.ad.slice(0, 2).toLocaleUpperCase("tr")}</span><div><strong>{selectedCustomer.ad}</strong><small>{selectedCustomer.eposta}</small></div></div><h3>Favori filmler</h3><div className="admin-chip-list">{selectedCustomer.favoriFilmler.map((id) => <span className="admin-chip" key={id}>{adminData.films.find((film) => film.id === id)?.ad.tr ?? "Film"}</span>)}</div><h3>Sipariş geçmişi</h3><div className="admin-customer-orders">{customerOrders.map((order) => <article key={order.id}><div><strong>{order.id}</strong><small>{order.olusturma.slice(0, 10)} · {order.biletler.length} bilet · {order.bufe.length} büfe kalemi</small></div><strong>{money.format(order.toplam)}</strong></article>)}{customerOrders.length === 0 && <p className="admin-empty">Sipariş geçmişi yok.</p>}</div></> : <div className="admin-empty-state"><AdminIcon name="users" /><p>Geçmişini görmek için müşteri satırından “Geçmiş” seçin.</p></div>}
        </aside>
      </div>
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Yönetici oturumları</h2><p>SQLite aktif ve geçmiş giriş kayıtları.</p></div><StatusBadge tone="info" label={`${adminData.authSessions.length} oturum`} /></div><DataTable caption="Yönetici oturum geçmişi" rows={adminData.authSessions} rowKey={(session) => session.id} columns={[
        { key: "user", header: "Hesap", value: (session) => `${session.name} ${session.email}` },
        { key: "started", header: "Başlangıç", value: (session) => session.startedAt },
        { key: "ended", header: "Bitiş", value: (session) => session.endedAt ?? (session.active ? "Aktif" : "—") },
        { key: "status", header: "Durum", value: (session) => session.active ? "Aktif" : "Geçmiş", render: (session) => <StatusBadge tone={session.active ? "success" : "neutral"} label={session.active ? "Aktif" : "Geçmiş"} /> },
      ]} /></section>
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Son işlemler</h2><p>SQLite denetim günlüğü.</p></div></div><DataTable caption="Denetim günlüğü" rows={adminData.auditLogs} rowKey={(entry) => entry.id} columns={[
        { key: "date", header: "Tarih", value: (entry) => entry.at },
        { key: "actor", header: "Kullanıcı", value: (entry) => entry.actorId },
        { key: "action", header: "İşlem", value: (entry) => entry.action },
        { key: "entity", header: "Kayıt", value: (entry) => `${entry.entity} · ${entry.entityId}` },
        { key: "reason", header: "Açıklama", value: (entry) => entry.reason ?? "—" },
      ]} /></section>
    </div>
  );
}

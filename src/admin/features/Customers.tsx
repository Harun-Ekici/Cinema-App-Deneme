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
    { key: "name", header: "Müşteri", value: () => "•••••• •••••••", render: () => <span className="admin-private-value" title="Kişisel veri varsayılan olarak maskelenir">•••••• •••••••</span> },
    { key: "email", header: "E-posta", value: () => "••••••@••••.test", render: () => <span className="admin-private-value">••••••@••••.test</span> },
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
      <div className="admin-customer-layout"><section><DataTable caption="Müşteri profilleri (kişisel bilgiler maskeli)" rows={adminData.customers} rowKey={(customer) => customer.id} selectable searchPlaceholder="Müşteri ara..." columns={columns} actions={(customer) => <div className="admin-action-group"><button className="admin-button admin-button--quiet" type="button" onClick={() => setSelectedId(customer.id)}><AdminIcon name="history" />Geçmiş</button><button className="admin-button admin-button--quiet" type="button" onClick={() => void toggleBlocked(customer)}><AdminIcon name={customer.durum === "aktif" ? "block" : "active"} />{customer.durum === "aktif" ? "Engelle" : "Aktifleştir"}</button></div>} /></section>
        <aside className="admin-panel admin-customer-detail"><div className="admin-section-heading"><div><h2>Rezervasyon geçmişi</h2><p>{selectedCustomer ? "Müşteri seçildi · bilgiler maskeli" : "Bir müşteri seçin"}</p></div></div>
          {selectedCustomer ? <><div className="admin-customer-identity"><span className="admin-avatar">••</span><div><strong>•••••• •••••••</strong><small>••••••@••••.test</small></div></div><h3>Favori filmler</h3><div className="admin-chip-list">{selectedCustomer.favoriFilmler.map((id) => <span className="admin-chip" key={id}>{adminData.films.find((film) => film.id === id)?.ad.tr ?? "Film"}</span>)}</div><h3>Sipariş geçmişi</h3><div className="admin-customer-orders">{customerOrders.map((order) => <article key={order.id}><div><strong>{order.id}</strong><small>{order.olusturma.slice(0, 10)} · {order.biletler.length} bilet · {order.bufe.length} büfe kalemi</small></div><strong>{money.format(order.toplam)}</strong></article>)}{customerOrders.length === 0 && <p className="admin-empty">Sipariş geçmişi yok.</p>}</div></> : <div className="admin-empty-state"><AdminIcon name="users" /><p>Geçmişini görmek için müşteri satırından “Geçmiş” seçin.</p></div>}
        </aside>
      </div>
      <p className="admin-privacy-note"><strong>Gizlilik:</strong> Ad ve e-posta varsayılan olarak maskelidir. Prototipte kişisel veri gösterme özelliği açılmamıştır.</p>
    </div>
  );
}

import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { StatusBadge, type StatusTone } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";
import type { SiparisDurumu } from "../domain/types";

const statusNames: Record<SiparisDurumu, string> = {
  bekliyor: "Bekliyor",
  odendi: "Ödendi",
  kullanildi: "Kullanıldı",
  iptal: "İptal",
  iade: "İade edildi",
};
const statusTones: Record<SiparisDurumu, StatusTone> = {
  bekliyor: "warning",
  odendi: "success",
  kullanildi: "info",
  iptal: "danger",
  iade: "neutral",
};
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default function Orders() {
  const { data, replaceCollection, refundOrder } = useAdminData();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const adminData = requireAdminData(data);

  const visibleOrders = status ? adminData.orders.filter((order) => order.durum === status) : adminData.orders;

  async function processOrder(id: string) {
    const order = adminData.orders.find((item) => item.id === id);
    if (!order || (order.durum !== "bekliyor" && order.durum !== "odendi")) return;
    const nextStatus: SiparisDurumu = order.durum === "odendi" ? "iade" : "iptal";
    const action = nextStatus === "iade" ? "iade edilsin" : "iptal edilsin";
    if (!window.confirm(`${order.id} numaralı sipariş ${action} mi?`)) return;
    try {
      if (order.durum === "odendi") {
        await refundOrder(id, "Yönetim panelinden iade edildi.");
      } else {
        await replaceCollection("orders", adminData.orders.map((item) => item.id === id ? { ...item, durum: nextStatus } : item));
      }
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sipariş durumu güncellenemedi.");
    }
  }

  const columns = useMemo(() => [
    { key: "order", header: "Sipariş", value: (order: typeof adminData.orders[number]) => order.id, render: (order: typeof adminData.orders[number]) => <span className="admin-code">{order.id}</span> },
    { key: "customer", header: "Müşteri", value: (order: typeof adminData.orders[number]) => adminData.customers.find((customer) => customer.id === order.musteriId)?.ad ?? "Misafir", render: (order: typeof adminData.orders[number]) => adminData.customers.find((customer) => customer.id === order.musteriId)?.ad ?? "Misafir" },
    { key: "tickets", header: "Bilet / PNR", value: (order: typeof adminData.orders[number]) => order.biletler.map((ticket) => ticket.kod).join(" "), render: (order: typeof adminData.orders[number]) => <div className="admin-ticket-list">{order.biletler.map((ticket) => <code key={ticket.kod}>{ticket.kod}</code>)}</div> },
    { key: "concessions", header: "Büfe", value: (order: typeof adminData.orders[number]) => order.bufe.map((item) => adminData.concessionProducts.find((product) => product.id === item.urunId)?.ad.tr ?? "Menü").join(", ") || "—" },
    { key: "created", header: "Oluşturulma", value: (order: typeof adminData.orders[number]) => order.olusturma },
    { key: "total", header: "Toplam", value: (order: typeof adminData.orders[number]) => order.toplam, render: (order: typeof adminData.orders[number]) => <strong>{money.format(order.toplam)}</strong> },
    { key: "status", header: "Durum", value: (order: typeof adminData.orders[number]) => order.durum, render: (order: typeof adminData.orders[number]) => <StatusBadge tone={statusTones[order.durum]} label={statusNames[order.durum]} /> },
  ], [adminData]);

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">SATIŞ VE BİLETLER</p><h1>Siparişler</h1><p>Bilet, büfe ve sipariş durumlarını takip edin.</p></div><StatusBadge tone="info" label={`${adminData.orders.length} sipariş`} /></div>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      <section className="admin-stat-grid admin-stat-grid--compact"><article className="admin-stat-card"><span>Toplam sipariş</span><strong>{adminData.orders.length}</strong><small>SQLite kayıtları</small></article><article className="admin-stat-card"><span>Bekliyor</span><strong>{adminData.orders.filter((order) => order.durum === "bekliyor").length}</strong><small>İşlem bekleyen</small></article><article className="admin-stat-card"><span>Ödenen gelir</span><strong>{money.format(adminData.orders.filter((order) => order.durum === "odendi" || order.durum === "kullanildi").reduce((sum, order) => sum + order.toplam, 0))}</strong><small>İade ve iptal hariç</small></article></section>
      <FilterBar filters={[{ key: "status", label: "Sipariş durumu", options: Object.entries(statusNames).map(([value, label]) => ({ value, label })) }]} values={{ status }} onChange={(_, value) => setStatus(value)} onClear={() => setStatus("")} />
      <DataTable caption="Bilet ve büfe siparişleri" rows={visibleOrders} rowKey={(order) => order.id} selectable searchPlaceholder="Sipariş numarası, PNR veya müşteri ara..." columns={columns} actions={(order) => <button className="admin-button admin-button--quiet" type="button" disabled={order.durum !== "odendi" && order.durum !== "bekliyor"} onClick={() => void processOrder(order.id)}>{order.durum === "odendi" ? <AdminIcon name="undo" /> : order.durum === "bekliyor" ? <AdminIcon name="close" /> : null}{order.durum === "odendi" ? "İade" : order.durum === "bekliyor" ? "İptal" : "—"}</button>} />
    </div>
  );
}

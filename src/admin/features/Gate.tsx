import { PnrScanner } from "../components/PnrScanner";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";

export default function Gate() {
  const { data, replaceCollections } = useAdminData();
  const adminData = requireAdminData(data);

  async function markUsed(order: typeof adminData.orders[number]) {
    const now = new Date().toISOString().slice(0, 16);
    const nextOrders = adminData.orders.map((item) =>
      item.id === order.id ? { ...item, durum: "kullanildi" as const, kullanimZamani: now } : item,
    );
    const nextReservations = adminData.seatReservations.map((reservation) =>
      reservation.siparisId === order.id ? { ...reservation, durum: "dolu" as const } : reservation,
    );
    await replaceCollections({ orders: nextOrders, seatReservations: nextReservations });
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">SALON GİRİŞİ</p><h1>Kapı doğrulama</h1><p>Bilet kodlarını sorgulayın ve geçişleri onaylayın.</p></div><span className="admin-gate-live"><i /> Tarayıcı hazır</span></div>
      <div className="admin-gate-layout"><section className="admin-panel admin-scanner-panel"><PnrScanner orders={adminData.orders} sessions={adminData.sessions} films={adminData.films} halls={adminData.halls} onMarkUsed={markUsed} /></section><aside className="admin-panel admin-gate-help"><span className="admin-gate-help__icon"><AdminIcon name="receipt" /></span><h2>Nasıl kullanılır?</h2><ol><li>İlgili seansı seçin veya tüm seanslarda arama yapın.</li><li>PNR kodunu yazın ya da barkod okuyucuyla okutun.</li><li>Bilet doğrulandıktan sonra geçişi onaylayın.</li></ol><p>Bu prototip kamera açmaz; barkod okuyucu klavye girişi gibi çalışır.</p></aside></div>
    </div>
  );
}

import { PnrScanner } from "../components/PnrScanner";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";

export default function Gate() {
  const { data, verifyTicket } = useAdminData();
  const adminData = requireAdminData(data);

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">SALON GİRİŞİ</p><h1>Kapı doğrulama</h1><p>Bilet kodlarını sorgulayın ve geçişleri onaylayın.</p></div><span className="admin-gate-live"><i /> Tarayıcı hazır</span></div>
      <div className="admin-gate-layout"><section className="admin-panel admin-scanner-panel"><PnrScanner orders={adminData.orders} sessions={adminData.sessions} films={adminData.films} halls={adminData.halls} cinemas={adminData.cinemas} onVerifyTicket={verifyTicket} /></section><aside className="admin-panel admin-gate-help"><span className="admin-gate-help__icon"><AdminIcon name="receipt" /></span><h2>Nasıl kullanılır?</h2><ol><li>İlgili seansı seçin veya tüm seanslarda arama yapın.</li><li>PNR kodunu yazın ya da barkod okuyucuyla okutun.</li><li>Bilet doğrulandıktan sonra geçişi onaylayın.</li></ol><p>Bu prototip kamera açmaz; barkod okuyucu klavye girişi gibi çalışır.</p></aside></div>
    </div>
  );
}

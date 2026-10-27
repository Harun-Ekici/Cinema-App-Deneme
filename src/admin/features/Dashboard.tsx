import { useMemo } from "react";
import { useAdminData } from "../AdminDataContext";
import { dolulukYuzdesi, kapasite } from "../domain/rules";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default function Dashboard() {
  const { data, dashboardMetrics } = useAdminData();
  const topFilm = useMemo(() => {
    if (dashboardMetrics) return dashboardMetrics.enCokIzlenen[0]?.ad ?? "Henüz veri yok";
    if (!data) return "Henüz veri yok";
    const filmSales = new Map<number, number>();
    data.orders.forEach((order) => {
      if (order.durum === "iptal" || order.durum === "iade") return;
      order.biletler.forEach((ticket) => {
        const session = data.sessions.find((item) => item.id === ticket.seansId);
        if (session) filmSales.set(session.filmId, (filmSales.get(session.filmId) ?? 0) + 1);
      });
    });
    const [filmId] = [...filmSales.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    return data.films.find((film) => film.id === filmId)?.ad.tr ?? "Henüz veri yok";
  }, [data, dashboardMetrics]);
  if (!data) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = data.sessions.filter((session) => session.baslangic.startsWith(today));
  const todaySessionIds = new Set(todaySessions.map((session) => session.id));
  const todayOrders = data.orders.filter((order) => order.olusturma.startsWith(today) && order.durum !== "iptal" && order.durum !== "iade");
  const revenue = dashboardMetrics?.ciro ?? todayOrders.reduce((sum, order) => sum + order.toplam, 0);
  const seats = dashboardMetrics
    ? dashboardMetrics.seansDoluluk.reduce((sum, session) => sum + session.dolu, 0)
    : data.seatReservations.filter((reservation) =>
    todaySessionIds.has(reservation.seansId) && reservation.durum === "dolu",
  ).length;
  const capacity = todaySessions.reduce((sum, session) => {
    const hall = data.halls.find((item) => item.id === session.salonId);
    return sum + (hall ? kapasite(hall.harita) : 0);
  }, 0);
  const occupancy = dashboardMetrics
    ? Math.round(dashboardMetrics.ortalamaDoluluk)
    : capacity === 0 ? 0 : dolulukYuzdesi(seats, { satir: 1, sutun: capacity, koridorSutunlari: [], vipSatirlari: [], kullanilamaz: [] });
  const sessionCount = dashboardMetrics?.seansDoluluk.length ?? todaySessions.length;
  const ticketCount = dashboardMetrics?.bilet ?? todayOrders.reduce((sum, order) => sum + order.biletler.length, 0);
  const occupancyRows = dashboardMetrics
    ? dashboardMetrics.seansDoluluk.slice(0, 8).map((session) => ({
      id: session.seansId,
      time: session.baslangic.slice(11, 16),
      percent: Math.round(session.yuzde),
    }))
    : todaySessions.slice(0, 8).map((session) => {
      const hall = data.halls.find((item) => item.id === session.salonId);
      const filled = data.seatReservations.filter((reservation) => reservation.seansId === session.id && reservation.durum === "dolu").length;
      return {
        id: session.id,
        time: session.baslangic.slice(11, 16),
        percent: hall ? dolulukYuzdesi(filled, hall.harita) : 0,
      };
    });
  const upcomingSessions = [...data.sessions]
    .filter((session) => session.baslangic >= new Date().toISOString().slice(0, 16))
    .sort((a, b) => a.baslangic.localeCompare(b.baslangic))
    .slice(0, 5);
  const lowStock = data.concessionProducts.filter((product) => product.stok < 100 && product.aktif);

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">BUGÜN · {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p><h1>Genel bakış</h1><p>Sinema operasyonlarının güncel özeti.</p></div><button className="admin-button" type="button" onClick={() => window.print()}>Raporu yazdır</button></div>
      <section className="admin-stat-grid" aria-label="Günlük performans">
        <article className="admin-stat-card"><span>Günlük gelir</span><strong>{currency.format(revenue)}</strong><small>Bilet ve büfe siparişleri</small><span className="admin-stat-card__icon"><AdminIcon name="coins" /></span></article>
        <article className="admin-stat-card"><span>Doluluk oranı</span><strong>{occupancy}%</strong><small>{dashboardMetrics ? `${seats} kayıtlı koltuk` : `${seats} / ${capacity || 0} koltuk`}</small><span className="admin-stat-card__icon admin-stat-card__icon--amber"><AdminIcon name="chart" /></span></article>
        <article className="admin-stat-card"><span>Bugünkü bilet</span><strong>{ticketCount}</strong><small>{sessionCount} seans planlandı</small><span className="admin-stat-card__icon admin-stat-card__icon--blue"><AdminIcon name="ticket" /></span></article>
        <article className="admin-stat-card"><span>En çok izlenen</span><strong className="admin-stat-card__title">{topFilm}</strong><small>Aktif siparişlere göre</small><span className="admin-stat-card__icon admin-stat-card__icon--purple"><AdminIcon name="star" /></span></article>
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-section-heading"><div><h2>Yaklaşan seanslar</h2><p>Bugün ve sıradaki gösterimler</p></div><span className="admin-muted">{upcomingSessions.length} kayıt</span></div>
          <div className="admin-upcoming-list">
            {upcomingSessions.map((session) => {
              const film = data.films.find((item) => item.id === session.filmId);
              const hall = data.halls.find((item) => item.id === session.salonId);
              return <article className="admin-upcoming-item" key={session.id}><span className="admin-upcoming-time">{session.baslangic.slice(11, 16)}</span><div><strong>{film?.ad.tr ?? "Film"}</strong><small>{hall?.ad ?? "Salon"} · {hall?.tip ?? "2D"}</small></div><StatusBadge tone="info" label={session.baslangic.slice(5, 10)} /></article>;
            })}
            {upcomingSessions.length === 0 && <p className="admin-empty">Yaklaşan seans bulunmuyor.</p>}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-section-heading"><div><h2>Kritik uyarılar</h2><p>Operasyon takibi gerektiren konular</p></div><span className="admin-alert-count">{lowStock.length + 1}</span></div>
          <div className="admin-alert-list">
            <article><span className="admin-alert-icon admin-alert-icon--warning"><AdminIcon name="warning" /></span><div><strong>Bekleyen siparişler</strong><p>{data.orders.filter((order) => order.durum === "bekliyor").length} sipariş ödeme / doğrulama bekliyor.</p></div></article>
            {lowStock.map((product) => <article key={product.id}><span className="admin-alert-icon admin-alert-icon--danger"><AdminIcon name="warning" /></span><div><strong>{product.ad.tr} stoğu düşük</strong><p>Mevcut stok: {product.stok} adet</p></div></article>)}
            {lowStock.length === 0 && <article><span className="admin-alert-icon admin-alert-icon--success"><AdminIcon name="check" /></span><div><strong>Stoklar normal</strong><p>Kritik stok seviyesinde ürün yok.</p></div></article>}
          </div>
        </section>
      </div>
      <section className="admin-panel admin-occupancy-panel">
        <div className="admin-section-heading"><div><h2>Seans doluluk özeti</h2><p>Bugünkü seanslara kayıtlı koltukların oranı</p></div><StatusBadge tone={occupancy > 75 ? "success" : "info"} label={`Genel ${occupancy}%`} /></div>
        <div className="admin-occupancy-bars">{occupancyRows.map((session) => <div className="admin-occupancy-row" key={session.id}><span>{session.time}</span><div className="admin-progress"><i style={{ width: `${session.percent}%` }} /></div><strong>{session.percent}%</strong></div>)}{occupancyRows.length === 0 && <p className="admin-empty">Bugün için seans kaydı bulunamadı.</p>}</div>
      </section>
    </div>
  );
}

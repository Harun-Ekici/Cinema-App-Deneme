import { useState } from "react";
import { SeatMapEditor } from "../components/SeatMapEditor";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";
import { kapasite } from "../domain/rules";
import type { KoltukHaritasi } from "../domain/types";

export default function Auditoriums() {
  const { data, replaceCollection } = useAdminData();
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [draftMap, setDraftMap] = useState<KoltukHaritasi | null>(null);
  const adminData = requireAdminData(data);

  const selectedHall = adminData.halls.find((hall) => hall.id === selectedId) ?? adminData.halls[0];
  if (!selectedHall) return <p className="admin-empty">Salon kaydı bulunamadı.</p>;
  const currentMap = draftMap ?? selectedHall.harita;

  async function saveMap() {
    setError("");
    setNotice("");
    const reservedSeats = adminData.seatReservations.filter((reservation) =>
      adminData.sessions.some((session) => session.salonId === selectedHall.id && session.id === reservation.seansId) &&
      reservation.durum === "dolu",
    );
    const removedSeat = reservedSeats.find((reservation) =>
      reservation.satir >= currentMap.satir ||
      reservation.sutun >= currentMap.sutun ||
      currentMap.koridorSutunlari.includes(reservation.sutun) ||
      currentMap.kullanilamaz.some((seat) => seat.satir === reservation.satir && seat.sutun === reservation.sutun),
    );
    if (removedSeat) {
      setError("Satılmış koltuklar kullanılamaz olarak işaretlenemez veya haritadan çıkarılamaz.");
      return;
    }
    try {
      await replaceCollection("halls", adminData.halls.map((hall) => hall.id === selectedHall.id ? { ...hall, harita: currentMap } : hall));
      setDraftMap(null);
      setNotice("Koltuk haritası kaydedildi.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Koltuk haritası kaydedilemedi.");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">MEKAN YÖNETİMİ</p><h1>Salonlar</h1><p>Salon kapasitesini ve koltuk düzenini yönetin.</p></div><button className="admin-button admin-button--primary" type="button" onClick={() => void saveMap()}>Haritayı kaydet</button></div>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}{notice && <p className="admin-inline-success" role="status">{notice}</p>}
      <div className="admin-auditorium-layout">
        <section className="admin-panel admin-hall-list"><div className="admin-section-heading"><div><h2>Salonlar</h2><p>{adminData.cinemas.length} sinema</p></div></div>
          {adminData.halls.map((hall) => {
            const cinema = adminData.cinemas.find((item) => item.id === hall.sinemaId);
            return <button className={`admin-hall-option${selectedHall.id === hall.id ? " is-active" : ""}`} type="button" key={hall.id} onClick={() => { setSelectedId(hall.id); setDraftMap(null); setNotice(""); setError(""); }}><span className="admin-hall-icon"><AdminIcon name="building" /></span><span><strong>{hall.ad}</strong><small>{cinema?.ad} · {hall.tip} · {kapasite(hall.harita)} koltuk</small></span><StatusBadge tone={hall.durum === "yayinda" ? "success" : "neutral"} label={hall.durum === "yayinda" ? "Yayında" : "Taslak"} /></button>;
          })}
        </section>
        <section className="admin-panel"><div className="admin-section-heading"><div><h2>{selectedHall.ad} · Koltuk düzeni</h2><p>{selectedHall.tip} gösterim salonu · Sahne sabit yöndedir</p></div><span className="admin-muted">{kapasite(currentMap)} koltuk</span></div>
          <SeatMapEditor value={currentMap} onChange={(harita) => { setError(""); setNotice(""); setDraftMap(harita); }} />
        </section>
      </div>
    </div>
  );
}

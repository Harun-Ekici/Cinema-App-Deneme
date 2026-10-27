import { useState } from "react";
import { SeatMapEditor } from "../components/SeatMapEditor";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { useAdminData } from "../AdminDataContext";
import { kapasite } from "../domain/rules";
import type { KoltukHaritasi, SalonTipi } from "../domain/types";

export default function Auditoriums() {
  const { data, replaceCollection, createHall, publishHall } = useAdminData();
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [draftMap, setDraftMap] = useState<KoltukHaritasi | null>(null);
  const [newHallOpen, setNewHallOpen] = useState(false);
  const [newHallName, setNewHallName] = useState("");
  const [newHallType, setNewHallType] = useState<SalonTipi>("2D");
  const [newHallCinemaId, setNewHallCinemaId] = useState("");
  const adminData = data;
  const halls = Array.isArray(adminData?.halls) ? adminData.halls : [];
  const cinemas = Array.isArray(adminData?.cinemas) ? adminData.cinemas : [];
  const sessions = Array.isArray(adminData?.sessions) ? adminData.sessions : [];
  const reservations = Array.isArray(adminData?.seatReservations) ? adminData.seatReservations : [];

  const selectedHall = halls.find((hall) => hall.id === selectedId) ?? halls[0];
  const currentMap = draftMap ?? selectedHall?.harita;

  async function saveMap() {
    if (!selectedHall || !currentMap) {
      setError("Düzenlenecek salon bulunamadı.");
      return;
    }
    setError("");
    setNotice("");
    const reservedSeats = reservations.filter((reservation) =>
      sessions.some((session) => session.salonId === selectedHall.id && session.id === reservation.seansId) &&
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
      await replaceCollection("halls", halls.map((hall) => hall.id === selectedHall.id ? { ...hall, harita: currentMap } : hall));
      setDraftMap(null);
      setNotice("Koltuk haritası kaydedildi.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Koltuk haritası kaydedilemedi.");
    }
  }

  async function submitNewHall(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const cinemaId = newHallCinemaId || cinemas[0]?.id;
    const name = newHallName.trim();
    if (!cinemaId || !name) {
      setError("Sinema ve salon adı seçilmelidir.");
      return;
    }
    const nextNumber = Math.max(0, ...halls.filter((hall) => hall.sinemaId === cinemaId).map((hall) => hall.numara)) + 1;
    try {
      const hall = await createHall({ sinemaId: cinemaId, numara: nextNumber, ad: name, tip: newHallType });
      setSelectedId(hall.id);
      setDraftMap(null);
      setNewHallOpen(false);
      setNewHallName("");
      setNotice("Yeni salon taslak olarak oluşturuldu.");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Salon oluşturulamadı.");
    }
  }

  async function publishSelectedHall() {
    if (!selectedHall) return;
    try {
      await publishHall(selectedHall.id);
      setNotice("Salon yayına alındı ve seans planlamasında kullanılabilir.");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Salon yayınlanamadı.");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">MEKAN YÖNETİMİ</p><h1>Salonlar</h1><p>Salon kapasitesini ve koltuk düzenini yönetin.</p></div><div className="admin-action-group"><button className="admin-button admin-button--quiet" type="button" onClick={() => { setError(""); setNewHallCinemaId(cinemas[0]?.id ?? ""); setNewHallOpen(true); }}><AdminIcon name="plus" />Yeni Salon</button><button className="admin-button admin-button--primary" type="button" disabled={!selectedHall} onClick={() => void saveMap()}>Haritayı kaydet</button></div></div>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}{notice && <p className="admin-inline-success" role="status">{notice}</p>}
      <div className="admin-auditorium-layout">
        <section className="admin-panel admin-hall-list"><div className="admin-section-heading"><div><h2>Salonlar</h2><p>{cinemas.length} sinema</p></div></div>
          {halls.map((hall) => {
            const cinema = cinemas.find((item) => item.id === hall.sinemaId);
            return <button className={`admin-hall-option${selectedHall?.id === hall.id ? " is-active" : ""}`} type="button" key={hall.id} onClick={() => { setSelectedId(hall.id); setDraftMap(null); setNotice(""); setError(""); }}><span className="admin-hall-icon"><AdminIcon name="building" /></span><span><strong>{hall.ad}</strong><small>{cinema?.ad} · {hall.tip} · {kapasite(hall.harita)} koltuk</small></span><StatusBadge tone={hall.durum === "yayinda" ? "success" : "neutral"} label={hall.durum === "yayinda" ? "Yayında" : "Taslak"} /></button>;
          })}
          {halls.length === 0 && <p className="admin-empty">Salon kaydı bulunamadı. Yeni salon oluşturabilirsiniz.</p>}
        </section>
        {selectedHall && currentMap
          ? <section className="admin-panel"><div className="admin-section-heading"><div><h2>{selectedHall.ad} · Koltuk düzeni</h2><p>{selectedHall.tip} gösterim salonu · Sahne sabit yöndedir</p></div><div className="admin-action-group"><span className="admin-muted">{kapasite(currentMap)} koltuk</span>{selectedHall.durum === "taslak" && <button className="admin-button admin-button--primary" type="button" onClick={() => void publishSelectedHall()}>Yayınla</button>}</div></div>
            <SeatMapEditor value={currentMap} onChange={(harita) => { setError(""); setNotice(""); setDraftMap(harita); }} />
          </section>
          : <section className="admin-panel"><p className="admin-empty">Koltuk düzenini görmek için salon seçin veya oluşturun.</p></section>}
      </div>
      {newHallOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewHallOpen(false); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="new-hall-title"><div className="admin-section-heading"><div><h2 id="new-hall-title">Yeni salon</h2><p>Salon kaydı taslak durumunda oluşturulur.</p></div><button className="admin-icon-button" type="button" aria-label="Formu kapat" onClick={() => setNewHallOpen(false)}><AdminIcon name="close" /></button></div><form className="admin-form" onSubmit={(event) => void submitNewHall(event)}>
        <label className="admin-field"><span>Sinema</span><select required value={newHallCinemaId} onChange={(event) => setNewHallCinemaId(event.target.value)}><option value="">Sinema seçin</option>{cinemas.map((cinema) => <option value={cinema.id} key={cinema.id}>{cinema.ad} · {cinema.sehir}</option>)}</select></label>
        <label className="admin-field"><span>Salon adı</span><input required maxLength={80} value={newHallName} onChange={(event) => setNewHallName(event.target.value)} /></label>
        <label className="admin-field"><span>Salon tipi</span><select value={newHallType} onChange={(event) => setNewHallType(event.target.value as SalonTipi)}><option value="2D">2D</option><option value="3D">3D</option><option value="IMAX">IMAX</option></select></label>
        {cinemas.length === 0 && <p className="admin-inline-error" role="alert">Salon oluşturmadan önce en az bir sinema kaydı gerekir.</p>}
        <div className="admin-form-actions"><button className="admin-button" type="button" onClick={() => setNewHallOpen(false)}>Vazgeç</button><button className="admin-button admin-button--primary" type="submit" disabled={cinemas.length === 0}>Salon oluştur</button></div>
      </form></section></div>}
    </div>
  );
}

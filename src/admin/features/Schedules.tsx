import { useState, type SyntheticEvent } from "react";
import { DataTable } from "../components/DataTable";
import { ScheduleGrid } from "../components/ScheduleGrid";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";
import { cakisiyorMu } from "../domain/rules";
import type { Seans } from "../domain/types";

export default function Schedules() {
  const { data, replaceCollection } = useAdminData();
  const [formOpen, setFormOpen] = useState(false);
  const [filmId, setFilmId] = useState("");
  const [hallId, setHallId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("19:30");
  const [error, setError] = useState("");
  const adminData = requireAdminData(data);

  const activeFilms = adminData.films.filter((film) => film.durum !== "arsiv");

  async function createSession(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const film = adminData.films.find((item) => item.id === Number(filmId));
    const hall = adminData.halls.find((item) => item.id === hallId);
    if (!film || !hall || !date || !time) {
      setError("Film, salon, tarih ve saat seçilmelidir.");
      return;
    }
    const candidate: Seans = {
      id: `seans-${crypto.randomUUID()}`,
      filmId: film.id,
      salonId: hall.id,
      baslangic: `${date}T${time}`,
      dil: "tr",
      altyazi: "tr",
      fiyat: { standart: 220, vip: 340 },
    };
    const conflict = adminData.sessions.find((session) => cakisiyorMu(candidate, session, adminData.films));
    if (conflict) {
      const conflictingFilm = adminData.films.find((item) => item.id === conflict.filmId);
      setError(`${hall.ad} salonunda ${conflict.baslangic.slice(11, 16)} seansıyla çakışıyor${conflictingFilm ? ` (${conflictingFilm.ad.tr})` : ""}. Film süresine 15 dk temizlik arası dahildir.`);
      return;
    }
    try {
      await replaceCollection("sessions", [...adminData.sessions, candidate]);
      setFormOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Seans kaydedilemedi.");
    }
  }

  const sessionRows = [...adminData.sessions].sort((a, b) => a.baslangic.localeCompare(b.baslangic));

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">PROGRAM YÖNETİMİ</p><h1>Seanslar</h1><p>Haftalık gösterim takvimi ve salon çakışmalarını izleyin.</p></div><button className="admin-button admin-button--primary" type="button" onClick={() => { setError(""); setFormOpen(true); }}><AdminIcon name="plus" />Seans planla</button></div>
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Haftalık takvim</h2><p>Salon satırlarında seansları görüntüleyin.</p></div><StatusBadge tone="info" label={`${adminData.sessions.length} seans`} /></div><ScheduleGrid sessions={adminData.sessions} halls={adminData.halls} films={adminData.films} /></section>
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Seans listesi</h2><p>Planlanan seansları tarih ve film adına göre arayın.</p></div></div><DataTable caption="Planlanan seanslar" rows={sessionRows} rowKey={(session) => session.id} columns={[
        { key: "date", header: "Tarih / saat", value: (session) => session.baslangic, render: (session) => new Date(session.baslangic).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) },
        { key: "film", header: "Film", value: (session) => adminData.films.find((film) => film.id === session.filmId)?.ad.tr ?? "Film" },
        { key: "hall", header: "Salon", value: (session) => adminData.halls.find((hall) => hall.id === session.salonId)?.ad ?? "Salon" },
        { key: "language", header: "Dil", value: (session) => session.dil.toUpperCase() },
        { key: "price", header: "Standart / VIP", value: (session) => `${session.fiyat.standart} / ${session.fiyat.vip} TL` },
      ]} /></section>
      {formOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-form-title"><div className="admin-section-heading"><div><h2 id="schedule-form-title">Yeni seans planla</h2><p>Çakışan seanslar kaydedilmez.</p></div><button className="admin-icon-button" type="button" aria-label="Formu kapat" onClick={() => setFormOpen(false)}><AdminIcon name="close" /></button></div><form className="admin-form" onSubmit={(event) => void createSession(event)}>
        <label className="admin-field"><span>Film</span><select required value={filmId} onChange={(event) => setFilmId(event.target.value)}><option value="">Film seçin</option>{activeFilms.map((film) => <option value={film.id} key={film.id}>{film.ad.tr} · {film.sureDk} dk</option>)}</select></label>
        <label className="admin-field"><span>Salon</span><select required value={hallId} onChange={(event) => setHallId(event.target.value)}><option value="">Salon seçin</option>{adminData.halls.filter((hall) => hall.durum === "yayinda").map((hall) => <option value={hall.id} key={hall.id}>{hall.ad} · {hall.tip}</option>)}</select></label>
        <div className="admin-form-row"><label className="admin-field"><span>Tarih</span><input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="admin-field"><span>Saat</span><input type="time" required value={time} onChange={(event) => setTime(event.target.value)} /></label></div>
        {error && <p className="admin-inline-error" role="alert">{error}</p>}
        <div className="admin-form-actions"><button className="admin-button" type="button" onClick={() => setFormOpen(false)}>Vazgeç</button><button className="admin-button admin-button--primary" type="submit">Seansı kaydet</button></div>
      </form></section></div>}
    </div>
  );
}

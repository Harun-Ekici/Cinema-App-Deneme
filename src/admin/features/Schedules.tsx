import { useState, type SyntheticEvent } from "react";
import { DataTable } from "../components/DataTable";
import { ScheduleGrid } from "../components/ScheduleGrid";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { useAdminData } from "../AdminDataContext";
import { cakisiyorMu } from "../domain/rules";
import type { Film, Salon, Seans } from "../domain/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFilm(value: unknown): value is Film {
  return isRecord(value) && typeof value.id === "number" && isRecord(value.ad) && typeof value.ad.tr === "string";
}

function isHall(value: unknown): value is Salon {
  return isRecord(value) && typeof value.id === "string" && typeof value.ad === "string" && isRecord(value.harita);
}

function isSession(value: unknown): value is Seans {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.filmId === "number" &&
    typeof value.salonId === "string" &&
    typeof value.baslangic === "string" &&
    typeof value.dil === "string" &&
    isRecord(value.fiyat) &&
    typeof value.fiyat.standart === "number" &&
    typeof value.fiyat.vip === "number";
}

export default function Schedules() {
  const { data, createSession: createSessionRecord, updateSession, cancelSession } = useAdminData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Seans | null>(null);
  const [filmId, setFilmId] = useState("");
  const [hallId, setHallId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("19:30");
  const [fullPrice, setFullPrice] = useState("220");
  const [studentPrice, setStudentPrice] = useState("180");
  const [vipPrice, setVipPrice] = useState("340");
  const [error, setError] = useState("");
  const films = Array.isArray(data?.films) ? data.films.filter(isFilm) : [];
  const halls = Array.isArray(data?.halls) ? data.halls.filter(isHall) : [];
  const sessions = Array.isArray(data?.sessions) ? data.sessions.filter(isSession) : [];
  const cinemas = data?.cinemas ?? [];

  const activeFilms = films.filter((film) => film.durum !== "arsiv");

  function openSessionForm(session?: Seans) {
    setError("");
    setEditing(session ?? null);
    setFilmId(session ? String(session.filmId) : "");
    setHallId(session?.salonId ?? "");
    setDate(session?.baslangic.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
    setTime(session?.baslangic.slice(11, 16) ?? "19:30");
    setFullPrice(String(session?.fiyat.tam ?? session?.fiyat.standart ?? 220));
    setStudentPrice(String(session?.fiyat.ogrenci ?? 180));
    setVipPrice(String(session?.fiyat.vip ?? 340));
    setFormOpen(true);
  }

  async function createSession(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const film = films.find((item) => item.id === Number(filmId));
    const hall = halls.find((item) => item.id === hallId);
    if (!film || !hall || !date || !time) {
      setError("Film, salon, tarih ve saat seçilmelidir.");
      return;
    }
    const prices = {
      standart: Number(fullPrice),
      tam: Number(fullPrice),
      ogrenci: Number(studentPrice),
      vip: Number(vipPrice),
    };
    if (Object.values(prices).some((price) => !Number.isFinite(price) || price < 0)) {
      setError("Bilet fiyatları sıfır veya daha büyük geçerli sayılar olmalıdır.");
      return;
    }
    const candidate: Seans = {
      id: editing?.id ?? "",
      filmId: film.id,
      salonId: hall.id,
      baslangic: `${date}T${time}`,
      dil: "tr",
      altyazi: "tr",
      fiyat: prices,
    };
    const conflict = sessions.find((session) => session.id !== editing?.id && !session.iptal && cakisiyorMu(candidate, session, films));
    if (conflict) {
      const conflictingFilm = films.find((item) => item.id === conflict.filmId);
      const cinema = cinemas.find((item) => item.id === hall.sinemaId);
      setError(`${cinema?.ad ?? "Sinema"} · ${hall.ad} salonunda ${conflict.baslangic.slice(11, 16)} seansıyla çakışıyor${conflictingFilm ? ` (${conflictingFilm.ad.tr})` : ""}. Film süresine 15 dk temizlik arası dahildir.`);
      return;
    }
    try {
      if (editing) await updateSession(candidate);
      else {
        const { id: _temporaryId, ...newSession } = candidate;
        await createSessionRecord(newSession);
      }
      setFormOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Seans kaydedilemedi.");
    }
  }

  async function cancelScheduledSession(session: Seans) {
    if (!window.confirm("Seans iptal edilsin mi? Satılmış biletler otomatik iade edilir.")) return;
    try {
      await cancelSession(session.id, "Yönetim panelinden iptal edildi.", true);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Seans iptal edilemedi.");
    }
  }

  const sessionRows = [...sessions].sort((a, b) => a.baslangic.localeCompare(b.baslangic));

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">PROGRAM YÖNETİMİ</p><h1>Seanslar</h1><p>Haftalık gösterim takvimi ve salon çakışmalarını izleyin.</p></div><button className="admin-button admin-button--primary" type="button" onClick={() => openSessionForm()}><AdminIcon name="plus" />Seans planla</button></div>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Haftalık takvim</h2><p>Salon satırlarında seansları görüntüleyin.</p></div><StatusBadge tone="info" label={`${sessions.filter((session) => !session.iptal).length} seans`} /></div><ScheduleGrid sessions={sessions.filter((session) => !session.iptal)} halls={halls} films={films} cinemas={cinemas} onSelectSession={openSessionForm} /></section>
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Seans listesi</h2><p>Planlanan seansları tarih ve film adına göre arayın.</p></div></div><DataTable caption="Planlanan seanslar" rows={sessionRows} rowKey={(session) => session.id} columns={[
        { key: "date", header: "Tarih / saat", value: (session) => session.baslangic, render: (session) => new Date(session.baslangic).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) },
        { key: "film", header: "Film", value: (session) => films.find((film) => film.id === session.filmId)?.ad.tr ?? "Bilinmeyen Film" },
        { key: "hall", header: "Salon / lokasyon", value: (session) => {
          const hall = halls.find((item) => item.id === session.salonId);
          const cinema = cinemas.find((item) => item.id === hall?.sinemaId);
          return `${cinema?.ad ?? "Bilinmeyen Sinema"} · ${hall?.ad ?? "Bilinmeyen Salon"} · ${cinema?.sehir ?? ""}`;
        } },
        { key: "language", header: "Dil", value: (session) => session.dil.toUpperCase() },
        { key: "price", header: "Tam / Öğrenci / VIP", value: (session) => `${session.fiyat.tam ?? session.fiyat.standart} / ${session.fiyat.ogrenci ?? session.fiyat.standart} / ${session.fiyat.vip} TL` },
        { key: "status", header: "Durum", value: (session) => session.iptal ? "İptal" : "Planlandı" },
      ]} actions={(session) => <div className="admin-action-group"><button className="admin-button admin-button--quiet" type="button" disabled={Boolean(session.iptal)} onClick={() => openSessionForm(session)}><AdminIcon name="edit" />Düzenle</button><button className="admin-button admin-button--quiet" type="button" disabled={Boolean(session.iptal)} onClick={() => void cancelScheduledSession(session)}><AdminIcon name="close" />İptal</button></div>} /></section>
      {formOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-form-title"><div className="admin-section-heading"><div><h2 id="schedule-form-title">{editing ? "Seansı düzenle" : "Yeni seans planla"}</h2><p>Çakışan seanslar kaydedilmez.</p></div><button className="admin-icon-button" type="button" aria-label="Formu kapat" onClick={() => setFormOpen(false)}><AdminIcon name="close" /></button></div><form className="admin-form" onSubmit={(event) => void createSession(event)}>
        <label className="admin-field"><span>Film</span><select required value={filmId} onChange={(event) => setFilmId(event.target.value)}><option value="">Film seçin</option>{activeFilms.map((film) => <option value={film.id} key={film.id}>{film.ad.tr} · {film.sureDk} dk</option>)}</select></label>
        <label className="admin-field"><span>Salon</span><select required value={hallId} onChange={(event) => setHallId(event.target.value)}><option value="">Salon seçin</option>{halls.filter((hall) => hall.durum === "yayinda").map((hall) => <option value={hall.id} key={hall.id}>{cinemas.find((cinema) => cinema.id === hall.sinemaId)?.ad ?? "Sinema"} · {hall.ad} · {hall.tip}</option>)}</select></label>
        <div className="admin-form-row"><label className="admin-field"><span>Tarih</span><input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="admin-field"><span>Saat</span><input type="time" required value={time} onChange={(event) => setTime(event.target.value)} /></label></div>
        <div className="admin-form-row"><label className="admin-field"><span>Tam bilet fiyatı (TL)</span><input type="number" min="0" step="1" required value={fullPrice} onChange={(event) => setFullPrice(event.target.value)} /></label><label className="admin-field"><span>Öğrenci bilet fiyatı (TL)</span><input type="number" min="0" step="1" required value={studentPrice} onChange={(event) => setStudentPrice(event.target.value)} /></label></div>
        <label className="admin-field"><span>VIP bilet fiyatı (TL)</span><input type="number" min="0" step="1" required value={vipPrice} onChange={(event) => setVipPrice(event.target.value)} /></label>
        <div className="admin-form-actions"><button className="admin-button" type="button" onClick={() => setFormOpen(false)}>Vazgeç</button><button className="admin-button admin-button--primary" type="submit">Seansı kaydet</button></div>
      </form></section></div>}
    </div>
  );
}

import { useState, type SyntheticEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";
import type { Film, FilmDurumu, Tur } from "../domain/types";

const movieGenres: Tur[] = ["Aksiyon", "Dram", "Animasyon", "Bilim Kurgu", "Komedi", "Gerilim", "Belgesel"];

const emptyMovie = (): Film => ({
  id: 0,
  ad: { tr: "", en: "", de: "", ar: "" },
  gradyan: "linear-gradient(135deg, var(--renk-ana), var(--renk-koyu))",
  sinopsis: "",
  yonetmen: "",
  oyuncular: [],
  sureDk: 100,
  turler: [],
  yasSiniri: 13,
  durum: "yakinda",
});

export default function Movies() {
  const { data, saveFilm } = useAdminData();
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Film>(emptyMovie);
  const [error, setError] = useState("");
  const adminData = requireAdminData(data);

  const filtered = statusFilter ? adminData.films.filter((film) => film.durum === statusFilter) : adminData.films;
  const statusLabel: Record<FilmDurumu, string> = { vizyonda: "Vizyonda", yakinda: "Yakında", arsiv: "Arşiv" };

  function openForm(film?: Film) {
    setDraft(film ? structuredClone(film) : emptyMovie());
    setFormOpen(true);
    setError("");
  }

  async function saveMovie(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.ad?.tr?.trim() ?? "";
    if (name.length < 2) {
      setError("Türkçe film adı en az 2 karakter olmalıdır.");
      return;
    }
    if (draft.turler.length === 0) {
      setError("Film türü seçilmelidir.");
      return;
    }
    const normalizedName = name.toLocaleLowerCase("tr");
    const duplicate = adminData.films.some(
      (film) => film.id !== draft.id && film.ad.tr.trim().toLocaleLowerCase("tr") === normalizedName,
    );
    if (duplicate) {
      setError("Bu film adı zaten mevcut");
      return;
    }
    const movie = { ...draft, ad: { ...draft.ad, tr: name } };
    try {
      await saveFilm(movie);
      setFormOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Film kaydedilemedi.");
    }
  }

  async function changeStatus(film: Film, status: FilmDurumu) {
    try {
      await saveFilm({ ...film, durum: status });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Film durumu güncellenemedi.");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">KATALOG YÖNETİMİ</p><h1>Filmler</h1><p>Film kataloğunu ve vizyon durumlarını yönetin.</p></div><button className="admin-button admin-button--primary" type="button" onClick={() => openForm()}><AdminIcon name="plus" />Film ekle</button></div>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      <FilterBar filters={[{ key: "status", label: "Vizyon durumu", options: [{ value: "vizyonda", label: "Vizyonda" }, { value: "yakinda", label: "Yakında" }, { value: "arsiv", label: "Arşiv" }] }]} values={{ status: statusFilter }} onChange={(_, value) => setStatusFilter(value)} onClear={() => setStatusFilter("")} />
      <DataTable
        caption="Film kataloğu"
        rows={filtered}
        rowKey={(film) => String(film.id)}
        searchPlaceholder="Film adı veya yönetmen ara..."
        columns={[
          { key: "title", header: "Film", value: (film) => film.ad.tr, render: (film) => <div className="admin-film-cell"><span className="admin-poster" aria-hidden="true">CQ</span><span><strong>{film.ad.tr}</strong><small>{film.yonetmen}</small></span></div> },
          { key: "genres", header: "Tür", value: (film) => film.turler.join(", ") },
          { key: "duration", header: "Süre", value: (film) => `${film.sureDk} dk` },
          { key: "rating", header: "IMDb", value: (film) => film.imdb ?? "—" },
          { key: "status", header: "Durum", value: (film) => film.durum, render: (film) => <StatusBadge tone={film.durum === "vizyonda" ? "success" : film.durum === "yakinda" ? "info" : "neutral"} label={statusLabel[film.durum]} /> },
        ]}
        actions={(film) => <div className="admin-action-group"><button className="admin-button admin-button--quiet" type="button" onClick={() => openForm(film)}><AdminIcon name="edit" />Düzenle</button><button className="admin-button admin-button--quiet" type="button" onClick={() => void changeStatus(film, film.durum === "arsiv" ? "yakinda" : "arsiv")}><AdminIcon name={film.durum === "arsiv" ? "undo" : "archive"} />{film.durum === "arsiv" ? "Geri al" : "Arşivle"}</button></div>}
      />
      {formOpen && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="movie-form-title">
            <div className="admin-section-heading"><div><h2 id="movie-form-title">{draft.id ? "Filmi düzenle" : "Yeni film"}</h2><p>Film kataloğu bilgilerini girin.</p></div><button className="admin-icon-button" type="button" aria-label="Formu kapat" onClick={() => setFormOpen(false)}><AdminIcon name="close" /></button></div>
            <form className="admin-form" onSubmit={(event) => void saveMovie(event)}>
              <label className="admin-field"><span>Film adı (Türkçe)</span><input required value={draft.ad.tr} onChange={(event) => setDraft({ ...draft, ad: { ...draft.ad, tr: event.target.value } })} /></label>
              <label className="admin-field"><span>Sinopsis</span><textarea rows={3} value={draft.sinopsis} onChange={(event) => setDraft({ ...draft, sinopsis: event.target.value })} /></label>
              <label className="admin-field"><span>Film türü</span><select required value={draft.turler[0] ?? ""} onChange={(event) => setDraft({ ...draft, turler: event.target.value ? [event.target.value as Tur] : [] })}><option value="">Tür seçin</option>{movieGenres.map((genre) => <option value={genre} key={genre}>{genre}</option>)}</select></label>
              <div className="admin-form-row"><label className="admin-field"><span>Süre (dakika)</span><input type="number" min={1} value={draft.sureDk} onChange={(event) => setDraft({ ...draft, sureDk: Number(event.target.value) })} /></label><label className="admin-field"><span>Yönetmen</span><input value={draft.yonetmen} onChange={(event) => setDraft({ ...draft, yonetmen: event.target.value })} /></label></div>
              <label className="admin-field"><span>Vizyon durumu</span><select value={draft.durum} onChange={(event) => setDraft({ ...draft, durum: event.target.value as FilmDurumu })}><option value="yakinda">Yakında</option><option value="vizyonda">Vizyonda</option><option value="arsiv">Arşiv</option></select></label>
              {error && <p className="admin-inline-error" role="alert">{error}</p>}
              <div className="admin-form-actions"><button className="admin-button" type="button" onClick={() => setFormOpen(false)}>Vazgeç</button><button className="admin-button admin-button--primary" type="submit">Kaydet</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

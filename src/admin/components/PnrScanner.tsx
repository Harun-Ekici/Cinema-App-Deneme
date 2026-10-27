import { useState, type SyntheticEvent } from "react";
import { pnrBicimi } from "../domain/rules";
import type { Film, Salon, Seans, Siparis } from "../domain/types";
import { StatusBadge, type StatusTone } from "./StatusBadge";
import { AdminIcon } from "./AdminIcon";

type ScanResult =
  | { kind: "invalid"; message: string }
  | { kind: "not-found"; message: string }
  | { kind: "wrong-session"; message: string; order: Siparis }
  | { kind: "used"; message: string; order: Siparis }
  | { kind: "valid"; message: string; order: Siparis };

export interface PnrScannerProps {
  orders: Siparis[];
  sessions: Seans[];
  films: Film[];
  halls: Salon[];
  cinemas?: { id: string; ad: string; sehir: string }[];
  onVerifyTicket: (code: string, use: boolean) => Promise<unknown>;
}

const resultStyle: Record<ScanResult["kind"], { tone: StatusTone; label: string }> = {
  invalid: { tone: "danger", label: "Geçersiz biçim" },
  "not-found": { tone: "danger", label: "Bilet bulunamadı" },
  "wrong-session": { tone: "warning", label: "Yanlış seans" },
  used: { tone: "info", label: "Daha önce kullanılmış" },
  valid: { tone: "success", label: "Giriş için geçerli" },
};

export function PnrScanner({ orders, sessions, films, halls, cinemas = [], onVerifyTicket }: PnrScannerProps) {
  const [pnr, setPnr] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [actionError, setActionError] = useState("");
  const [working, setWorking] = useState(false);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    const normalized = pnr.trim().toUpperCase();
    if (!pnrBicimi.test(normalized)) {
      setResult({ kind: "invalid", message: "PNR biçimi CNQ-<salon>-<hhmm>-<6 harf/rakam> olmalıdır." });
      return;
    }

    setWorking(true);
    try {
      const response: unknown = await onVerifyTicket(normalized, false);
      if (!isRecord(response) || typeof response.sonuc !== "string") {
        throw new Error("SQLite bilet doğrulama yanıtı beklenen biçimde değil.");
      }
      const order = orders.find((item) => item.biletler.some((ticket) => ticket.kod === normalized));
      if (response.sonuc === "bicim-hatali") {
        setResult({ kind: "invalid", message: "PNR biçimi geçersiz." });
      } else if (response.sonuc === "bulunamadi" || !order) {
        setResult({ kind: "not-found", message: "Bu PNR ile eşleşen SQLite bileti bulunamadı." });
      } else if (response.sonuc === "iptal") {
        setResult({ kind: "not-found", message: "Bu bilet iptal edilmiş." });
      } else if (response.sonuc === "kullanilmis") {
        setResult({ kind: "used", message: "Bu bilet daha önce girişte kullanılmış.", order });
      } else {
        const ticket = order.biletler.find((item) => item.kod === normalized);
        if (!ticket) {
          setResult({ kind: "not-found", message: "Siparişte bilet kaydı bulunamadı." });
        } else if (selectedSessionId && ticket.seansId !== selectedSessionId) {
          setResult({ kind: "wrong-session", message: "Bilet seçili seans için geçerli değil.", order });
        } else {
          setResult({ kind: "valid", message: "SQLite bileti geçerli. Kapı geçişi için onaylayabilirsiniz.", order });
        }
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Bilet doğrulanamadı.");
      setResult(null);
    } finally {
      setWorking(false);
    }
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  const ticket = result && "order" in result
    ? result.order.biletler.find((item) => item.kod === pnr.trim().toUpperCase())
    : undefined;
  const session = ticket ? sessions.find((item) => item.id === ticket.seansId) : undefined;
  const film = session ? films.find((item) => item.id === session.filmId) : undefined;
  const hall = session ? halls.find((item) => item.id === session.salonId) : undefined;

  return (
    <div className="admin-scanner">
      <div className="admin-scanner__intro"><span className="admin-scanner__icon"><AdminIcon name="scan" /></span><div><h2>Bilet doğrulama</h2><p>PNR kodunu yazın veya tarayıcıdan okutun.</p></div></div>
      <form className="admin-scanner__form" onSubmit={submit}>
        <label className="admin-field">
          <span>Kontrol edilecek seans</span>
          <select value={selectedSessionId} onChange={(event) => setSelectedSessionId(event.target.value)}>
            <option value="">Tüm seanslar</option>
            {sessions.filter((item) => !item.iptal).map((item) => {
              const title = films.find((entry) => entry.id === item.filmId)?.ad.tr ?? "Film";
              const hall = halls.find((entry) => entry.id === item.salonId);
              const cinema = cinemas.find((entry) => entry.id === hall?.sinemaId);
              return <option value={item.id} key={item.id}>{title} · {cinema?.ad ?? "Sinema"} · {hall?.ad ?? "Salon"} · {cinema?.sehir ?? ""} · {item.baslangic.slice(0, 16).replace("T", " ")}</option>;
            })}
          </select>
        </label>
        <label className="admin-field">
          <span>PNR kodu</span>
          <input value={pnr} onChange={(event) => { setPnr(event.target.value.toUpperCase()); setResult(null); setActionError(""); }} placeholder="CNQ-S3-2130-7F4K2Q" autoComplete="off" spellCheck={false} />
        </label>
        <button className="admin-button admin-button--primary" type="submit" disabled={working}>{working ? "Sorgulanıyor..." : "Bileti sorgula"}</button>
      </form>

      {result && (
        <section className={`admin-scan-result admin-scan-result--${result.kind}`} aria-live="polite">
          <div className="admin-scan-result__heading"><StatusBadge tone={resultStyle[result.kind].tone} label={resultStyle[result.kind].label} /><span>{result.message}</span></div>
          {ticket && (
            <div className="admin-ticket-preview">
              <div><span className="admin-muted">BİLET SAHİBİ</span><strong>{result.kind === "valid" ? "Kimliği doğrulanmış müşteri" : "Maskeli müşteri"}</strong></div>
              <div><span className="admin-muted">FİLM / SEANS</span><strong>{film?.ad.tr ?? "Film"} · {session?.baslangic.slice(11, 16)}</strong></div>
              <div><span className="admin-muted">SALON / KOLTUK</span><strong>{hall?.ad ?? "Salon"} · {String.fromCharCode(65 + ticket.satir)}{ticket.sutun + 1}</strong></div>
              <code>{ticket.kod}</code>
            </div>
          )}
          {actionError && <p className="admin-inline-error" role="alert">{actionError}</p>}
          {result.kind === "valid" && <button className="admin-button admin-button--primary" type="button" disabled={working} onClick={() => {
            setActionError("");
            setWorking(true);
            void onVerifyTicket(pnr.trim().toUpperCase(), true).then((response) => {
              if (!isRecord(response) || response.sonuc !== "gecerli") {
                throw new Error("SQLite bilet kullanımını onaylamadı.");
              }
              setResult({ kind: "used", message: "Geçiş onaylandı; bilet kullanıldı.", order: result.order });
            }).catch((reason: unknown) => setActionError(reason instanceof Error ? reason.message : "Bilet durumu güncellenemedi."))
              .finally(() => setWorking(false));
          }}>Geçişi onayla</button>}
        </section>
      )}
    </div>
  );
}

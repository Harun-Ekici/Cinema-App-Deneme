import { useState } from "react";
import { kapasite, koltukAdi } from "../domain/rules";
import type { KoltukHaritasi } from "../domain/types";
import { AdminIcon } from "./AdminIcon";

export type SeatType = "standart" | "vip" | "engelli";

export interface SeatMapEditorProps {
  value: KoltukHaritasi;
  onChange: (value: KoltukHaritasi) => void;
}

function coordinateKey(row: number, column: number): string {
  return `${row}:${column}`;
}

export function SeatMapEditor({ value, onChange }: SeatMapEditorProps) {
  const [seatType, setSeatType] = useState<SeatType>("standart");
  const unavailable = new Set(value.kullanilamaz.map(({ satir, sutun }) => coordinateKey(satir, sutun)));

  function updateSeat(row: number, column: number) {
    const key = coordinateKey(row, column);
    const nowUnavailable = unavailable.has(key);
    const nextUnavailable = value.kullanilamaz.filter((seat) => coordinateKey(seat.satir, seat.sutun) !== key);
    const nextVipRows = new Set(value.vipSatirlari);

    if (seatType === "engelli") {
      if (nowUnavailable) {
        onChange({ ...value, kullanilamaz: nextUnavailable });
      } else {
        onChange({ ...value, kullanilamaz: [...nextUnavailable, { satir: row, sutun: column }] });
      }
      return;
    }

    if (seatType === "vip") nextVipRows.add(row);
    else nextVipRows.delete(row);
    onChange({
      ...value,
      vipSatirlari: [...nextVipRows].sort((a, b) => a - b),
      kullanilamaz: nextUnavailable,
    });
  }

  return (
    <section className="admin-seat-editor" aria-label="Koltuk haritası düzenleyici">
      <div className="admin-seat-editor__toolbar">
        <div className="admin-seat-modes" role="group" aria-label="Koltuk tipi seç">
          {([
            ["standart", "Standart"],
            ["vip", "VIP"],
            ["engelli", "Kullanılamaz"],
          ] as const).map(([type, label]) => (
            <button
              key={type}
              className={`admin-seat-mode${seatType === type ? " is-active" : ""}`}
              type="button"
              aria-pressed={seatType === type}
              onClick={() => setSeatType(type)}
            >{label}</button>
          ))}
        </div>
        <strong>{kapasite(value)} koltuk kapasitesi</strong>
      </div>
      <div className="admin-seat-scroll">
        <div className="admin-stage">PERDE / SAHNE</div>
        <div
          className="admin-seat-grid"
          role="grid"
          aria-label="Salon koltukları"
          style={{ gridTemplateColumns: `repeat(${value.sutun}, minmax(30px, 1fr))` }}
        >
          {Array.from({ length: value.satir }, (_, row) =>
            Array.from({ length: value.sutun }, (_, column) => {
              const label = koltukAdi(row, column);
              const key = coordinateKey(row, column);
              const isCorridor = value.koridorSutunlari.includes(column);
              const isUnavailable = unavailable.has(key);
              const category = value.vipSatirlari.includes(row) ? "vip" : "standart";
              if (isCorridor) return <span className="admin-seat-corridor" key={key} aria-hidden="true" />;
              return (
                <button
                  type="button"
                  role="gridcell"
                  key={key}
                  className={`admin-seat admin-seat--${isUnavailable ? "disabled" : category}`}
                  aria-label={`${label}, ${isUnavailable ? "kullanılamaz" : category === "vip" ? "VIP" : "standart"}`}
                  aria-pressed={isUnavailable}
                  title={`${label} · ${isUnavailable ? "Kullanılamaz" : category === "vip" ? "VIP" : "Standart"}`}
                  onClick={() => updateSeat(row, column)}
                ><AdminIcon name={isUnavailable ? "seatDisabled" : category === "vip" ? "seatVip" : "seatStandard"} /></button>
              );
            }),
          )}
        </div>
      </div>
      <div className="admin-seat-legend" aria-label="Koltuk türü açıklaması">
        <span><i className="admin-seat-key admin-seat-key--standard"><AdminIcon name="seatStandard" /></i>Standart</span>
        <span><i className="admin-seat-key admin-seat-key--vip"><AdminIcon name="seatVip" /></i>VIP</span>
        <span><i className="admin-seat-key admin-seat-key--disabled"><AdminIcon name="seatDisabled" /></i>Kullanılamaz</span>
      </div>
      <p className="admin-muted">VIP ve standart tipi satır bazında uygulanır; kullanılamaz durumu koltuk bazındadır.</p>
    </section>
  );
}

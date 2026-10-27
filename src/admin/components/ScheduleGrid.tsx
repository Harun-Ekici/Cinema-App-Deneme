import { cakisiyorMu } from "../domain/rules";
import type { Film, Salon, Seans } from "../domain/types";

export interface ScheduleGridProps {
  sessions: Seans[];
  halls: Salon[];
  films: Film[];
  onSelectSession?: (session: Seans) => void;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function ScheduleGrid({ sessions, halls, films, onSelectSession }: ScheduleGridProps) {
  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
  const conflicts = new Set<string>();

  for (let first = 0; first < sessions.length; first += 1) {
    for (let second = first + 1; second < sessions.length; second += 1) {
      const a = sessions[first];
      const b = sessions[second];
      if (a && b && cakisiyorMu(a, b, films)) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    }
  }

  return (
    <div className="admin-schedule-scroll">
      <div className="admin-schedule-grid" role="grid" aria-label="Haftalık salon ve seans takvimi">
        <div className="admin-schedule-corner" role="columnheader">Salon</div>
        {days.map((day) => (
          <div className="admin-schedule-day" role="columnheader" key={dayKey(day)}>
            <strong>{day.toLocaleDateString("tr-TR", { weekday: "short" })}</strong>
            <span>{day.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}</span>
          </div>
        ))}
        {halls.map((hall) => (
          <div className="admin-schedule-row" role="row" key={hall.id}>
            <div className="admin-schedule-hall" role="rowheader"><strong>{hall.ad}</strong><span>{hall.tip}</span></div>
            {days.map((day) => {
              const key = dayKey(day);
              const dailySessions = sessions.filter((session) =>
                session.salonId === hall.id && session.baslangic.slice(0, 10) === key,
              );
              return (
                <div className="admin-schedule-cell" role="gridcell" key={key}>
                  {dailySessions.map((session) => {
                    const film = films.find((item) => item.id === session.filmId);
                    return (
                      <button
                        key={session.id}
                        type="button"
                        className={`admin-schedule-event${conflicts.has(session.id) ? " is-conflict" : ""}`}
                        aria-label={`${film?.ad.tr ?? "Film"}, ${session.baslangic.slice(11, 16)}${conflicts.has(session.id) ? ", çakışma var" : ""}`}
                        onClick={() => onSelectSession?.(session)}
                      >
                        <strong>{session.baslangic.slice(11, 16)}</strong>
                        <span>{film?.ad.tr ?? "Film"}</span>
                        {conflicts.has(session.id) && <em>Çakışma</em>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

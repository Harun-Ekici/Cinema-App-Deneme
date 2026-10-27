import type { ReactNode } from "react";

export type AdminIconName =
  | "dashboard"
  | "film"
  | "calendar"
  | "building"
  | "popcorn"
  | "receipt"
  | "scan"
  | "users"
  | "sun"
  | "moon"
  | "bell"
  | "coins"
  | "chart"
  | "ticket"
  | "star"
  | "warning"
  | "check"
  | "error"
  | "info"
  | "search"
  | "sort"
  | "sortAsc"
  | "sortDesc"
  | "chevronLeft"
  | "chevronRight"
  | "plus"
  | "minus"
  | "close"
  | "edit"
  | "archive"
  | "undo"
  | "active"
  | "block"
  | "history"
  | "drink"
  | "snack"
  | "seatStandard"
  | "seatVip"
  | "seatDisabled";

export interface AdminIconProps {
  name: AdminIconName;
  className?: string;
}

const iconShapes: Record<AdminIconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
  film: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18m-13 4h.01M12 14h.01M16 14h.01M7 17h.01M12 17h.01" /></>,
  building: <><path d="M3 21h18M5 21V5l7-3 7 3v16M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-5h4v5" /></>,
  popcorn: <><path d="M5 9h14l-2 12H7L5 9Z" /><path d="M5 9 3.5 6.5l3-2 2 2 2-3 3 2 2-2 3 2L17 9" /><path d="m9 12 1 6m5-6-1 6" /></>,
  receipt: <><path d="M5 3 7 4.5 9 3l3 1.5L15 3l2 1.5L19 3v18l-2-1.5-2 1.5-3-1.5L9 21l-2-1.5L5 21V3Z" /><path d="M9 9h6m-6 4h6m-6 4h3" /></>,
  scan: <><path d="M7 3H5a2 2 0 0 0-2 2v2m14-4h2a2 2 0 0 1 2 2v2M3 17v2a2 2 0 0 0 2 2h2m14-4v2a2 2 0 0 1-2 2h-2M3 12h18" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  coins: <><circle cx="8" cy="8" r="5" /><path d="M10.5 12.5 15 21l1.2-2.4L19 20l-4.5-8.5M8 5v6m-2-4h3m-3 2h4" /></>,
  chart: <><path d="M4 19V5m0 14h17" /><path d="m7 15 4-4 3 2 5-6" /><path d="M19 7v4h-4" /></>,
  ticket: <><path d="M3 8a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2Z" /><path d="M13 5v2m0 4v2m0 4v2" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  warning: <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  error: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  sort: <path d="M8 5v14m0 0-3-3m3 3 3-3M16 19V5m0 0-3 3m3-3 3 3" />,
  sortAsc: <path d="M12 19V5m0 0-4 4m4-4 4 4" />,
  sortDesc: <path d="M12 5v14m0 0-4-4m4 4 4-4" />,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
  archive: <><path d="M3 4h18v4H3zM5 8v12h14V8m-9 4h4" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h9a7 7 0 0 1 0 14h-2" /></>,
  active: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  block: <><circle cx="12" cy="12" r="9" /><path d="m6 6 12 12" /></>,
  history: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5m4-1v5l3 2" /></>,
  drink: <><path d="M5 4h14l-1.5 17h-11L5 4Z" /><path d="m9 4 2-3h4l2 3m-8 6h6" /></>,
  snack: <><path d="M4 7h16l-1 14H5L4 7Z" /><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M8 11h8m-7 4h6" /></>,
  seatStandard: <circle cx="12" cy="12" r="5" />,
  seatVip: <path d="m12 4 8 8-8 8-8-8 8-8Z" />,
  seatDisabled: <path d="m8 8 8 8m0-8-8 8" />,
};

export function AdminIcon({ name, className }: AdminIconProps) {
  return (
    <svg
      className={className ? `admin-icon ${className}` : "admin-icon"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconShapes[name]}
    </svg>
  );
}

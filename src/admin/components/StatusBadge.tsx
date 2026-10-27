import type { ReactNode } from "react";
import { AdminIcon, type AdminIconName } from "./AdminIcon";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  icon?: ReactNode;
}

const toneIcons: Record<StatusTone, AdminIconName> = {
  success: "check",
  warning: "warning",
  danger: "error",
  info: "info",
  neutral: "info",
};

export function StatusBadge({ label, tone = "neutral", icon }: StatusBadgeProps) {
  return (
    <span className={`admin-status admin-status--${tone}`}>
      <span className="admin-status__icon">{icon ?? <AdminIcon name={toneIcons[tone]} />}</span>
      {label}
    </span>
  );
}

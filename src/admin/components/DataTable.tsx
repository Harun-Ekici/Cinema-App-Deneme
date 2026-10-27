import { useMemo, useState, type ReactNode } from "react";
import { AdminIcon } from "./AdminIcon";

export interface DataColumn<T> {
  key: string;
  header: string;
  value: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  caption: string;
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  pageSize?: number;
  selectable?: boolean;
  searchPlaceholder?: string;
  actions?: (row: T) => ReactNode;
}

export function DataTable<T>({
  caption,
  rows,
  columns,
  rowKey,
  emptyMessage = "Gösterilecek kayıt bulunamadı.",
  pageSize = 10,
  selectable = false,
  searchPlaceholder = "Tabloda ara...",
  actions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    const matched = needle
      ? rows.filter((row) => columns.some((column) =>
          String(column.value(row)).toLocaleLowerCase("tr").includes(needle),
        ))
      : rows;
    if (!sortKey) return matched;
    const column = columns.find((item) => item.key === sortKey);
    if (!column) return matched;
    return [...matched].sort((a, b) => {
      const left = column.value(a);
      const right = column.value(b);
      const result = typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), "tr");
      return result * (sortDirection === "asc" ? 1 : -1);
    });
  }, [columns, query, rows, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  function toggleSelected(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function togglePageSelection() {
    setSelected((current) => {
      const next = new Set(current);
      const allSelected = visibleRows.every((row) => next.has(rowKey(row)));
      visibleRows.forEach((row) => allSelected ? next.delete(rowKey(row)) : next.add(rowKey(row)));
      return next;
    });
  }

  return (
    <section className="admin-table-card">
      <div className="admin-table-toolbar">
        <label className="admin-search">
          <AdminIcon name="search" />
          <input
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        {selectable && <span className="admin-muted">{selected.size} kayıt seçili</span>}
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="admin-select-cell">
                  <input
                    type="checkbox"
                    aria-label="Bu sayfadaki tüm kayıtları seç"
                    checked={visibleRows.length > 0 && visibleRows.every((row) => selected.has(rowKey(row)))}
                    onChange={togglePageSelection}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th scope="col" key={column.key}>
                  {column.sortable === false ? column.header : (
                    <button className="admin-sort-button" type="button" onClick={() => toggleSort(column.key)}>
                      {column.header}
                      <AdminIcon
                        name={sortKey === column.key ? sortDirection === "asc" ? "sortAsc" : "sortDesc" : "sort"}
                      />
                    </button>
                  )}
                </th>
              ))}
              {actions && <th scope="col">İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr><td className="admin-empty-cell" colSpan={columns.length + Number(selectable) + Number(Boolean(actions))}>{emptyMessage}</td></tr>
            ) : visibleRows.map((row) => (
              <tr key={rowKey(row)}>
                {selectable && (
                  <td className="admin-select-cell" data-label="Seç">
                    <input
                      type="checkbox"
                      checked={selected.has(rowKey(row))}
                      aria-label={`${rowKey(row)} kaydını seç`}
                      onChange={() => toggleSelected(rowKey(row))}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} data-label={column.header}>{column.render ? column.render(row) : column.value(row)}</td>
                ))}
                {actions && <td className="admin-row-actions" data-label="İşlem">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="admin-table-footer">
        <span className="admin-muted">{filteredRows.length} kayıttan {filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRows.length)} arası</span>
        <div className="admin-pagination" aria-label="Tablo sayfalama">
          <button className="admin-button admin-button--quiet" type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><AdminIcon name="chevronLeft" />Önceki</button>
          <span aria-live="polite">{page} / {pageCount}</span>
          <button className="admin-button admin-button--quiet" type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Sonraki<AdminIcon name="chevronRight" /></button>
        </div>
      </footer>
    </section>
  );
}

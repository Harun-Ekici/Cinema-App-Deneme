export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface FilterBarProps {
  filters: FilterDefinition[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function FilterBar({ filters, values, onChange, onClear }: FilterBarProps) {
  const hasSelection = Object.values(values).some(Boolean);
  return (
    <div className="admin-filter-bar">
      {filters.map((filter) => (
        <label className="admin-field admin-field--compact" key={filter.key}>
          <span>{filter.label}</span>
          <select value={values[filter.key] ?? ""} onChange={(event) => onChange(filter.key, event.target.value)}>
            <option value="">Tümü</option>
            {filter.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
      ))}
      {hasSelection && <button className="admin-button admin-button--quiet" type="button" onClick={onClear}>Filtreleri temizle</button>}
    </div>
  );
}

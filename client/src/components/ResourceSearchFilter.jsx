import styles from "./ResourceSearchFilter.module.css";

function ResourceSearchFilter({
  search,
  onSearchChange,
  filters,
  onFilterChange,
}) {
  return (
    <div className={styles.wrapper}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search facility by name…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />

      {/* Filters */}
      <div className={styles.filtersRow}>
        <input
          type="number"
          placeholder="Min capacity"
          value={filters.capacity}
          onChange={(e) => onFilterChange("capacity", e.target.value)}
        />

        <input
          type="date"
          value={filters.date}
          onChange={(e) => onFilterChange("date", e.target.value)}
        />

        <input
          type="time"
          value={filters.startTime}
          onChange={(e) => onFilterChange("startTime", e.target.value)}
        />

        <input
          type="time"
          value={filters.endTime}
          onChange={(e) => onFilterChange("endTime", e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => onFilterChange("location", e.target.value)}
        />

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.hasAC}
            onChange={(e) => onFilterChange("hasAC", e.target.checked)}
          />
          AC
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.hasProjector}
            onChange={(e) => onFilterChange("hasProjector", e.target.checked)}
          />
          Projector
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.isActive}
            onChange={(e) => onFilterChange("isActive", e.target.checked)}
          />
          Available
        </label>
      </div>
    </div>
  );
}

export default ResourceSearchFilter;

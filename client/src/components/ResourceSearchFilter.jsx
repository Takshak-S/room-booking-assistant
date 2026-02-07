import { useState } from "react";
import styles from "./ResourceSearchFilter.module.css";

function ResourceSearchFilter({
  search,
  onSearchChange,
  filters,
  onFilterChange,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={styles.wrapper}>
      {/* Search + Filter Toggle */}
      <div className={styles.topRow}>
        <input
          type="text"
          placeholder="Search facility by name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />

        <button
          type="button"
          className={styles.filterToggleBtn}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Filter"}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Type</label>
            <input
              type="text"
              placeholder="Classroom, Lab, Auditorium…"
              value={filters.type}
              onChange={(e) => onFilterChange("type", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Minimum Capacity</label>
            <input
              type="number"
              value={filters.capacity}
              onChange={(e) => onFilterChange("capacity", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => onFilterChange("date", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Start Time</label>
            <input
              type="time"
              value={filters.startTime}
              onChange={(e) => onFilterChange("startTime", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>End Time</label>
            <input
              type="time"
              value={filters.endTime}
              onChange={(e) => onFilterChange("endTime", e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Location</label>
            <input
              type="text"
              placeholder="Block / Floor"
              value={filters.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={filters.hasAC}
                onChange={(e) =>
                  onFilterChange("hasAC", e.target.checked)
                }
              />
              Has AC
            </label>

            <label>
              <input
                type="checkbox"
                checked={filters.hasProjector}
                onChange={(e) =>
                  onFilterChange("hasProjector", e.target.checked)
                }
              />
              Has Projector
            </label>

            <label>
              <input
                type="checkbox"
                checked={filters.isActive}
                onChange={(e) =>
                  onFilterChange("isActive", e.target.checked)
                }
              />
              Available (Not under maintenance)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceSearchFilter;

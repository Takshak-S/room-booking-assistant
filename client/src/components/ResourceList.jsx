import styles from "./ResourceList.module.css";

function Amenity({ available, label }) {
  return (
    <div
      className={styles.amenity}
      aria-hidden={!available}
    >
      <span
        className={styles.dot}
        data-on={available ? "1" : "0"}
      />
      <span className={styles.amenityLabel}>{label}</span>
    </div>
  );
}

function ResourceList({ resources, onSelect, selectedId }) {
  return (
    <div className={`${styles.resourceGrid} ${resources.length === 0 ? styles.empty : ""}`}>
      {resources.map((resource) => (
        <div
          key={resource.id}
          className={`${styles.card} ${
            selectedId === resource.id ? styles.selected : ""
          }`}
          onClick={() => onSelect(resource)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSelect(resource);
          }}
        >
          <div className={styles.topRow}>
            <div className={styles.title}>{resource.name}</div>
            <div className={styles.capacity}>
              Capacity {resource.capacity}
            </div>
          </div>

          <div className={styles.meta}>{resource.type}</div>

          <div className={styles.footer}>
            <button
              className={styles.selectBtn}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(resource);
              }}
            >
              {selectedId === resource.id ? "Selected" : "Reserve"}
            </button>
          </div>

          <div className={styles.amenities}>
            <Amenity available={resource.has_ac} label="AC" />
            <Amenity
              available={resource.has_projector}
              label="Projector"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResourceList;

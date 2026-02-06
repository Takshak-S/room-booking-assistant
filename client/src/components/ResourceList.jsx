import styles from "./ResourceList.module.css";

function ResourceList({ resources, onSelect, selectedId }) {
  return (
    <div className={styles.resourceGrid}>
      {resources.map((resource) => (
        <div 
          key={resource.id} 
          className={`${styles.card} ${selectedId === resource.id ? styles.selected : ""}`}
        >
          <div className={styles.cardInfo}>
            <strong>{resource.name}</strong>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
              {resource.type} | Capacity: {resource.capacity}
            </div>
          </div>
          <button 
            className={styles.selectBtn} 
            onClick={() => onSelect(resource)}
          >
            {selectedId === resource.id ? "Selected" : "Select Room"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default ResourceList;
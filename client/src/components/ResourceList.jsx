import styles from "./ResourceList.module.css";

function ResourceList({ resources, onSelect, selectedId }) {
  return (
    <div className={styles.grid}>
      {resources.map((resource) => (
        <div 
          key={resource.id} 
          className={`${styles.card} ${selectedId === resource.id ? styles.cardSelected : ""}`}
        >
          <strong>{resource.name}</strong>
          <div style={{fontSize: '0.85rem', color: '#64748b'}}>
            Type: {resource.type} | Cap: {resource.capacity}
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
function ResourceList({ resources, onSelect }) {
  return (
    <div>
      <h3>Available Resources</h3>

      {resources.map((resource) => (
        <div
          key={resource.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "8px",
          }}
        >
          <p>
            <strong>{resource.name}</strong>
          </p>
          <p>Type: {resource.type}</p>
          <p>Capacity: {resource.capacity}</p>

          <button onClick={() => onSelect(resource)}>
            Select
          </button>
        </div>
      ))}
    </div>
  );
}

export default ResourceList;

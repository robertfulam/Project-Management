import { Link } from "react-router-dom";

function TaskCard({ task, onDelete }) {
  return (
    <div style={cardStyle}>
      <h3>{task.title}</h3>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>

      <div style={{ marginTop: "10px" }}>
        <Link to={`/task/${task.id}`}>View</Link>{" | "}
        <Link to={`/edit/${task.id}`}>Edit</Link>{" | "}
        <button onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "10px",
};

export default TaskCard;
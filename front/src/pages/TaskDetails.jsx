import { useParams, Link } from "react-router-dom";

function TaskDetails() {
  const { id } = useParams();
  const task = mockTasks.find((t) => t.id === id);

  if (!task) return <p>Task not found</p>;

  return (
    <div>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>
      <p>Due: {task.dueDate}</p>

      <Link to={`/edit/${task.id}`}>Edit</Link>
    </div>
  );
}

export default TaskDetails;
import { useParams, useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const task = mockTasks.find((t) => t.id === id);

  const handleEdit = (updatedData) => {
    const index = mockTasks.findIndex((t) => t.id === id);
    mockTasks[index] = { ...mockTasks[index], ...updatedData };
    navigate("/");
  };

  if (!task) return <p>Task not found</p>;

  return (
    <div>
      <h2>Edit Task</h2>
      <TaskForm initialData={task} onSubmit={handleEdit} />
    </div>
  );
}

export default EditTask;
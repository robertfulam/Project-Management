import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";

function AddTask() {
  const navigate = useNavigate();

  const handleAdd = (task) => {
    mockTasks.push({ ...task, id: Date.now().toString() });
    navigate("/");
  };

  return (
    <div>
      <h2>Add Task</h2>
      <TaskForm onSubmit={handleAdd} />
    </div>
  );
}

export default AddTask;
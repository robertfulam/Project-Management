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
      <TaskForm onSubmit={handleAdd} />
    </div>
  );
}

export default AddTask;
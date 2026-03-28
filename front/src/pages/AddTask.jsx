import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import { taskService } from "../services/taskService";
import toast from "react-hot-toast";

function AddTask() {
  const navigate = useNavigate();

  const handleAdd = async (taskData) => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Prepare task data
      const taskToCreate = {
        ...taskData,
        assignedTo: taskData.assignedTo || user._id, // Assign to current user if not specified
      };
      
      await taskService.createTask(taskToCreate);
      toast.success('Task created successfully!');
      navigate("/");
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task');
      throw error;
    }
  };

  return (
    <div className="add-task-page">
      <TaskForm onSubmit={handleAdd} />
    </div>
  );
}

export default AddTask;
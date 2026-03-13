import { useState } from "react";
import TaskCard from "../components/TaskCard";

function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const handleDelete = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div>
      <h2>Dashboard</h2>




      

      {/* {tasks.length === 0 ? (
        <p>No tasks available</p>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={handleDelete} />
        ))
      )} */}
    </div>
  );
}

export default Dashboard;
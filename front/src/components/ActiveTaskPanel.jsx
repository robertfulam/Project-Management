import React from "react";
import { mockTasks } from "../data/mockTasks";
import "./Admin.css";

const ActiveTasks = () => {

  const activeTasks = mockTasks.filter((t) => !t.completed);

  return (
    <div>

      <h2>Active Tasks</h2>

      {activeTasks.map((task) => (

        <div key={task.id} className="admin-task-card">

          <h3>{task.title}</h3>

          <p>Category: {task.category}</p>
          <p>Priority: {task.priority}</p>

          <button>Complete</button>
          <button>Delete</button>

        </div>

      ))}

    </div>
  );
};

export default ActiveTasks;
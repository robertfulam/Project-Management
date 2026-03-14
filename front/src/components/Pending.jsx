






import React, { useState } from "react";
import { Link } from "react-router-dom";
import { mockTasks } from "../data/mockTasks";
import "./compencat.css";

const Pending = () => {

  // Only pending tasks
  const pendingTasks = mockTasks.filter((task) => !task.completed);

  // Extract categories from pending tasks
  const categories = [...new Set(pendingTasks.map((task) => task.category))];

  // Selected category
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Filter pending tasks in selected category
  const filteredTasks = pendingTasks.filter(
    (task) => task.category === selectedCategory
  );

  return (
    <div className="pending-container">

      

        {/* CATEGORY BLOCK */}
        <div className="category-blocks">

          <h2>Categories</h2>

          {categories.map((category) => (
            <div
              key={category}
              className={`category-item ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </div>
          ))}

        </div>


        {/* TASK BLOCK */}
        <div className="task-blocks">

          <h2>{selectedCategory} Pending Tasks</h2>

          {filteredTasks.length === 0 ? (
            <p>No pending tasks</p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="task-card">

                <Link to={`/task/${task.id}`} className="task-title">
                  {task.title}
                </Link>

                <p>Urgency: {task.status}</p>
                <p>Priority: {task.priority}</p>
                <p>Due: {task.dueDate}</p>

                <div className="task-actions">
                  <Link to={`/edit/${task.id}`}>Edit</Link>
                  <button>Complete</button>
                </div>

              </div>
            ))
          )}

        </div>

      </div>

  
  );
};

export default Pending;
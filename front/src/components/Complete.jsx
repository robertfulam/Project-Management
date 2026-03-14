import React, { useState } from "react";
import { Link } from "react-router-dom";
import { mockTasks } from "../data/mockTasks";
import "./compencat.css";

const Complete = () => {

  // Only completed tasks
  const completedTasks = mockTasks.filter((task) => task.completed);

  // Extract categories from completed tasks
  const categories = [...new Set(completedTasks.map((task) => task.category))];

  // Default selected category
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Filter tasks based on category
  const filteredTasks = completedTasks.filter(
    (task) => task.category === selectedCategory
  );

  return (
    <div className="complete-container">

      

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

          <h2>{selectedCategory} Completed Tasks</h2>

          {filteredTasks.length === 0 ? (
            <p>No completed tasks</p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="task-card">

                <Link to={`/task/${task.id}`} className="task-title">
                  {task.title}
                </Link>

                <p>Urgency: {task.status}</p>
                <p>Priority: {task.priority}</p>
                <p>Completed On: {task.dueDate}</p>

                <div className="task-actions">
                  <Link to={`/edit/${task.id}`}>Edit</Link>
                </div>

              </div>
            ))
          )}

        </div>

      </div>

  
  );
};

export default Complete;
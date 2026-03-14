import React, { useState } from "react";
import { Link } from "react-router-dom";
import { mockTasks } from "../data/mockTasks";
// import "./Categories.css";
import "./compencat.css";

const Categories = () => {

  // Extract unique categories
  const categories = [...new Set(mockTasks.map((task) => task.category))];

  // Default selected category
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Filter tasks by selected category
  const filteredTasks = mockTasks.filter(
    (task) => task.category === selectedCategory
  );

  return (
    <div className="category-container">

      

      {/* <div className="category-layout"> */}

        {/* CATEGORY LIST */}
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


        {/* TASKS IN CATEGORY */}
        <div className="task-blocks">

          <h2>{selectedCategory} Tasks</h2>

          {filteredTasks.length === 0 ? (
            <p>No tasks in this category</p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="task-card">

                <Link to={`/task/${task.id}`} className="task-title">
                  {task.title}
                </Link>

                <p>Urgency: {task.status}</p>
                <p>Priority: {task.priority}</p>

                <div className="task-actions">
                  <Link to={`/edit/${task.id}`}>Edit</Link>
                  <button>Delete</button>
                  <button>Complete</button>
                </div>

              </div>
            ))
          )}

        </div>

      </div>

    
  );
};

export default Categories;
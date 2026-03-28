import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { taskService } from "../services/taskService";
import toast from "react-hot-toast";
import "./compencat.css";

const Complete = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all user tasks and filter completed ones
      const tasks = await taskService.getUserTasks();
      const completed = tasks.filter(task => task.status === 'completed');
      setCompletedTasks(completed);
      
      // Extract unique categories from completed tasks
      const uniqueCategories = [...new Set(completed.map(task => task.category?.name).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Set default selected category if available
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
    } catch (error) {
      console.error('Failed to fetch completed tasks:', error);
      setError(error.message || 'Failed to load completed tasks');
      toast.error('Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on selected category
  const filteredTasks = completedTasks.filter(
    (task) => task.category?.name === selectedCategory
  );

  if (loading) {
    return (
      <div className="complete-container">
        <div className="loading-spinner">Loading completed tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="complete-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCompletedTasks} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="complete-container">
      {/* CATEGORY BLOCK */}
      <div className="category-blocks">
        <h2>Categories</h2>
        {categories.length === 0 ? (
          <p className="no-categories">No completed tasks yet</p>
        ) : (
          categories.map((category) => (
            <div
              key={category}
              className={`category-item ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </div>
          ))
        )}
      </div>

      {/* TASK BLOCK */}
      <div className="task-blocks">
        <h2>
          {selectedCategory ? `${selectedCategory} Completed Tasks` : "Completed Tasks"}
        </h2>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No completed tasks in this category</p>
            <Link to="/add" className="create-task-link">
              Create your first task
            </Link>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <Link to={`/task/${task._id}`} className="task-title">
                {task.title}
              </Link>
              
              <p className="task-description">
                {task.description?.substring(0, 100)}
                {task.description?.length > 100 && "..."}
              </p>
              
              <div className="task-meta">
                <span className={`priority-badge ${task.priority}`}>
                  Priority: {task.priority}
                </span>
                <span className={`urgency-badge ${task.urgency}`}>
                  Urgency: {task.urgency}
                </span>
              </div>
              
              <p className="completion-date">
                <strong>Completed On:</strong>{" "}
                {task.completedAt 
                  ? new Date(task.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "Date not available"
                }
              </p>
              
              {task.estimatedHours && (
                <p className="estimated-hours">
                  <strong>Estimated Hours:</strong> {task.estimatedHours}h
                </p>
              )}
              
              {task.tags && task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="task-actions">
                <Link to={`/edit/${task._id}`} className="edit-link">
                  Edit
                </Link>
                <Link to={`/task/${task._id}`} className="view-link">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Complete;
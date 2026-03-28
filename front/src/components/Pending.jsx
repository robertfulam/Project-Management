import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { taskService } from "../services/taskService";
import { categoryService } from "../services/categoryService";
import toast from "react-hot-toast";
import "./compencat.css";

const Pending = () => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all tasks and filter pending ones
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getUserTasks(),
        categoryService.getCategories()
      ]);
      
      const pending = tasksData.filter(task => 
        task.status === 'pending' || task.status === 'in-progress'
      );
      setPendingTasks(pending);
      setCategories(categoriesData);
      
      // Set default selected category
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error);
      setError(error.message || 'Failed to load pending tasks');
      toast.error('Failed to load pending tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      toast.success('Task marked as completed!');
      fetchPendingTasks(); // Refresh data
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error(error.message || 'Failed to complete task');
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  // Filter tasks by selected category
  const filteredTasks = pendingTasks.filter(
    (task) => task.category?._id === selectedCategory
  );

  if (loading) {
    return (
      <div className="pending-container">
        <div className="loading-spinner">Loading pending tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPendingTasks} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedCategoryObj = categories.find(c => c._id === selectedCategory);

  return (
    <div className="pending-container">
      {/* CATEGORY BLOCK */}
      <div className="category-blocks">
        <h2>Categories</h2>
        {categories.length === 0 ? (
          <p className="no-categories">No categories available</p>
        ) : (
          categories.map((category) => {
            const categoryTaskCount = pendingTasks.filter(
              t => t.category?._id === category._id
            ).length;
            
            return (
              <div
                key={category._id}
                className={`category-item ${
                  selectedCategory === category._id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category._id)}
              >
                {category.name}
                <span className="category-count">{categoryTaskCount}</span>
              </div>
            );
          })
        )}
      </div>

      {/* TASK BLOCK */}
      <div className="task-blocks">
        <h2>
          {selectedCategoryObj?.name || "Selected"} Pending Tasks
          <span className="task-count-badge">
            {filteredTasks.length} pending
          </span>
        </h2>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No pending tasks in this category</p>
            <Link to="/add" className="create-task-link">
              Create a new task
            </Link>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className={`task-card ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
              <Link to={`/task/${task._id}`} className="task-title">
                {task.title}
                {isOverdue(task.dueDate) && (
                  <span className="overdue-badge">Overdue!</span>
                )}
              </Link>
              
              <p className="task-description">
                {task.description?.substring(0, 100)}
                {task.description?.length > 100 && "..."}
              </p>
              
              <div className="task-meta">
                <span className={`urgency-badge ${task.urgency}`}>
                  Urgency: {task.urgency?.replace('-', ' ') || 'Not set'}
                </span>
                <span className={`priority-badge ${task.priority}`}>
                  Priority: {task.priority || 'Medium'}
                </span>
                <span className={`due-date-badge ${isOverdue(task.dueDate) ? 'overdue-date' : ''}`}>
                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                  {isOverdue(task.dueDate) && ' ⚠️'}
                </span>
              </div>
              
              {task.estimatedHours && (
                <p className="estimated-hours">
                  <strong>Est. Hours:</strong> {task.estimatedHours}h
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
                <button 
                  onClick={() => handleCompleteTask(task._id)}
                  className="complete-btn"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Pending;
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { taskService } from "../services/taskService";
import { categoryService } from "../services/categoryService";
import toast from "react-hot-toast";
import "./compencat.css";

const Categories = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all tasks and categories
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getUserTasks(),
        categoryService.getCategories()
      ]);
      
      setTasks(tasksData);
      setCategories(categoriesData);
      
      // Set default selected category
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error.message || 'Failed to load data');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        toast.success('Task deleted successfully');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error(error.message || 'Failed to delete task');
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      toast.success('Task marked as completed!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error(error.message || 'Failed to complete task');
    }
  };

  // Filter tasks by selected category
  const filteredTasks = tasks.filter(
    (task) => task.category?._id === selectedCategory
  );

  if (loading) {
    return (
      <div className="category-container">
        <div className="loading-spinner">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedCategoryObj = categories.find(c => c._id === selectedCategory);

  return (
    <div className="category-container">
      {/* CATEGORY LIST */}
      <div className="category-blocks">
        <h2>Categories</h2>
        {categories.length === 0 ? (
          <p className="no-categories">No categories available</p>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className={`category-item ${
                selectedCategory === category._id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category._id)}
            >
              {category.name}
              <span className="category-count">
                {tasks.filter(t => t.category?._id === category._id).length}
              </span>
            </div>
          ))
        )}
      </div>

      {/* TASKS IN CATEGORY */}
      <div className="task-blocks">
        <h2>
          {selectedCategoryObj?.name || "Selected"} Tasks
          <span className="task-count-badge">
            {filteredTasks.length} tasks
          </span>
        </h2>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks in this category</p>
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
                <span className={`urgency-badge ${task.urgency}`}>
                  Urgency: {task.urgency?.replace('-', ' ') || 'Not set'}
                </span>
                <span className={`priority-badge ${task.priority}`}>
                  Priority: {task.priority || 'Medium'}
                </span>
                {task.dueDate && (
                  <span className="due-date-badge">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              
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
                {task.status !== 'completed' && (
                  <>
                    <button 
                      onClick={() => handleCompleteTask(task._id)}
                      className="complete-btn"
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Categories;
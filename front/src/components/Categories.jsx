import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryService } from "../services/categoryService";
import { taskService } from "../services/taskService";
import { authService } from "../services/authService";
import CreateCategory from "./CreateCategory";
import toast from "react-hot-toast";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({});
  const user = authService.getUser();
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, tasksData] = await Promise.all([
        categoryService.getCategories(),
        taskService.getUserTasks()
      ]);
      setCategories(categoriesData);
      setTasks(tasksData);
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All tasks in this category will also be deleted.')) {
      try {
        await categoryService.deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.message || 'Failed to delete category');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || '',
      color: category.color || '#6366f1',
      icon: category.icon || '📁'
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryService.updateCategory(editingCategory._id, editForm);
      toast.success('Category updated successfully');
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const getTasksForCategory = (categoryId) => {
    return tasks.filter(task => task.category?._id === categoryId);
  };

  const colorOptions = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec489a", "#14b8a6", "#f97316"];
  const iconOptions = ["📁", "💼", "🎨", "💻", "📚", "🏠", "💪", "🎯", "⭐", "🔥"];

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>My Categories</h2>
        <CreateCategory onCategoryCreated={fetchData} />
      </div>

      <div className="categories-layout">
        {/* Categories Sidebar */}
        <div className="categories-sidebar">
          {categories.length === 0 ? (
            <div className="empty-categories">
              <p>No categories yet. Create your first category!</p>
            </div>
          ) : (
            categories.map(category => (
              <div
                key={category._id}
                className={`category-item ${selectedCategory?._id === category._id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
                style={{ borderLeftColor: category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">{getTasksForCategory(category._id).length}</span>
              </div>
            ))
          )}
        </div>

        {/* Tasks Display */}
        <div className="categories-tasks">
          {selectedCategory && (
            <>
              <div className="category-header" style={{ borderBottomColor: selectedCategory.color }}>
                <div className="category-title">
                  <span className="category-icon-large">{selectedCategory.icon}</span>
                  <h3>{selectedCategory.name}</h3>
                  {selectedCategory.description && <p>{selectedCategory.description}</p>}
                </div>
                {(user?._id === selectedCategory.createdBy?._id || isAdmin) && !selectedCategory.isDefault && (
                  <div className="category-actions">
                    <button onClick={() => handleEditCategory(selectedCategory)} className="edit-category-btn">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteCategory(selectedCategory._id)} className="delete-category-btn">
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="tasks-list">
                {getTasksForCategory(selectedCategory._id).length === 0 ? (
                  <div className="empty-tasks">
                    <p>No tasks in this category</p>
                    <Link to="/add" className="create-task-link">Create a task</Link>
                  </div>
                ) : (
                  getTasksForCategory(selectedCategory._id).map(task => (
                    <div key={task._id} className="task-card">
                      <Link to={`/task/${task._id}`} className="task-title">
                        {task.title}
                      </Link>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                        <span className={`status-badge ${task.status}`}>{task.status}</span>
                        <span className="due-date">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                      </div>
                      <div className="task-actions">
                        <Link to={`/edit/${task._id}`}>Edit</Link>
                        <button onClick={async () => {
                          try {
                            await taskService.completeTask(task._id);
                            toast.success('Task completed!');
                            fetchData();
                          } catch (error) {
                            toast.error('Failed to complete task');
                          }
                        }}>Complete</button>
                        {(!task.isAdminAssigned || isAdmin) && (
                          <button onClick={async () => {
                            if (window.confirm('Delete this task?')) {
                              try {
                                await taskService.deleteTask(task._id);
                                toast.success('Task deleted');
                                fetchData();
                              } catch (error) {
                                toast.error('Failed to delete task');
                              }
                            }
                          }}>Delete</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Category</h3>
            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${editForm.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditForm({...editForm, color})}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-picker">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${editForm.icon === icon ? 'selected' : ''}`}
                        onClick={() => setEditForm({...editForm, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingCategory(null)}>Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
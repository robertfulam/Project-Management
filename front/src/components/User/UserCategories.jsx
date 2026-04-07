import React, { useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import CreateCategory from './CreateCategory';
import './UserCategories.css';

const UserCategories = ({ categories, onUpdate }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');
  const [editIcon, setEditIcon] = useState('📁');
  const user = authService.getUser();

  const colorOptions = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec489a', '#14b8a6', '#f97316', '#3b82f6', '#6b7280'
  ];

  const iconOptions = ['📁', '💼', '🎨', '💻', '📚', '🏠', '💪', '🎯', '⭐', '🔥'];

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All tasks in this category will also be deleted.')) {
      try {
        await categoryService.deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        onUpdate();
      } catch (error) {
        toast.error(error.message || 'Failed to delete category');
      }
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      await categoryService.updateCategory(categoryId, {
        name: editName,
        description: editDescription,
        color: editColor,
        icon: editIcon
      });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to update category');
    }
  };

  // Filter categories: user's own categories + default categories
  const userOwnCategories = categories.filter(cat => cat.createdBy?._id === user?._id);
  const defaultCategories = categories.filter(cat => cat.isDefault || (cat.createdBy?._id !== user?._id && cat.isDefault));

  return (
    <div className="user-categories">
      <div className="categories-header">
        <h2>
          <span className="header-icon">📁</span>
          My Categories
        </h2>
        <CreateCategory onCategoryCreated={onUpdate} />
      </div>

      <div className="categories-content">
        {/* User's Own Categories Section */}
        {userOwnCategories.length > 0 && (
          <div className="category-section">
            <div className="section-header">
              <h3>
                <span className="section-icon">👤</span>
                My Custom Categories
              </h3>
              <span className="section-count">{userOwnCategories.length} categories</span>
            </div>
            <div className="categories-grid">
              {userOwnCategories.map(category => (
                <div key={category._id} className="category-card" style={{ borderTopColor: category.color || '#6366f1' }}>
                  {editingCategory === category._id ? (
                    <div className="edit-form">
                      <div className="edit-header">
                        <span className="edit-icon">✏️</span>
                        <h4>Edit Category</h4>
                      </div>
                      <div className="edit-field">
                        <label>Category Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Category name"
                          className="edit-input"
                        />
                      </div>
                      <div className="edit-field">
                        <label>Description</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                          rows="2"
                          className="edit-textarea"
                        />
                      </div>
                      <div className="edit-field">
                        <label>Color</label>
                        <div className="color-picker-small">
                          {colorOptions.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={`color-option-small ${editColor === color ? 'selected' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="edit-field">
                        <label>Icon</label>
                        <div className="icon-picker-small">
                          {iconOptions.map(icon => (
                            <button
                              key={icon}
                              type="button"
                              className={`icon-option-small ${editIcon === icon ? 'selected' : ''}`}
                              onClick={() => setEditIcon(icon)}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="edit-actions">
                        <button onClick={() => handleUpdateCategory(category._id)} className="save-btn">
                          💾 Save
                        </button>
                        <button onClick={() => setEditingCategory(null)} className="cancel-btn">
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="category-icon-wrapper" style={{ backgroundColor: `${category.color || '#6366f1'}15` }}>
                        <span className="category-icon" style={{ color: category.color || '#6366f1' }}>
                          {category.icon || '📁'}
                        </span>
                      </div>
                      <div className="category-info">
                        <h3>{category.name}</h3>
                        {category.description && <p>{category.description}</p>}
                        <div className="category-meta">
                          <span className="meta-badge">
                            <span className="meta-icon">📅</span>
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </span>
                          <span className="meta-badge">
                            <span className="meta-icon">📋</span>
                            Owned by you
                          </span>
                        </div>
                      </div>
                      <div className="category-actions">
                        <button 
                          onClick={() => {
                            setEditingCategory(category._id);
                            setEditName(category.name);
                            setEditDescription(category.description || '');
                            setEditColor(category.color || '#6366f1');
                            setEditIcon(category.icon || '📁');
                          }} 
                          className="edit-btn"
                          title="Edit Category"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category._id)} 
                          className="delete-btn"
                          title="Delete Category"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Categories Section */}
        {defaultCategories.length > 0 && (
          <div className="category-section">
            <div className="section-header">
              <h3>
                <span className="section-icon">🌟</span>
                Default Categories
              </h3>
              <span className="section-count">{defaultCategories.length} categories</span>
            </div>
            <div className="categories-grid">
              {defaultCategories.map(category => (
                <div key={category._id} className="category-card default" style={{ borderTopColor: category.color || '#6366f1' }}>
                  <div className="category-icon-wrapper" style={{ backgroundColor: `${category.color || '#6366f1'}10` }}>
                    <span className="category-icon" style={{ color: category.color || '#6366f1' }}>
                      {category.icon || '📁'}
                    </span>
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    {category.description && <p>{category.description}</p>}
                    <div className="category-meta">
                      <span className="meta-badge">
                        <span className="meta-icon">🏷️</span>
                        Default Category
                      </span>
                      <span className="meta-badge">
                        <span className="meta-icon">👥</span>
                        Available to all users
                      </span>
                    </div>
                  </div>
                  <div className="category-actions">
                    <span className="default-badge">System</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {userOwnCategories.length === 0 && defaultCategories.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No Categories Yet</h3>
            <p>Create your first category to organize your tasks</p>
            <CreateCategory onCategoryCreated={onUpdate} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCategories;
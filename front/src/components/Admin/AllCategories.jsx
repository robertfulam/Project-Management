import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './AllCategories.css';

const AllCategories = ({ onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '📁'
  });
  const currentUser = authService.getUser();

  const colorOptions = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec489a', '#14b8a6', '#f97316', '#3b82f6', '#6b7280'
  ];

  const iconOptions = ['📁', '💼', '🎨', '💻', '📚', '🏠', '💪', '🎯', '⭐', '🔥'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      const categoriesArray = Array.isArray(data) ? data : data?.categories || data?.data || [];
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? All tasks in this category will also be deleted.`)) {
      try {
        await categoryService.deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        fetchCategories();
        if (onUpdate) onUpdate();
      } catch (error) {
        toast.error(error.message || 'Failed to delete category');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name || '',
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
      fetchCategories();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to update category');
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (!cat) return false;
    return cat.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="all-categories">
      <div className="categories-header">
        <h2>All Categories</h2>
        <div className="search-input">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="categories-grid">
        {filteredCategories.length === 0 ? (
          <div className="empty-state">No categories found</div>
        ) : (
          filteredCategories.map(category => (
            <div key={category._id} className="category-card" style={{ borderTopColor: category.color || '#6366f1' }}>
              {editingCategory?._id === category._id ? (
                <div className="edit-form">
                  <div className="edit-header">
                    <span className="edit-icon">✏️</span>
                    <h4>Edit Category</h4>
                  </div>
                  <div className="edit-field">
                    <label>Category Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows="2"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Color</label>
                    <div className="color-picker-small">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option-small ${editForm.color === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditForm({...editForm, color})}
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
                          className={`icon-option-small ${editForm.icon === icon ? 'selected' : ''}`}
                          onClick={() => setEditForm({...editForm, icon})}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button onClick={handleUpdateCategory} className="save-btn">Save</button>
                    <button onClick={() => setEditingCategory(null)} className="cancel-btn">Cancel</button>
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
                      <div className="owner-info">
                        <span className="owner-label">Created by:</span>
                        <span className="owner-name">{category.createdBy?.name || 'System'}</span>
                        <span className="owner-email">{category.createdBy?.email}</span>
                      </div>
                      <div className="category-date">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="category-actions">
                    {/* Allow edit only if owner or admin */}
                    {(category.createdBy?._id === currentUser?._id || currentUser?.role === 'admin') && (
                      <button onClick={() => handleEditCategory(category)} className="edit-btn">
                        ✏️ Edit
                      </button>
                    )}
                    {/* Allow delete only if not default and owner or admin */}
                    {!category.isDefault && (category.createdBy?._id === currentUser?._id || currentUser?.role === 'admin') && (
                      <button onClick={() => handleDeleteCategory(category._id, category.name)} className="delete-btn">
                        🗑️ Delete
                      </button>
                    )}
                    {category.isDefault && (
                      <span className="default-badge">Default Category</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllCategories;
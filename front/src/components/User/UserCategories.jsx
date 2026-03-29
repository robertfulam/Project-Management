import React, { useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import CreateCategory from './CreateCategory';
import './UserCategories.css';

const UserCategories = ({ categories, onUpdate }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const user = authService.getUser();

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All tasks in this category will also be deleted.')) {
      try {
        await categoryService.deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      await categoryService.updateCategory(categoryId, {
        name: editName,
        description: editDescription
      });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const userCategories = categories.filter(cat => cat.createdBy?._id === user?._id || cat.isDefault);

  return (
    <div className="user-categories">
      <div className="categories-header">
        <h2>My Categories</h2>
        <CreateCategory onCategoryCreated={onUpdate} />
      </div>

      <div className="categories-grid">
        {userCategories.length === 0 ? (
          <div className="empty-state">No categories yet. Create your first category!</div>
        ) : (
          userCategories.map(category => (
            <div key={category._id} className="category-card">
              {editingCategory === category._id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Category name"
                    className="edit-input"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows="2"
                    className="edit-textarea"
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleUpdateCategory(category._id)} className="save-btn">Save</button>
                    <button onClick={() => setEditingCategory(null)} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{category.name}</h3>
                  {category.description && <p>{category.description}</p>}
                  <div className="category-meta">
                    <span>Created by: {category.createdBy?.name || 'System'}</span>
                    {category.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  {(!category.isDefault || category.createdBy?._id === user?._id) && (
                    <div className="category-actions">
                      <button onClick={() => {
                        setEditingCategory(category._id);
                        setEditName(category.name);
                        setEditDescription(category.description || '');
                      }} className="edit-btn">Edit</button>
                      {!category.isDefault && (
                        <button onClick={() => handleDeleteCategory(category._id)} className="delete-btn">Delete</button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserCategories;
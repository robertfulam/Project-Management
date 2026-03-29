import React, { useState } from 'react';
import { categoryService } from '../../services/categoryService';
import toast from 'react-hot-toast';
import './CreateCategory.css';

const CreateCategory = ({ onCategoryCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    { value: '#6366f1', name: 'Purple' },
    { value: '#10b981', name: 'Green' },
    { value: '#f59e0b', name: 'Amber' },
    { value: '#ef4444', name: 'Red' },
    { value: '#8b5cf6', name: 'Violet' },
    { value: '#ec489a', name: 'Pink' },
    { value: '#14b8a6', name: 'Teal' },
    { value: '#f97316', name: 'Orange' },
    { value: '#3b82f6', name: 'Blue' },
    { value: '#6b7280', name: 'Gray' },
  ];

  const iconOptions = [
    '📁', '💼', '🎨', '💻', '📚', '🏠', '💪', '🎯', '⭐', '🔥',
    '❤️', '💡', '🎓', '🏆', '🎵', '📷', '✈️', '🍔', '⚽', '🎮'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      await categoryService.createCategory({
        name: categoryName,
        description: description,
        color: selectedColor,
        icon: selectedIcon
      });
      
      toast.success('Category created successfully!');
      
      // Reset form
      setCategoryName('');
      setDescription('');
      setSelectedColor('#6366f1');
      setSelectedIcon('📁');
      setShowModal(false);
      
      if (onCategoryCreated) {
        onCategoryCreated();
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(error.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setShowModal(false);
      // Reset form
      setCategoryName('');
      setDescription('');
      setSelectedColor('#6366f1');
      setSelectedIcon('📁');
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        className="create-category-btn"
        disabled={loading}
      >
        <span className="btn-icon">+</span>
        New Category
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <span className="modal-icon">✨</span>
                Create New Category
              </h3>
              <button 
                type="button" 
                className="modal-close" 
                onClick={handleClose}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name (e.g., Work, Personal, Urgent)"
                  required
                  disabled={loading}
                  autoFocus
                  className="category-name-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this category is for..."
                  rows="3"
                  disabled={loading}
                  className="category-description-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Choose Color</label>
                  <div className="color-picker">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                        title={color.name}
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Choose Icon</label>
                  <div className="icon-picker">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                        onClick={() => setSelectedIcon(icon)}
                        disabled={loading}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="preview-section">
                <label>Preview</label>
                <div className="category-preview" style={{ backgroundColor: `${selectedColor}10`, borderColor: selectedColor }}>
                  <span className="preview-icon" style={{ color: selectedColor }}>{selectedIcon}</span>
                  <div className="preview-info">
                    <div className="preview-name" style={{ color: selectedColor }}>
                      {categoryName || 'Category Name'}
                    </div>
                    <div className="preview-desc">
                      {description || 'Category description will appear here'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleClose} 
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading || !categoryName.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      Create Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCategory;
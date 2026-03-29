import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiRefreshCw, FiCheck, FiImage, FiZap, FiHeart, FiTrash2, FiEye } from 'react-icons/fi';
import './BackgroundSelector.css';

const BackgroundSelector = ({ onBackgroundChange, currentBackground }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedBackgrounds, setSavedBackgrounds] = useState([]);
  const [recentBackgrounds, setRecentBackgrounds] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const panelRef = useRef(null);

  // Predefined background images with more variety
  const backgroundOptions = {
    nature: [
      { id: 1, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', name: 'Mountain Lake', author: 'Unsplash', tags: ['mountain', 'lake', 'calm'] },
      { id: 2, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', name: 'Forest Mist', author: 'Unsplash', tags: ['forest', 'mist', 'peaceful'] },
      { id: 3, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', name: 'Beach Sunset', author: 'Unsplash', tags: ['beach', 'sunset', 'ocean'] },
      { id: 4, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', name: 'Mountain Peak', author: 'Unsplash', tags: ['mountain', 'peak', 'adventure'] },
      { id: 5, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', name: 'Sunlit Forest', author: 'Unsplash', tags: ['forest', 'sunlight', 'magical'] },
      { id: 6, url: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800', name: 'Starry Night', author: 'Unsplash', tags: ['stars', 'night', 'sky'] },
    ],
    tech: [
      { id: 7, url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', name: 'Digital Network', author: 'Unsplash', tags: ['network', 'digital', 'connection'] },
      { id: 8, url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', name: 'Code Pattern', author: 'Unsplash', tags: ['code', 'pattern', 'programming'] },
      { id: 9, url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', name: 'Code Editor', author: 'Unsplash', tags: ['code', 'editor', 'development'] },
      { id: 10, url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', name: 'Modern Office', author: 'Unsplash', tags: ['office', 'modern', 'workspace'] },
      { id: 11, url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', name: 'Server Room', author: 'Unsplash', tags: ['server', 'data', 'technology'] },
      { id: 12, url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', name: 'Binary Code', author: 'Unsplash', tags: ['binary', 'code', 'digital'] },
    ],
    abstract: [
      { id: 13, url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800', name: 'Abstract Waves', author: 'Unsplash', tags: ['waves', 'abstract', 'flow'] },
      { id: 14, url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800', name: 'Color Flow', author: 'Unsplash', tags: ['color', 'flow', 'vibrant'] },
      { id: 15, url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800', name: 'Gradient Blend', author: 'Unsplash', tags: ['gradient', 'blend', 'smooth'] },
      { id: 16, url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800', name: 'Geometric', author: 'Unsplash', tags: ['geometric', 'shapes', 'modern'] },
      { id: 17, url: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800', name: 'Neon Flow', author: 'Unsplash', tags: ['neon', 'flow', 'dynamic'] },
      { id: 18, url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800', name: 'Digital Art', author: 'Unsplash', tags: ['digital', 'art', 'creative'] },
    ],
    workspace: [
      { id: 19, url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800', name: 'Minimal Desk', author: 'Unsplash', tags: ['desk', 'minimal', 'clean'] },
      { id: 20, url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800', name: 'Home Office', author: 'Unsplash', tags: ['home', 'office', 'cozy'] },
      { id: 21, url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', name: 'Collaboration', author: 'Unsplash', tags: ['collaboration', 'team', 'meeting'] },
      { id: 22, url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', name: 'Tech Workspace', author: 'Unsplash', tags: ['tech', 'workspace', 'modern'] },
      { id: 23, url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', name: 'Modern Desk', author: 'Unsplash', tags: ['desk', 'modern', 'clean'] },
      { id: 24, url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800', name: 'Creative Space', author: 'Unsplash', tags: ['creative', 'space', 'art'] },
    ]
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🎨', count: 24 },
    { id: 'nature', name: 'Nature', icon: '🌿', count: 6 },
    { id: 'tech', name: 'Technology', icon: '💻', count: 6 },
    { id: 'abstract', name: 'Abstract', icon: '🎭', count: 6 },
    { id: 'workspace', name: 'Workspace', icon: '🏢', count: 6 }
  ];

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedBackgrounds');
    if (saved) setSavedBackgrounds(JSON.parse(saved));
    
    const recent = localStorage.getItem('recentBackgrounds');
    if (recent) setRecentBackgrounds(JSON.parse(recent));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('savedBackgrounds', JSON.stringify(savedBackgrounds));
  }, [savedBackgrounds]);

  useEffect(() => {
    localStorage.setItem('recentBackgrounds', JSON.stringify(recentBackgrounds.slice(0, 5)));
  }, [recentBackgrounds]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && !event.target.closest('.background-trigger')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getAllBackgrounds = () => {
    let backgrounds = selectedCategory === 'all' 
      ? Object.values(backgroundOptions).flat()
      : backgroundOptions[selectedCategory] || [];
    
    if (searchTerm) {
      backgrounds = backgrounds.filter(bg => 
        bg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bg.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return backgrounds;
  };

  const addToRecent = (url) => {
    setRecentBackgrounds(prev => {
      const filtered = prev.filter(u => u !== url);
      return [url, ...filtered].slice(0, 5);
    });
  };

  const handleSelectBackground = (url) => {
    onBackgroundChange(url);
    addToRecent(url);
    setIsOpen(false);
  };

  const toggleSaveBackground = (url) => {
    if (savedBackgrounds.includes(url)) {
      setSavedBackgrounds(prev => prev.filter(b => b !== url));
    } else {
      setSavedBackgrounds(prev => [...prev, url]);
    }
  };

  const generateAIBackground = async () => {
    setIsGenerating(true);
    try {
      // AI-inspired image generation
      const prompts = [
        'nature', 'mountain', 'ocean', 'forest', 'city', 'space', 
        'abstract', 'gradient', 'minimal', 'tech', 'art', 'creative'
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      const randomId = Math.floor(Math.random() * 1000);
      
      // Use multiple image sources for variety
      const imageSources = [
        `https://picsum.photos/id/${randomId}/1920/1080`,
        `https://source.unsplash.com/featured/1920x1080?${randomPrompt}`,
        `https://picsum.photos/seed/${Date.now()}/1920/1080`
      ];
      
      const selectedSource = imageSources[Math.floor(Math.random() * imageSources.length)];
      
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      onBackgroundChange(selectedSource);
      addToRecent(selectedSource);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to generate AI background:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openPreview = (url) => {
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const backgrounds = getAllBackgrounds();

  return (
    <div className="background-selector-wrapper">
      <button 
        className="background-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Background"
      >
        <FiImage />
      </button>

      {isOpen && (
        <>
          <div className="background-overlay" onClick={() => setIsOpen(false)} />
          <div className="background-panel" ref={panelRef}>
            <div className="background-header">
              <h3>
                <FiImage />
                Background Gallery
              </h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <FiX />
              </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search backgrounds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">{cat.count}</span>
                </button>
              ))}
            </div>

            {/* AI Generate Button */}
            <button 
              className="ai-generate-btn"
              onClick={generateAIBackground}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <FiRefreshCw className="spinning" />
                  Generating AI Background...
                </>
              ) : (
                <>
                  <FiZap />
                  Generate AI Background
                </>
              )}
            </button>

            {/* Recently Used */}
            {recentBackgrounds.length > 0 && (
              <div className="recent-section">
                <h4>Recently Used</h4>
                <div className="recent-grid">
                  {recentBackgrounds.map((url, index) => (
                    <div
                      key={index}
                      className={`recent-option ${currentBackground === url ? 'selected' : ''}`}
                      onClick={() => handleSelectBackground(url)}
                    >
                      <img src={url} alt="Recent" />
                      <div className="overlay">
                        <FiCheck />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Background Grid */}
            <div className="background-grid">
              {backgrounds.length === 0 ? (
                <div className="no-results">
                  <p>No backgrounds found</p>
                </div>
              ) : (
                backgrounds.map(bg => (
                  <div
                    key={bg.id}
                    className={`background-option ${currentBackground === bg.url ? 'selected' : ''}`}
                  >
                    <img src={bg.url} alt={bg.name} loading="lazy" />
                    <div className="overlay">
                      <div className="bg-info">
                        <span className="bg-name">{bg.name}</span>
                        <span className="bg-author">{bg.author}</span>
                      </div>
                      <div className="action-buttons">
                        <button 
                          onClick={() => openPreview(bg.url)}
                          className="preview-btn"
                          title="Preview"
                        >
                          <FiEye />
                        </button>
                        <button 
                          onClick={() => toggleSaveBackground(bg.url)}
                          className={`save-btn ${savedBackgrounds.includes(bg.url) ? 'saved' : ''}`}
                          title={savedBackgrounds.includes(bg.url) ? 'Remove from saved' : 'Save background'}
                        >
                          <FiHeart />
                        </button>
                        <button 
                          onClick={() => handleSelectBackground(bg.url)}
                          className="select-btn"
                          title="Apply background"
                        >
                          <FiCheck />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Saved Backgrounds Section */}
            {savedBackgrounds.length > 0 && (
              <div className="saved-section">
                <h4>
                  <FiHeart /> My Saved Backgrounds
                </h4>
                <div className="saved-grid">
                  {savedBackgrounds.map((url, index) => (
                    <div
                      key={index}
                      className={`saved-option ${currentBackground === url ? 'selected' : ''}`}
                    >
                      <img src={url} alt="Saved" />
                      <div className="overlay">
                        <button onClick={() => handleSelectBackground(url)} className="select-btn">
                          <FiCheck />
                        </button>
                        <button onClick={() => toggleSaveBackground(url)} className="remove-btn">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Button */}
            <button 
              className="reset-btn"
              onClick={() => {
                onBackgroundChange('');
                setIsOpen(false);
              }}
            >
              Reset to Default Background
            </button>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" />
            <div className="preview-actions">
              <button onClick={() => handleSelectBackground(previewImage)} className="apply-btn">
                Apply Background
              </button>
              <button onClick={closePreview} className="close-preview-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
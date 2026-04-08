import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';
import './AIAssistant.css';

const AIAssistant = ({ selectedTask, onTaskSelect, tasksCompletedToday }) => {
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(localStorage.getItem('aiBackground') || '');
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  
  const chatEndRef = useRef(null);
  
  const backgroundOptions = [
    { id: 1, url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', name: 'Tech' },
    { id: 2, url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', name: 'Nature' },
    { id: 3, url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', name: 'Code' },
    { id: 4, url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800', name: 'Work' },
    { id: 5, url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', name: 'Office' },
  ];

  useEffect(() => {
    if (selectedTask) {
      setAiInput(`I'm working on "${selectedTask.title}". Let's brainstorm on it`);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiResponse, aiLoading]);

  const generateAIBackground = async () => {
    try {
      const randomId = Math.floor(Math.random() * 1000);
      const imageUrl = `https://picsum.photos/id/${randomId}/1920/1080`;
      setBackgroundImage(imageUrl);
      localStorage.setItem('aiBackground', imageUrl);
      toast.success('AI Background generated!');
      setShowBackgroundSelector(false);
    } catch (error) {
      toast.error('Failed to generate background');
    }
  };

  const handleAIAction = async (action) => {
    setShowActions(false);
    
    if (!selectedTask && action !== 'chat') {
      toast.error('Please select a task first');
      return;
    }
    
    setAiLoading(true);
    setAiResponse("");
    
    try {
      let response;
      switch(action) {
        case 'summarize':
          response = await aiService.summarizeTask(selectedTask?._id);
          setAiResponse(response.response || "Task summarized successfully!");
          break;
        case 'monetize':
          response = await aiService.monetizeTask(selectedTask?._id);
          setAiResponse(response.response || "Monetization advice generated!");
          break;
        case 'upload':
          document.getElementById('file-upload').click();
          break;
        default:
          if (aiInput) {
            response = await aiService.chat(aiInput, 'chat', selectedTask?._id);
            setAiResponse(response.response);
            setAiInput("");
          }
      }
    } catch (error) {
      console.error('AI Error:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
      toast.error(error.message || 'AI service error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAiLoading(true);
    setAiResponse("Analyzing your file...");
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:9000/api/ai/analyze-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      setAiResponse(data.summary || "File analyzed successfully!");
    } catch (error) {
      console.error('File upload error:', error);
      setAiResponse("Failed to analyze file. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && aiInput && !aiLoading) {
      e.preventDefault();
      handleAIAction('chat');
    }
  };

  return (
    <div className="ai-assistant" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}>
      <div className="ai-header">
        <div className="tasks-completed">
          🎉 Tasks Completed Today: {tasksCompletedToday} 👏
        </div>
        <button 
          className="bg-selector-btn" 
          onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
          title="Change Background"
        >
          🎨
        </button>
      </div>
      
      {showBackgroundSelector && (
        <div className="background-selector">
          <div className="background-options">
            {backgroundOptions.map(bg => (
              <div 
                key={bg.id} 
                className="bg-option"
                style={{ backgroundImage: `url(${bg.url})` }}
                onClick={() => {
                  setBackgroundImage(bg.url);
                  localStorage.setItem('aiBackground', bg.url);
                  setShowBackgroundSelector(false);
                }}
              >
                <span>{bg.name}</span>
              </div>
            ))}
            <button onClick={generateAIBackground} className="generate-ai-bg">
              🤖 Generate AI Background
            </button>
          </div>
        </div>
      )}
      
      <div className="chat-area">
        <div className="messages">
          {aiResponse ? (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">{aiResponse}</div>
            </div>
          ) : (
            <div className="placeholder-text">
              {selectedTask ? (
                <>
                  <div className="task-quote">💭 "{selectedTask.title}"</div>
                  <p>Click the + button for AI assistance</p>
                </>
              ) : (
                <p>Select a task to get AI assistance</p>
              )}
            </div>
          )}
          {aiLoading && (
            <div className="message assistant loading">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="input-area">
          <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".txt,.pdf,.doc,.docx,image/*"
          />
          
          <div className="plus-container">
            <button 
              className="plus-btn" 
              onClick={() => setShowActions(!showActions)}
              disabled={!selectedTask}
            >
              +
            </button>
            {showActions && (
              <div className="actions-dropdown">
                <button onClick={() => handleAIAction("summarize")}>📝 Summarize Task</button>
                <button onClick={() => handleAIAction("monetize")}>💰 Monetize Task</button>
                <button onClick={() => handleAIAction("upload")}>📎 Upload File</button>
              </div>
            )}
          </div>
          
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedTask ? "Ask AI about this task..." : "Select a task first..."}
            disabled={!selectedTask || aiLoading}
          />
          
          <button 
            className="send-btn" 
            onClick={() => handleAIAction('chat')}
            disabled={!selectedTask || aiLoading || !aiInput}
          >
            {aiLoading ? '...' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
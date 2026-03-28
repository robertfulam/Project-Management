import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { dashboardService } from "../services/dashboardService";
import { authService } from "../services/authService";
import { aiService } from "../services/aiService";
import toast from "react-hot-toast";
import "../components/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Original Task Selection State
  const [priority, setPriority] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [category, setCategory] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // AI State
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [taskPath, setTaskPath] = useState("AI Assistant");

  // Task categories from database
  const [taskCategories, setTaskCategories] = useState({});
  const [urgencyLevels, setUrgencyLevels] = useState(["Very Urgent", "Urgent", "Moderate", "Not Urgent"]);
  const [priorities, setPriorities] = useState(["Critical", "High", "Medium", "Low"]);

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      organizeTasksByHierarchy();
    }
  }, [tasks]);

  const fetchUserData = async () => {
    const userData = authService.getUser();
    setUser(userData);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksData, statsData] = await Promise.all([
        taskService.getUserTasks(),
        dashboardService.getStats()
      ]);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const organizeTasksByHierarchy = () => {
    const organized = {};
    
    priorities.forEach(p => {
      organized[p] = {};
      urgencyLevels.forEach(u => {
        organized[p][u] = {};
      });
    });
    
    tasks.forEach(task => {
      const taskPriority = task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium";
      const taskUrgency = task.urgency ? task.urgency.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Moderate";
      const taskCategory = task.category?.name || "Uncategorized";
      
      if (organized[taskPriority] && organized[taskPriority][taskUrgency]) {
        if (!organized[taskPriority][taskUrgency][taskCategory]) {
          organized[taskPriority][taskUrgency][taskCategory] = [];
        }
        organized[taskPriority][taskUrgency][taskCategory].push(task);
      }
    });
    
    setTaskCategories(organized);
  };

  const handleTaskClick = (t) => {
    setSelectedTask(t);
    setAiInput(`I'm working on "${t.title}" today`);
    setTaskPath(`${priority} - ${urgency} - ${category} - ${t.title}`);
    setPriority(null);
    setUrgency(null);
    setCategory(null);
    setAiResponse("");
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
          toast.info('File upload feature coming soon!');
          setAiResponse("File upload functionality will be available soon. You'll be able to upload videos, PDFs, audio files, and text for AI assessment.");
          break;
        default:
          if (aiInput) {
            response = await aiService.chat(aiInput, 'chat');
            setAiResponse(response.response);
            setAiInput("");
          }
      }
    } catch (error) {
      console.error('AI Error:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
      toast.error('AI service error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && aiInput) {
      e.preventDefault();
      handleAIAction('chat');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  const completionRate = stats?.dashboard?.totalTasks > 0 
    ? ((stats.dashboard.completedTasks / stats.dashboard.totalTasks) * 100).toFixed(1)
    : 0;

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your task overview for today</p>
        </div>
        <button onClick={() => navigate('/add')} className="create-task-btn">
          + Create New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <div className="stat-value">{stats?.dashboard?.totalTasks || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed</h3>
            <div className="stat-value">{stats?.dashboard?.completedTasks || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <div className="stat-value">{stats?.dashboard?.inProgressTasks || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Completion Rate</h3>
            <div className="stat-value">{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* LEFT SIDE - Original Task Selection Design */}
        <div className="left-column">
          <h2>Task Explorer</h2>
          
          {priorities.map((p) => (
            <div className="priority-item" key={p}>
              <button
                className={`priority-main-btn ${priority === p ? 'active' : ''}`}
                onClick={() => {
                  setPriority(p);
                  setUrgency(null);
                  setCategory(null);
                  setSelectedTask(null);
                }}
              >
                {p}
              </button>

              {/* FLOATING MENU */}
              {priority === p && (
                <div className="floating-wrapper">
                  {/* URGENCY COLUMN */}
                  <div className="float-column">
                    <h4>Urgency</h4>
                    {urgencyLevels.map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          setUrgency(u);
                          setCategory(null);
                          setSelectedTask(null);
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>

                  {/* CATEGORY COLUMN */}
                  {urgency && taskCategories[p]?.[urgency] && (
                    <div className="float-column">
                      <h4>Category</h4>
                      {Object.keys(taskCategories[p][urgency]).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCategory(c);
                            setSelectedTask(null);
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* TASKS COLUMN */}
                  {category && taskCategories[p]?.[urgency]?.[category] && (
                    <div className="float-column">
                      <h4>Tasks</h4>
                      {taskCategories[p][urgency][category].map((t) => (
                        <button key={t._id} onClick={() => handleTaskClick(t)}>
                          {t.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - AI Assistant */}
        <div className="right-column">
          {/* Persistent AI Header with Task Path */}
          <div className="ai-header">{taskPath}</div>

          {/* AI Response Area */}
          <div className="chat-box">
            {aiResponse ? (
              <div className="ai-response">
                <div className="response-content">{aiResponse}</div>
                {aiLoading && <div className="typing-indicator">AI is thinking...</div>}
              </div>
            ) : (
              <div className="placeholder-text">
                {selectedTask 
                  ? `Selected: "${selectedTask.title}". Click the + button for AI assistance.`
                  : "Select a task from the left panel to get AI assistance"}
              </div>
            )}
          </div>

          {/* Input Area with Action Buttons */}
          <div className="input-area">
            {/* PLUS BUTTON FOR ACTIONS */}
            <div className="plus-container">
              <button 
                className="plus-btn" 
                onClick={() => setShowActions(!showActions)}
                disabled={!selectedTask}
                title={!selectedTask ? "Select a task first" : "AI Actions"}
              >
                +
              </button>

              {showActions && (
                <div className="actions-dropdown">
                  <button onClick={() => handleAIAction("summarize")}>
                    📝 Summarize Task
                  </button>
                  <button onClick={() => handleAIAction("monetize")}>
                    💰 Monetize Task
                  </button>
                  <button onClick={() => handleAIAction("upload")}>
                    📎 Upload for AI Assessment
                  </button>
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
    </div>
  );
};

export default Dashboard;
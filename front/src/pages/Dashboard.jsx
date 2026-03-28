import React, { useState, useEffect, useRef } from "react";
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
  
  // Task Selection State (5 levels: Priority → Category → Urgency → Difficulty → Task)
  const [priority, setPriority] = useState(null);
  const [category, setCategory] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [taskPath, setTaskPath] = useState("AI Assistant");
  
  // AI State
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  // Refs for dropdown positioning
  const dropdownRef = useRef(null);
  const activeButtonRef = useRef(null);

  // Task categories from database
  const [taskCategories, setTaskCategories] = useState({});
  const urgencyLevels = ["Very Urgent", "Urgent", "Moderate", "Not Urgent"];
  const difficultyLevels = ["Easy", "Medium", "Hard", "Expert"];
  const priorities = ["Critical", "High", "Medium", "Low"];

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      organizeTasksByHierarchy();
    }
  }, [tasks]);

  useEffect(() => {
    // Update dropdown position when priority changes
    if (priority && activeButtonRef.current) {
      updateDropdownPosition();
    }
  }, [priority, category, urgency, difficulty]);

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
    
    // Initialize structure: Priority → Category → Urgency → Difficulty → Tasks
    priorities.forEach(p => {
      organized[p] = {};
      // Categories will be added dynamically as we process tasks
    });
    
    tasks.forEach(task => {
      const taskPriority = task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium";
      const taskCategory = task.category?.name || "Uncategorized";
      const taskUrgency = task.urgency ? task.urgency.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Moderate";
      const taskDifficulty = task.difficulty ? task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1) : "Medium";
      
      // Initialize priority if not exists
      if (!organized[taskPriority]) {
        organized[taskPriority] = {};
      }
      
      // Initialize category if not exists
      if (!organized[taskPriority][taskCategory]) {
        organized[taskPriority][taskCategory] = {};
      }
      
      // Initialize urgency if not exists
      if (!organized[taskPriority][taskCategory][taskUrgency]) {
        organized[taskPriority][taskCategory][taskUrgency] = {};
      }
      
      // Initialize difficulty if not exists
      if (!organized[taskPriority][taskCategory][taskUrgency][taskDifficulty]) {
        organized[taskPriority][taskCategory][taskUrgency][taskDifficulty] = [];
      }
      
      // Add task to the list
      organized[taskPriority][taskCategory][taskUrgency][taskDifficulty].push(task);
    });
    
    setTaskCategories(organized);
  };

  const updateDropdownPosition = () => {
    if (activeButtonRef.current) {
      const rect = activeButtonRef.current.getBoundingClientRect();
      let top = rect.top;
      let left = rect.right + 10; // Position to the RIGHT of the button
      
      // Calculate dropdown width based on number of active columns
      let activeColumns = 1; // At least priority is selected
      if (priority) activeColumns++;
      if (category) activeColumns++;
      if (urgency) activeColumns++;
      if (difficulty) activeColumns++;
      
      const dropdownWidth = activeColumns * 260; // Each column ~260px
      
      // Check if dropdown would go off-screen to the right
      if (left + dropdownWidth > window.innerWidth) {
        left = rect.left - dropdownWidth - 10; // Position to the LEFT if no space on right
      }
      
      // Check if dropdown would go off-screen to the left
      if (left < 10) {
        left = 10;
      }
      
      // Check if dropdown would go off-screen at the bottom
      const dropdownHeight = 450;
      if (top + dropdownHeight > window.innerHeight) {
        top = window.innerHeight - dropdownHeight - 10;
      }
      
      // Check if dropdown would go off-screen at the top
      if (top < 10) {
        top = 10;
      }
      
      setDropdownPosition({ top, left });
    }
  };

  const handlePriorityClick = (p, buttonElement) => {
    if (priority === p) {
      // Close dropdown if same priority clicked
      setPriority(null);
      setCategory(null);
      setUrgency(null);
      setDifficulty(null);
      activeButtonRef.current = null;
    } else {
      setPriority(p);
      setCategory(null);
      setUrgency(null);
      setDifficulty(null);
      setSelectedTask(null);
      activeButtonRef.current = buttonElement;
      // Update position after state update
      setTimeout(updateDropdownPosition, 0);
    }
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setUrgency(null);
    setDifficulty(null);
    setSelectedTask(null);
    setTimeout(updateDropdownPosition, 0);
  };

  const handleUrgencyClick = (urg) => {
    setUrgency(urg);
    setDifficulty(null);
    setSelectedTask(null);
    setTimeout(updateDropdownPosition, 0);
  };

  const handleDifficultyClick = (diff) => {
    setDifficulty(diff);
    setSelectedTask(null);
    setTimeout(updateDropdownPosition, 0);
  };

  const handleTaskClick = (t) => {
    setSelectedTask(t);
    // Set the message in the AI input area (Original style)
    setAiInput(`I'm working on this "${t.title}" today`);
    // Save persistent path (Original style)
    setTaskPath(`${priority} → ${category} → ${urgency} → ${difficulty} → ${t.title}`);
    setPriority(null);
    setCategory(null);
    setUrgency(null);
    setDifficulty(null);
    setAiResponse("");
    activeButtonRef.current = null;
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

  const handleClearTask = () => {
    setSelectedTask(null);
    setAiInput("");
    setAiResponse("");
    setTaskPath("AI Assistant");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          activeButtonRef.current && !activeButtonRef.current.contains(event.target)) {
        setPriority(null);
        setCategory(null);
        setUrgency(null);
        setDifficulty(null);
        activeButtonRef.current = null;
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Get unique categories for selected priority
  const getCategoriesForPriority = () => {
    if (!priority || !taskCategories[priority]) return [];
    return Object.keys(taskCategories[priority]);
  };

  // Get unique urgencies for selected priority and category
  const getUrgenciesForCategory = () => {
    if (!priority || !category || !taskCategories[priority] || !taskCategories[priority][category]) return [];
    return Object.keys(taskCategories[priority][category]);
  };

  // Get unique difficulties for selected priority, category, and urgency
  const getDifficultiesForUrgency = () => {
    if (!priority || !category || !urgency || 
        !taskCategories[priority] || !taskCategories[priority][category] || 
        !taskCategories[priority][category][urgency]) return [];
    return Object.keys(taskCategories[priority][category][urgency]);
  };

  // Get tasks for selected priority, category, urgency, and difficulty
  const getTasksForDifficulty = () => {
    if (!priority || !category || !urgency || !difficulty ||
        !taskCategories[priority] || !taskCategories[priority][category] ||
        !taskCategories[priority][category][urgency] ||
        !taskCategories[priority][category][urgency][difficulty]) return [];
    return taskCategories[priority][category][urgency][difficulty];
  };

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
        {/* LEFT SIDE - Priority Buttons */}
        <div className="left-column">
          <h2>Priorities</h2>
          
          {priorities.map((p) => (
            <div className="priority-item" key={p}>
              <button
                ref={priority === p ? activeButtonRef : null}
                className={`priority-main-btn ${priority === p ? 'active' : ''}`}
                onClick={(e) => handlePriorityClick(p, e.currentTarget)}
              >
                {p}
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - AI Assistant */}
        <div className="right-column">
          {/* Persistent AI Header */}
          <div className="ai-header">{taskPath}</div>

          {/* AI Response Area */}
          <div className="chat-box">
            {aiResponse ? (
              <div className="ai-response">
                <div className="response-content">{aiResponse}</div>
                {aiLoading && <div className="typing-indicator">AI is thinking...</div>}
              </div>
            ) : (
              <p>{aiInput || "Select a task..."}</p>
            )}
          </div>

          {/* Input Area with Action Buttons */}
          <div className="input-area">
            {/* PLUS BUTTON */}
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
                    Summarize Task
                  </button>
                  <button onClick={() => handleAIAction("monetize")}>
                    Monetize Task
                  </button>
                  <button onClick={() => handleAIAction("upload")}>
                    Upload
                  </button>
                </div>
              )}
            </div>

            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI..."
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

      {/* DROPDOWN MENU - 5 Levels: Priority → Category → Urgency → Difficulty → Task */}
      {priority && (
        <>
          <div 
            className="dropdown-backdrop" 
            onClick={() => {
              setPriority(null);
              setCategory(null);
              setUrgency(null);
              setDifficulty(null);
              activeButtonRef.current = null;
            }}
          />
          <div 
            ref={dropdownRef}
            className="floating-wrapper"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              position: 'fixed',
              zIndex: 9999
            }}
          >
            {/* CATEGORY COLUMN */}
            <div className="float-column">
              <h4>Category</h4>
              {getCategoriesForPriority().length === 0 ? (
                <div className="empty-column">No categories</div>
              ) : (
                getCategoriesForPriority().map((cat) => (
                  <button
                    key={cat}
                    className={category === cat ? 'active' : ''}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </button>
                ))
              )}
            </div>

            {/* URGENCY COLUMN */}
            {category && (
              <div className="float-column">
                <h4>Urgency</h4>
                {getUrgenciesForCategory().length === 0 ? (
                  <div className="empty-column">No urgencies</div>
                ) : (
                  getUrgenciesForCategory().map((urg) => (
                    <button
                      key={urg}
                      className={urgency === urg ? 'active' : ''}
                      onClick={() => handleUrgencyClick(urg)}
                    >
                      {urg}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* DIFFICULTY COLUMN */}
            {urgency && (
              <div className="float-column">
                <h4>Difficulty</h4>
                {getDifficultiesForUrgency().length === 0 ? (
                  <div className="empty-column">No difficulties</div>
                ) : (
                  getDifficultiesForUrgency().map((diff) => {
                    const taskCount = taskCategories[priority][category][urgency][diff]?.length || 0;
                    return (
                      <button
                        key={diff}
                        className={difficulty === diff ? 'active' : ''}
                        onClick={() => handleDifficultyClick(diff)}
                      >
                        {diff}
                        {taskCount > 0 && <span className="task-count">({taskCount})</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* TASKS COLUMN */}
            {difficulty && (
              <div className="float-column">
                <h4>Tasks</h4>
                {getTasksForDifficulty().length === 0 ? (
                  <div className="empty-column">No tasks</div>
                ) : (
                  getTasksForDifficulty().map((t) => (
                    <button key={t._id} onClick={() => handleTaskClick(t)}>
                      {t.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
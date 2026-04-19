import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { categoryService } from '../components/services/categoryService';
import { authService } from '../components/services/authService';
import AdminProgress from '../components/Admin/AdminProgress';
import UserManagement from '../components/Admin/UserManagement';
import AllTasks from '../components/Admin/AllTasks';
import AllCategories from '../components/Admin/AllCategories';
import AllPending from '../components/Admin/AllPending';
import AllComplete from '../components/Admin/AllComplete';
import AdminAssignTask from '../components/Admin/AdminAssignTask';
import AIAssistant from '../components/Common/AIAssistant';
import '../components/Admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedToday: 0,
    totalCategories: 0,
    assignedTasks: 0,
    assignedCategories: 0
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all tasks - ensure we get an array
      let allTasksData = [];
      try {
        const tasksResponse = await taskService.getAllTasks();
        // Handle different response structures
        allTasksData = Array.isArray(tasksResponse) ? tasksResponse : 
                       tasksResponse?.tasks ? tasksResponse.tasks : 
                       tasksResponse?.data ? tasksResponse.data : [];
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        allTasksData = [];
      }
      
      // Fetch all categories
      let allCategoriesData = [];
      try {
        const categoriesResponse = await categoryService.getCategories();
        allCategoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : 
                           categoriesResponse?.categories ? categoriesResponse.categories : [];
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        allCategoriesData = [];
      }
      
      // Fetch users
      let usersArray = [];
      try {
        const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          usersArray = Array.isArray(usersData) ? usersData : 
                      usersData?.users ? usersData.users : 
                      usersData?.data ? usersData.data : [];
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
      
      const today = new Date().toDateString();
      const completedTodayCount = allTasksData.filter(t => 
        t && t.status === 'completed' && 
        t.completedAt && 
        new Date(t.completedAt).toDateString() === today
      ).length;
      
      setStats({
        totalUsers: usersArray.length,
        totalTasks: allTasksData.length,
        completedToday: completedTodayCount,
        totalCategories: allCategoriesData.length,
        assignedTasks: allTasksData.filter(t => t && t.assignedTo).length,
        assignedCategories: new Set(allTasksData.map(t => t?.category?._id).filter(Boolean)).size
      });
      setTasks(allTasksData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Tasks</h3>
              <div className="stat-value">{stats.totalTasks}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Completed Today</h3>
              <div className="stat-value">{stats.completedToday} 👏</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-info">
              <h3>Total Categories</h3>
              <div className="stat-value">{stats.totalCategories}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📌</div>
            <div className="stat-info">
              <h3>Assigned Tasks</h3>
              <div className="stat-value">{stats.assignedTasks}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <h3>Assigned Categories</h3>
              <div className="stat-value">{stats.assignedCategories}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}>
          Progress
        </button>
        <button className={activeTab === 'assign' ? 'active' : ''} onClick={() => setActiveTab('assign')}>
          Assign Task
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          All Tasks
        </button>
        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
          All Categories
        </button>
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
          All Pending
        </button>
        <button className={activeTab === 'complete' ? 'active' : ''} onClick={() => setActiveTab('complete')}>
          All Complete
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          User Management
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-layout">
            <AdminProgress tasks={tasks} onTaskSelect={handleTaskSelect} />
            <AIAssistant 
              selectedTask={selectedTask} 
              tasksCompletedToday={stats.completedToday}
            />
          </div>
        )}
        {activeTab === 'progress' && <AdminProgress tasks={tasks} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'assign' && <AdminAssignTask onAssign={fetchDashboardData} />}
        {activeTab === 'tasks' && <AllTasks tasks={tasks} onUpdate={fetchDashboardData} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'categories' && <AllCategories onUpdate={fetchDashboardData} />}
        {activeTab === 'pending' && <AllPending tasks={tasks.filter(t => t && t.status !== 'completed')} onUpdate={fetchDashboardData} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'complete' && <AllComplete tasks={tasks.filter(t => t && t.status === 'completed')} onUpdate={fetchDashboardData} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'users' && <UserManagement onUpdate={fetchDashboardData} />}
      </div>
    </div>
  );
};

export default AdminDashboard; 
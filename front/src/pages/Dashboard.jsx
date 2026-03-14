import { useState } from "react";
import TaskCard from "../components/TaskCard";
import { Link } from "react-router-dom";
import '../components/Dashboard.css'

import { mockTasks } from "../data/mockTasks";



function Dashboard() {
  const [tasks, setTasks] = useState(mockTasks);

  const handleAI = (e) => {
  e.preventDefault();
  alert("AI feature coming soon: summarize, monetize, and assist tasks.");
};

  const completed = tasks.filter((t) => t.completed).length;

  const completionRate = tasks.length
  ? Math.round((completed / tasks.length) * 100)
  : 0;

  const handleDelete = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));

  };

  return (
  
      <div className="dashboard-container">
          {/* <div className="dashboard-header">
            <div className="summary-content">Completion: {completed} </div>
            <div className="summary-content">Pending: <span>{tasks.filter((task) => !task.completed).length}</span></div>
            <div className="summary-content">Categories: <span>{new Set(tasks.map((task) => task.category)).size}</span></div>
            <div className="summary-content">
              Progress:{completionRate}%
              Create a circlular progress bar here to show completion percentage, which is based on all tasks, against the total number of tasks completed. 
            </div>
          </div> */}

        {/* LEFT-SIDEABR */}
          <div className="dashboard-body">
            <div className="left-sidebar">
              <h1>Priorities</h1>
             <Link className="link">High Priority</Link> 
              <Link className="link">Medium Priority</Link>
              <Link className="link">Low Priority</Link>
            </div>


          {/* RIGHT-SIDEBAR */}
            <div className="right-sidebar">
           
              <div className="right-sidebar-content">
                
                <div className="TaskSelection">
                  <label>Choose task from {tasks.length}: Urgent</label>
                  <select>
                    <option value="work"></option>
                  </select>
                </div>


                <div className="TaskActions">
                   <div className="right-sidebar-header"><h4>Urgent..Youtube...Upload</h4></div>
                    <div className="TaskButtons">
                      
                      <button className="deleteBtn">Summarize Task</button>
                      <button className="deleteBtn">Monetize Task</button>
                    </div>

                    <div className="TaskText">
                    
                      <p>Self scrolling text display</p>

                      <form onSubmit={handleAI}>
                        <button className="editBtn">Upload</button>
                        <input type="text" placeholder="Ask AI for help..." />
                        <button type="submit">Send</button> 

                        {/* Complete the AI functionalities for me */}
                      </form>
                      
                  </div>
                
                </div>
              </div>
          </div>
         </div> 


{/* {tasks.length === 0 ? (
        <p>No tasks available</p>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={handleDelete} />
        ))
      )} */}

      </div>  
  
  );
}

export default Dashboard;
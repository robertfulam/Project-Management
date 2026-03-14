import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import ThemeToggle from "./ThemeToggle"
// import Logo from '../assets/logo.png'
import Categories from "./Categories";
import Pending from "./Pending";
import Complete from "./Complete";
import { mockTasks } from "../data/mockTasks";
import { useState } from "react";
import AdminToggle from "./AdminToggle";

function Navbar() {
   const [tasks, setTasks] = useState(mockTasks);

  const completed = tasks.filter((t) => t.completed).length;

  const completionRate = tasks.length
  ? Math.round((completed / tasks.length) * 100)
  : 0;
  const navigate = useNavigate();

  // Temporary mock auth state (replace later with real auth)
  const isLoggedIn = false;

  const handleLogout = () => {
    // Later: clear token from localStorage
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
      
        <h2 className="logo" onClick={() => navigate("/")}>
         {/* Navigation Links */}
        <div className="logo">
          <NavLink to="/" className="nav-link">
            PM
          </NavLink>
        </div>
        </h2>



        <div className="nav-links">

          <NavLink to="/add" className="nav-link">
            My Todo
          </NavLink>

          <NavLink to="/categories" className="nav-link">
            Categories <span className="badge">{new Set(tasks.map((task) => task.category)).size}</span>
          </NavLink>

          <NavLink to="/pending" className="nav-link">
            Pending<span className="badge">{tasks.filter((task) => !task.completed).length}</span>
          </NavLink>

          <NavLink to="/complete" className="nav-link">
            Complete <span className="badge">{completed}</span>
          </NavLink>

          <NavLink to="/progress" className="nav-link">
            Progress <span className="badge">{completionRate}%</span>
          </NavLink>
  
        </div>

        

        {/* Auth Section */}
        <div className="auth-section">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          ) : (
            <>

            <ThemeToggle />
            <button>Profile</button>
            <AdminToggle isAdminView={false} />
              {/* <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/signup" className="nav-link signup-btn">
                Sign Up
              </NavLink> */}
              
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
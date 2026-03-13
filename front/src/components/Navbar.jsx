import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import Logo from '/assets/logo.png'

function Navbar() {
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
        {/* Logo / App Name */}
        <h2 className="logo" onClick={() => navigate("/")}>
          <img src="logo" alt="logo" />
        </h2>

        {/* Navigation Links */}
        {/* <div className="logo">
          <NavLink to="/" className="nav-link">
            image = {Logo}
          </NavLink>
        </div> */}



        <div className="nav-links">

          <NavLink to="/add" className="nav-link">
            Add Task
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
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/signup" className="nav-link signup-btn">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
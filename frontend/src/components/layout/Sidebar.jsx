import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../styles/layout.css";

function Sidebar({ isOpen, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = () => {
    
    if (window.innerWidth <= 768) {
      onToggle();
    }
  };

  return (
    <>
      
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
        
        
        <div className="sidebar-header">

          {isOpen && (
            <span className="sidebar-title">
              PostureAI
            </span>
          )}

          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

        </div>

        
        <nav className="sidebar-nav">

          <NavLink
            to="/dashboard"
            className="sidebar-link"
            onClick={handleNavigation}
            title="Dashboard"
          >
            <span className="sidebar-icon">📊</span>

            {isOpen && (
              <span className="sidebar-text">
                Dashboard
              </span>
            )}
          </NavLink>

          <NavLink
            to="/live-monitor"
            className="sidebar-link"
            onClick={handleNavigation}
            title="Live Monitor"
          >
            <span className="sidebar-icon">📹</span>

            {isOpen && (
              <span className="sidebar-text">
                Live Monitor
              </span>
            )}
          </NavLink>

          <NavLink
            to="/history"
            className="sidebar-link"
            onClick={handleNavigation}
            title="History"
          >
            <span className="sidebar-icon">📈</span>

            {isOpen && (
              <span className="sidebar-text">
                History
              </span>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className="sidebar-link"
            onClick={handleNavigation}
            title="Profile"
          >
            <span className="sidebar-icon">👤</span>

            {isOpen && (
              <span className="sidebar-text">
                Profile
              </span>
            )}
          </NavLink>

        </nav>

       
        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="sidebar-icon">🚪</span>

            {isOpen && (
              <span className="sidebar-text">
                Logout
              </span>
            )}
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;
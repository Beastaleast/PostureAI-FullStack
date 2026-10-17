import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";

function Navbar() {
  const { user } = useAuth();

  const getInitial = () =>
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/dashboard">
          <span className="logo-mark">P</span>
          <span>PostureAI</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="notification-icon" title="Notifications" aria-label="Notifications">
          <span>⌁</span>
        </div>

        <Link to="/profile" className="user-profile">
          <div className="user-avatar">{getInitial()}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || "User"}</span>
            <span className="user-role">Member</span>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;

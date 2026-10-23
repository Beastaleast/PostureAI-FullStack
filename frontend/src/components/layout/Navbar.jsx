import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../styles/layout.css";

function Navbar() {
  const { user } = useAuth();

  const getInitial = () =>
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/dashboard" aria-label="PostureAI home">
          <span className="logo-mark">P</span>
          <span>PostureAI</span>
        </Link>
      </div>

      <div className="navbar-right">
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

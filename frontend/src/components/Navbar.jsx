import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!token) return null;

  return (
    <header className="navbar-container">
      <Link to={role === "admin" ? "/admin" : "/dashboard"} className="navbar-brand">
        <div className="navbar-logo-icon">🏢</div>
        <span className="navbar-brand-title">FixMyMohalla</span>
      </Link>

      <nav className="navbar-nav-links">
        {role === "admin" ? (
          <>
            <Link
              className={`navbar-link ${location.pathname === "/admin" ? "active" : ""}`}
              to="/admin"
            >
              <span>📊</span> Complaints
            </Link>
            <Link
              className={`navbar-link ${location.pathname === "/notices" ? "active" : ""}`}
              to="/notices"
            >
              <span>📢</span> Notice Board
            </Link>
          </>
        ) : (
          <>
            <Link
              className={`navbar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
              to="/dashboard"
            >
              <span>📋</span> My Complaints
            </Link>
            <Link
              className={`navbar-link ${location.pathname === "/raise-complaint" ? "active" : ""}`}
              to="/raise-complaint"
            >
              <span>✍️</span> Raise Complaint
            </Link>
            <Link
              className={`navbar-link ${location.pathname === "/notices" ? "active" : ""}`}
              to="/notices"
            >
              <span>📢</span> Notices
            </Link>
          </>
        )}
      </nav>

      <div className="navbar-actions">
        <div className="navbar-user-chip">
          <span>{role === "admin" ? "🛡️" : "👤"}</span>
          <span className="user-role-text">{role === "admin" ? "Admin Access" : "Resident"}</span>
        </div>
        <button className="navbar-logout-btn" onClick={handleLogout} title="Logout">
          🚪 Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!token) return null;

  return (
    <header className="navbar-container">
      <div className="navbar-brand-section">
        {/* Brand Logo & Name */}
        <Link to={role === "admin" ? "/admin" : "/dashboard"} className="navbar-brand">
          <div className="navbar-brand-symbol">FM</div>
          <span className="navbar-brand-title">FixMyMohalla</span>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar-nav-links">
          {role === "admin" ? (
            <>
              <Link
                className={`navbar-link ${location.pathname === "/admin" ? "active" : ""}`}
                to="/admin"
              >
                Complaints
              </Link>
              <Link
                className={`navbar-link ${location.pathname === "/notices" ? "active" : ""}`}
                to="/notices"
              >
                Notice Board
              </Link>
            </>
          ) : (
            <>
              <Link
                className={`navbar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                to="/dashboard"
              >
                My Complaints
              </Link>
              <Link
                className={`navbar-link ${location.pathname === "/raise-complaint" ? "active" : ""}`}
                to="/raise-complaint"
              >
                Raise Complaint
              </Link>
              <Link
                className={`navbar-link ${location.pathname === "/notices" ? "active" : ""}`}
                to="/notices"
              >
                Notices
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Right Side: Theme Toggle, Role Badge, Account Link & Logout */}
      <div className="navbar-actions">
        {/* Dark/Light Mode Switcher */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        <span
          className={`navbar-role-tag ${
            role === "admin" ? "role-tag-admin" : "role-tag-resident"
          }`}
        >
          {role === "admin" ? "Admin" : "Resident"}
        </span>

        <Link
          to="/profile"
          className={`navbar-account-link ${location.pathname === "/profile" ? "active" : ""}`}
        >
          Account
        </Link>

        <button className="navbar-logout-btn" onClick={handleLogout} title="Log out">
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;
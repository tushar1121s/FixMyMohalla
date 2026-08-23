import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!token) return null; // login/register pages pe navbar nahi dikhega

  return (
    <div className="navbar">
      <div className="navbar-links">
        {role === "admin" ? (
          <>
            <Link className="nav-link" to="/admin">Admin Dashboard</Link>
            <Link className="nav-link" to="/notices">Notices</Link>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/dashboard">My Complaints</Link>
            <Link className="nav-link" to="/raise-complaint">Raise Complaint</Link>
            <Link className="nav-link" to="/notices">Notices</Link>
          </>
        )}
      </div>
      <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;
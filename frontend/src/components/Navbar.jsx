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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", gap: 15 }}>
        {role === "admin" ? (
          <>
            <Link to="/admin">Admin Dashboard</Link>
            <Link to="/notices">Notices</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">My Complaints</Link>
            <Link to="/raise-complaint">Raise Complaint</Link>
            <Link to="/notices">Notices</Link>
          </>
        )}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Dashboard() {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        api
            .get("/complaints/my")
            .then((res) => setComplaints(res.data))
            .catch((err) => {
                setError(err.response?.data?.detail || "Failed to load complaints");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 700, margin: "30px auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>My Complaints</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <Link to="/raise-complaint">
                <button style={{ marginBottom: 20 }}>+ Raise New Complaint</button>
            </Link>
            <Link to="/notices">
                <button style={{ marginBottom: 20, marginLeft: 10 }}>View Notices</button>
            </Link>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {complaints.length === 0 && !error && <p>No complaints yet.</p>}

            {complaints.map((c) => (
                <div
                    key={c.id}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 10,
                    }}
                >
                    <p><strong>Category:</strong> {c.category}</p>
                    <p><strong>Description:</strong> {c.description}</p>
                    <p><strong>Status:</strong> {c.current_status}</p>
                    <p><strong>Priority:</strong> {c.priority}</p>
                    {c.photo_url && (
                        <img
                            src={c.photo_url}
                            alt="complaint"
                            style={{ maxWidth: 150, display: "block", marginTop: 8 }}
                        />
                    )}
                    <Link to={`/complaints/${c.id}`}>View Details</Link>
                </div>
            ))}
        </div>
    );
}

export default Dashboard;
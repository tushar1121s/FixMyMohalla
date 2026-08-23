import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function statusBadgeClass(status) {
    if (status === "Open") return "badge badge-open";
    if (status === "In Progress") return "badge badge-progress";
    if (status === "Resolved") return "badge badge-resolved";
    return "badge";
}

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

    if (loading) return <p className="page-container">Loading...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>My Complaints</h2>
            </div>

            <div className="action-row">
                <Link to="/raise-complaint">
                    <button className="btn btn-primary">+ Raise New Complaint</button>
                </Link>
                <Link to="/notices">
                    <button className="btn">View Notices</button>
                </Link>
            </div>

            {error && <p className="alert-error">{error}</p>}

            {complaints.length === 0 && !error && <p className="text-muted">No complaints yet.</p>}

            {complaints.map((c) => (
                <div key={c.id} className="card complaint-card">
                    <p><strong>Category:</strong> {c.category}</p>
                    <p><strong>Description:</strong> {c.description}</p>
                    <p><strong>Status:</strong> <span className={statusBadgeClass(c.current_status)}>{c.current_status}</span></p>
                    <p><strong>Priority:</strong> {c.priority}</p>
                    {c.photo_url && (
                        <img src={c.photo_url} alt="complaint" />
                    )}
                    <Link to={`/complaints/${c.id}`}>View Details</Link>
                </div>
            ))}
        </div>
    );
}

export default Dashboard;
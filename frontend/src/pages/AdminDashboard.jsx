import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: "", status: "" });
    const navigate = useNavigate();

    const fetchComplaints = () => {
        setLoading(true);
        const params = {};
        if (filters.category) params.category = filters.category;
        if (filters.status) params.status = filters.status;

        api
            .get("/complaints", { params })
            .then((res) => setComplaints(res.data))
            .catch((err) => {
                setError(err.response?.data?.detail || "Failed to load complaints");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "admin") {
            navigate("/login");
            return;
        }
        fetchComplaints();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchComplaints();
    };

    const handleStatusUpdate = async (id, newStatus) => {
        const note = window.prompt("Add a note (optional):", "");
        try {
            await api.patch(`/complaints/${id}/status`, {
                status: newStatus,
                note: note || null,
            });
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to update status");
        }
    };

    const handlePriorityUpdate = async (id, newPriority) => {
        try {
            await api.patch(`/complaints/${id}/priority`, { priority: newPriority });
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to update priority");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 900, margin: "30px auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Admin Dashboard — All Complaints</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <p>
                <Link to="/notices">Manage Notice Board</Link>
            </p>

            <form onSubmit={handleFilterSubmit} style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Filter by category"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    style={{ marginRight: 10 }}
                />
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    style={{ marginRight: 10 }}
                >
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <button type="submit">Apply Filters</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {complaints.length === 0 && !error && <p>No complaints found.</p>}

            {complaints.map((c) => (
                <div
                    key={c.id}
                    style={{
                        border: c.is_overdue ? "2px solid red" : "1px solid #ccc",
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 10,
                        backgroundColor: c.is_overdue ? "#fff5f5" : "white",
                    }}
                >
                    <p>
                        <strong>#{c.id} — {c.category}</strong>{" "}
                        {c.is_overdue && <span style={{ color: "red" }}>(OVERDUE)</span>}
                    </p>
                    <p>{c.description}</p>
                    <p><strong>Status:</strong> {c.current_status} | <strong>Priority:</strong> {c.priority}</p>
                    {c.photo_url && (
                        <img
                            src={c.photo_url}
                            alt="complaint"
                            style={{ maxWidth: 120, display: "block", marginBottom: 8 }}
                        />
                    )}

                    <div style={{ marginTop: 8 }}>
                        <label>Update Status: </label>
                        <select
                            value={c.current_status}
                            onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                            disabled={c.current_status === "Resolved"}
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <label>Update Priority: </label>
                        <select
                            value={c.priority}
                            onChange={(e) => handlePriorityUpdate(c.id, e.target.value)}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminDashboard;
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function statusBadgeClass(status) {
    if (status === "Open") return "badge badge-open";
    if (status === "In Progress") return "badge badge-progress";
    if (status === "Resolved") return "badge badge-resolved";
    return "badge";
}

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

    if (loading) return <p className="page-container-wide">Loading...</p>;

    return (
        <div className="page-container-wide">
            <div className="page-header">
                <h2>Admin Dashboard — All Complaints</h2>
            </div>

            <p style={{ marginBottom: "var(--space-md)" }}>
                <Link className="back-link" to="/notices">Manage Notice Board</Link>
            </p>

            <form onSubmit={handleFilterSubmit} className="filter-form">
                <input
                    className="input"
                    type="text"
                    placeholder="Filter by category"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                />
                <select
                    className="input"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <button className="btn btn-primary" type="submit">Apply Filters</button>
            </form>

            {error && <p className="alert-error">{error}</p>}
            {complaints.length === 0 && !error && <p className="text-muted">No complaints found.</p>}

            {complaints.map((c) => (
                <div
                    key={c.id}
                    className={`card admin-card ${c.is_overdue ? "card-overdue" : ""}`}
                >
                    <p>
                        <strong>#{c.id} — {c.category}</strong>{" "}
                        {c.is_overdue && <span className="overdue-tag">(OVERDUE)</span>}
                    </p>
                    <p>{c.description}</p>
                    <p>
                        <span className={statusBadgeClass(c.current_status)}>{c.current_status}</span>
                        {"  "}
                        <strong>Priority:</strong> {c.priority}
                    </p>
                    {c.photo_url && (
                        <img src={c.photo_url} alt="complaint" />
                    )}

                    <div className="control-group">
                        <label>Update Status:</label>
                        <select
                            className="input"
                            value={c.current_status}
                            onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                            disabled={c.current_status === "Resolved"}
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Update Priority:</label>
                        <select
                            className="input"
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
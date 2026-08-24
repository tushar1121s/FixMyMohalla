import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./AdminDashboard.css";

function statusBadgeClass(status) {
  if (status === "Open") return "status-badge status-badge-open";
  if (status === "In Progress") return "status-badge status-badge-progress";
  if (status === "Resolved") return "status-badge status-badge-resolved";
  return "status-badge";
}

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  const fetchComplaints = (archived = showArchived) => {
    setLoading(true);
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (archived) params.include_archived = true;

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
    const note = window.prompt("Add resolution note for resident (optional):", "");
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

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to archive / delete this resolved complaint?")) {
      return;
    }
    try {
      await api.delete(`/complaints/${id}`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete complaint");
    }
  };

  const handleRestoreComplaint = async (id) => {
    try {
      await api.patch(`/complaints/${id}/restore`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to restore complaint");
    }
  };

  const overdueCount = complaints.filter((c) => c.is_overdue && !c.is_archived).length;
  const activeCount = complaints.filter((c) => !c.is_archived).length;
  const resolvedCount = complaints.filter((c) => c.current_status === "Resolved" && !c.is_archived).length;

  if (loading) {
    return <div className="dashboard-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-wrapper">
          <div className="admin-title-row">
            <h2 className="admin-title">Complaints Management</h2>
            <span className="admin-badge-pill">Admin Center</span>
          </div>
          <p className="admin-subtitle">Monitor, update status, and manage all society-wide complaints</p>
        </div>
        <div>
          <Link to="/notices" className="admin-notice-btn">
            Manage Notice Board
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span className="kpi-label">Active Complaints</span>
          <span className="kpi-value">{activeCount}</span>
        </div>

        <div className={`admin-kpi-card ${overdueCount > 0 ? "admin-kpi-card-overdue" : ""}`}>
          <span className="kpi-label">Overdue Complaints</span>
          <span className={`kpi-value ${overdueCount > 0 ? "kpi-value-overdue" : ""}`}>
            {overdueCount}
          </span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label">Resolved Issues</span>
          <span className="kpi-value">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Bar Toolbar */}
      <form onSubmit={handleFilterSubmit} className="admin-filter-bar">
        <span className="filter-label-text">Filter:</span>
        <input
          className="filter-input"
          type="text"
          placeholder="Filter by category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <select
          className="filter-input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <label className="filter-checkbox-label">
          <input
            className="filter-checkbox"
            type="checkbox"
            checked={showArchived}
            onChange={(e) => {
              setShowArchived(e.target.checked);
              fetchComplaints(e.target.checked);
            }}
          />
          Show Archived
        </label>
        <button className="filter-submit-btn" type="submit">
          Apply
        </button>
      </form>

      {error && <div className="dashboard-error">{error}</div>}

      {complaints.length === 0 && !error && (
        <div className="dashboard-empty-state">
          <h3 className="empty-state-title">No complaints found</h3>
          <p className="empty-state-desc">No complaints match the specified filter criteria.</p>
        </div>
      )}

      {/* Complaints Grid */}
      <div className="admin-cards-grid">
        {complaints.map((c) => (
          <div
            key={c.id}
            className={`admin-complaint-card ${c.is_overdue ? "admin-complaint-card-overdue" : ""}`}
          >
            <div>
              {/* Card Header */}
              <div className="admin-card-header">
                <div>
                  <span className="admin-card-id">#{c.id}</span>
                  <h3 className="admin-card-category">{c.category}</h3>
                </div>
                <div>
                  {c.is_overdue && <span className="admin-tag-overdue">Overdue</span>}
                  {c.is_archived && <span className="admin-tag-archived">Archived</span>}
                </div>
              </div>

              {/* Description */}
              <p className="admin-card-desc">{c.description}</p>

              {/* Photo */}
              {c.photo_url && (
                <img src={c.photo_url} alt="Complaint" className="admin-card-img" />
              )}

              {/* Badges */}
              <div className="admin-badges-row">
                <span className={statusBadgeClass(c.current_status)}>{c.current_status}</span>
                <span className="admin-priority-badge">Priority: {c.priority}</span>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="admin-controls-box">
              {!c.is_archived ? (
                <>
                  <div className="admin-dropdowns-row">
                    <div className="control-item">
                      <span className="control-label">Status</span>
                      <select
                        className="control-select"
                        value={c.current_status}
                        onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                        disabled={c.current_status === "Resolved"}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="control-item">
                      <span className="control-label">Priority</span>
                      <select
                        className="control-select"
                        value={c.priority}
                        onChange={(e) => handlePriorityUpdate(c.id, e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-card-footer">
                    <Link to={`/complaints/${c.id}`} className="admin-audit-link">
                      Audit Trail →
                    </Link>
                    {c.current_status === "Resolved" && (
                      <button
                        type="button"
                        className="admin-archive-btn"
                        onClick={() => handleDeleteComplaint(c.id)}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="admin-card-footer">
                  <Link to={`/complaints/${c.id}`} className="admin-audit-link">
                    Audit Trail →
                  </Link>
                  <button
                    type="button"
                    className="admin-restore-btn"
                    onClick={() => handleRestoreComplaint(c.id)}
                  >
                    Restore
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
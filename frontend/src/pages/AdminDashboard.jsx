import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./AdminDashboard.css";

function formatRelativeTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("complaints"); // "complaints" | "members"
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [activeImage, setActiveImage] = useState(null); // Lightbox modal
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchComplaints = (archived = showArchived) => {
    setLoading(true);
    const params = {};
    if (archived) params.include_archived = true;

    api
      .get("/complaints", { params })
      .then((res) => setComplaints(res.data))
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load complaints");
      })
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    api
      .get("/auth/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Failed to load users", err);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }
    fetchComplaints();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    const note = window.prompt("Add administrative resolution remark for resident (optional):", "");
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
    if (!window.confirm("Archive this resolved complaint? It will be safely moved out of the active operations queue.")) {
      return;
    }
    try {
      await api.delete(`/complaints/${id}`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to archive complaint");
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

  const handleRoleChange = async (userId, userName, currentRole) => {
    const newRole = currentRole === "admin" ? "resident" : "admin";
    const actionText = newRole === "admin" ? "promote to Society Admin" : "demote to Resident";

    if (!window.confirm(`Are you sure you want to ${actionText} for ${userName}?`)) {
      return;
    }

    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update user role");
    }
  };

  // Metrics Calculations
  const overdueCount = complaints.filter((c) => c.is_overdue && !c.is_archived).length;
  const activeCount = complaints.filter((c) => !c.is_archived).length;
  const resolvedCount = complaints.filter((c) => c.current_status === "Resolved" && !c.is_archived).length;
  const resolutionRate = activeCount > 0 ? Math.round((resolvedCount / activeCount) * 100) : 100;

  // Filtered Complaints for Operations Table
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.resident_name && c.resident_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.resident_flat && c.resident_flat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    const matchesStatus = !selectedStatus || c.current_status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered Members for Committee Table
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.flat_no && u.flat_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = Array.from(new Set(complaints.map((c) => c.category)));

  return (
    <div className="admin-page-container">
      {/* Executive Header */}
      <div className="admin-header">
        <div>
          <div className="admin-title-row">
            <h2 className="admin-title">Society Operations Command Center</h2>
            <span className="admin-badge-pill">Executive Console</span>
          </div>
          <p className="admin-subtitle">
            Centralized grievance triage, multi-admin role management, and service resolution tracking
          </p>
        </div>
        <div>
          <Link to="/notices" className="admin-notice-btn">
            Notice Board Circulars →
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("complaints");
            setSearchQuery("");
          }}
        >
          Operations Queue ({activeCount})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "members" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("members");
            setSearchQuery("");
            fetchUsers();
          }}
        >
          Managing Committee & Residents ({users.length})
        </button>
      </div>

      {/* ========================================================
          TAB 1: COMPLAINTS OPERATIONS QUEUE
          ======================================================== */}
      {activeTab === "complaints" && (
        <>
          {/* KPI Summary Widgets */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <span className="kpi-label">Active Tickets</span>
              <span className="kpi-value">{activeCount}</span>
            </div>

            <div className={`admin-kpi-card ${overdueCount > 0 ? "admin-kpi-card-overdue" : ""}`}>
              <span className="kpi-label">Overdue SLA Escalations</span>
              <span className={`kpi-value ${overdueCount > 0 ? "kpi-value-overdue" : ""}`}>
                {overdueCount}
              </span>
            </div>

            <div className="admin-kpi-card">
              <span className="kpi-label">Resolved Issues</span>
              <span className="kpi-value">{resolvedCount}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="kpi-label">Resolution Efficiency</span>
              <span className="kpi-value">{resolutionRate}%</span>
            </div>
          </div>

          {/* Operations Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-wrapper">
              <input
                className="admin-search-input"
                type="text"
                placeholder="Search ticket, category, resident, or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-filter-group">
              <select
                className="admin-select-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                className="admin-select-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <label className="admin-checkbox-label">
                <input
                  className="admin-checkbox"
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => {
                    setShowArchived(e.target.checked);
                    fetchComplaints(e.target.checked);
                  }}
                />
                Show Archived Records
              </label>
            </div>
          </div>

          {error && <div className="dashboard-error">{error}</div>}

          {/* Operations Data Table */}
          <div className="admin-table-container">
            <table className="admin-ops-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category & Issue</th>
                  <th>Resident & Unit</th>
                  <th>Status Mutation</th>
                  <th>Priority Tier</th>
                  <th>Age / SLA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No tickets matching specified filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <tr key={c.id} className={c.is_overdue ? "row-overdue" : ""}>
                      {/* Ticket & Photo Thumb */}
                      <td>
                        <div className="col-id-cell">
                          <span className="id-tag">#{c.id}</span>
                          {c.photo_url && (
                            <button
                              type="button"
                              className="thumb-preview-btn"
                              title="Click to view evidence photo"
                              onClick={() => setActiveImage(c.photo_url)}
                            >
                              <img src={c.photo_url} alt="Proof" className="thumb-preview-img" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Category & Issue */}
                      <td>
                        <div className="col-issue-cell">
                          <span className="issue-category-tag">{c.category}</span>
                          <p className="issue-desc-text">{c.description}</p>
                        </div>
                      </td>

                      {/* Resident & Flat */}
                      <td>
                        <div className="col-resident-cell">
                          <div className="resident-name-text">{c.resident_name}</div>
                          <div className="resident-flat-text">
                            {c.resident_flat ? `Flat ${c.resident_flat}` : "Unit N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        {!c.is_archived ? (
                          <select
                            className={`ops-select-status ${
                              c.current_status === "Open"
                                ? "status-open"
                                : c.current_status === "In Progress"
                                ? "status-progress"
                                : "status-resolved"
                            }`}
                            value={c.current_status}
                            onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                            disabled={c.current_status === "Resolved"}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        ) : (
                          <span className="role-badge-resident">Archived</span>
                        )}
                      </td>

                      {/* Priority Dropdown */}
                      <td>
                        {!c.is_archived ? (
                          <select
                            className="ops-select-priority"
                            value={c.priority}
                            onChange={(e) => handlePriorityUpdate(c.id, e.target.value)}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        ) : (
                          <span className="sla-age-text">{c.priority}</span>
                        )}
                      </td>

                      {/* Age / Overdue */}
                      <td>
                        <div>
                          <div className="sla-age-text">{formatRelativeTime(c.created_at)}</div>
                          {c.is_overdue && <span className="sla-overdue-tag">SLA Breach</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="ops-actions-cell">
                          <Link to={`/complaints/${c.id}`} className="ops-audit-btn">
                            Audit →
                          </Link>
                          {!c.is_archived ? (
                            c.current_status === "Resolved" && (
                              <button
                                type="button"
                                className="ops-archive-btn"
                                onClick={() => handleDeleteComplaint(c.id)}
                              >
                                Archive
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              className="ops-restore-btn"
                              onClick={() => handleRestoreComplaint(c.id)}
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================
          TAB 2: MANAGING COMMITTEE & RESIDENTS
          ======================================================== */}
      {activeTab === "members" && (
        <div>
          <div className="admin-toolbar">
            <div className="admin-search-wrapper">
              <input
                className="admin-search-input"
                type="text"
                placeholder="Search member by name, email, or flat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-ops-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Flat / Unit</th>
                  <th>Role Designation</th>
                  <th>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No members found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <div className="resident-name-text">{u.name}</div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.flat_no || "N/A"}</td>
                      <td>
                        {u.id === 1 ? (
                          <span className="role-badge-super">Super Admin</span>
                        ) : u.role === "admin" ? (
                          <span className="role-badge-admin">Admin</span>
                        ) : (
                          <span className="role-badge-resident">Resident</span>
                        )}
                      </td>
                      <td>
                        {u.id === 1 ? (
                          <span className="action-locked-text">Permanent Root Super Admin</span>
                        ) : u.role === "admin" ? (
                          <button
                            className="action-demote-btn"
                            onClick={() => handleRoleChange(u.id, u.name, u.role)}
                          >
                            Demote to Resident
                          </button>
                        ) : (
                          <button
                            className="action-promote-btn"
                            onClick={() => handleRoleChange(u.id, u.name, u.role)}
                          >
                            Promote to Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo Evidence */}
      {activeImage && (
        <div className="lightbox-backdrop" onClick={() => setActiveImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setActiveImage(null)}>
              Close ✕
            </button>
            <img src={activeImage} alt="Attachment Full View" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Dashboard.css";

function statusBadgeClass(status) {
  if (status === "Open") return "status-badge status-badge-open";
  if (status === "In Progress") return "status-badge status-badge-progress";
  if (status === "Resolved") return "status-badge status-badge-resolved";
  return "status-badge";
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

  const totalRaised = complaints.length;
  const inProgress = complaints.filter(
    (c) => c.current_status === "In Progress" || c.current_status === "Open"
  ).length;
  const resolved = complaints.filter((c) => c.current_status === "Resolved").length;

  if (loading) {
    return <div className="dashboard-loading">Loading complaints...</div>;
  }

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Resident Dashboard</h2>
          <p className="dashboard-subtitle">Track and manage your submitted society complaints</p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/raise-complaint" className="btn-primary-action">
            + Raise Complaint
          </Link>
          <Link to="/notices" className="btn-secondary-action">
            Notice Board
          </Link>
        </div>
      </div>

      {/* Metric Stat Summary */}
      <div className="dashboard-stats-grid">
        <div className="stat-box">
          <span className="stat-box-label">Total Raised</span>
          <span className="stat-box-value">{totalRaised}</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Pending / In Progress</span>
          <span className="stat-box-value">{inProgress}</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Resolved</span>
          <span className="stat-box-value">{resolved}</span>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* Complaints Section */}
      <h3 className="dashboard-section-heading">My Complaints</h3>

      {complaints.length === 0 && !error ? (
        <div className="dashboard-empty-state">
          <h3 className="empty-state-title">No complaints registered</h3>
          <p className="empty-state-desc">
            You have not submitted any maintenance requests yet.
          </p>
          <Link to="/raise-complaint" className="btn-primary-action">
            Submit New Complaint
          </Link>
        </div>
      ) : (
        <div className="complaints-card-grid">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="complaint-card"
              onClick={() => navigate(`/complaints/${c.id}`)}
            >
              <div>
                <div className="complaint-card-top">
                  <span className="complaint-category-tag">{c.category}</span>
                  <span className={statusBadgeClass(c.current_status)}>
                    {c.current_status}
                  </span>
                </div>

                <p className="complaint-description-preview">{c.description}</p>

                {c.photo_url && (
                  <img
                    src={c.photo_url}
                    alt="Complaint attachment"
                    className="complaint-img-preview"
                  />
                )}
              </div>

              <div className="complaint-card-bottom">
                <span>
                  Priority: <strong className="complaint-priority-label">{c.priority}</strong>
                </span>
                <span className="complaint-view-link">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
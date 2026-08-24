import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./ComplaintDetail.css";

function statusBadgeClass(status) {
  if (status === "Open") return "status-badge status-badge-open";
  if (status === "In Progress") return "status-badge status-badge-progress";
  if (status === "Resolved") return "status-badge status-badge-resolved";
  return "status-badge";
}

function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [zoomedPhoto, setZoomedPhoto] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get(`/complaints/${id}`)
      .then((res) => setComplaint(res.data))
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load complaint");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <div className="dashboard-loading">Loading complaint details...</div>;
  }

  if (error) {
    return (
      <div className="detail-page-container">
        <div className="detail-back-nav">
          <Link
            to={role === "admin" ? "/admin" : "/dashboard"}
            className="detail-back-link"
          >
            ← Back
          </Link>
        </div>
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="detail-page-container">
      {/* Top Navigation */}
      <div className="detail-back-nav">
        <Link
          to={role === "admin" ? "/admin" : "/dashboard"}
          className="detail-back-link"
        >
          ← Back to {role === "admin" ? "Admin Dashboard" : "My Complaints"}
        </Link>
      </div>

      <div className="detail-grid-layout">
        {/* Left Column: Complaint Details & Photo */}
        <div className="detail-main-card">
          <div className="detail-top-bar">
            <span className="detail-id-label">Complaint #{complaint.id}</span>
            <span className={statusBadgeClass(complaint.current_status)}>
              {complaint.current_status}
            </span>
          </div>

          <h2 className="detail-category-heading">{complaint.category}</h2>

          <div className="detail-description-block">
            <span className="detail-block-label">Description</span>
            <p className="detail-description-text">{complaint.description}</p>
          </div>

          <div className="detail-meta-row">
            <div className="detail-meta-box">
              <span className="detail-meta-title">Priority</span>
              <span className="detail-meta-value">{complaint.priority}</span>
            </div>
            <div className="detail-meta-box">
              <span className="detail-meta-title">Date Raised</span>
              <span className="detail-meta-value">
                {new Date(complaint.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {complaint.resolved_at && (
            <div className="detail-resolved-banner">
              Resolved on {new Date(complaint.resolved_at).toLocaleString()}
            </div>
          )}

          {complaint.photo_url && (
            <div className="detail-photo-section">
              <span className="detail-block-label">Photo Evidence (Click to zoom)</span>
              <img
                className="detail-photo-img"
                src={complaint.photo_url}
                alt="Complaint attachment"
                onClick={() => setZoomedPhoto(true)}
              />
            </div>
          )}
        </div>

        {/* Right Column: History Timeline Stepper */}
        <div className="detail-timeline-card">
          <h3 className="timeline-title">Audit History</h3>
          <p className="timeline-subtitle">Status progression and admin notes</p>

          {complaint.history && complaint.history.length > 0 ? (
            <div className="stepper-timeline">
              {complaint.history.map((h, idx) => (
                <div key={h.id || idx} className="stepper-item">
                  <div className="stepper-header">
                    <span className={statusBadgeClass(h.status)}>{h.status}</span>
                    <span className="stepper-date">
                      {new Date(h.changed_at).toLocaleString()}
                    </span>
                  </div>
                  {h.note && (
                    <div className="stepper-note">
                      <strong>Note:</strong> {h.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="timeline-empty">No history recorded yet.</div>
          )}
        </div>
      </div>

      {/* Lightbox Zoom Overlay */}
      {zoomedPhoto && complaint.photo_url && (
        <div className="lightbox-backdrop" onClick={() => setZoomedPhoto(false)}>
          <img src={complaint.photo_url} alt="Enlarged complaint" className="lightbox-image" />
        </div>
      )}
    </div>
  );
}

export default ComplaintDetail;
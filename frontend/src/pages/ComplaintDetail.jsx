import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";

function statusBadgeClass(status) {
    if (status === "Open") return "badge badge-open";
    if (status === "In Progress") return "badge badge-progress";
    if (status === "Resolved") return "badge badge-resolved";
    return "badge";
}

function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [zoomedPhoto, setZoomedPhoto] = useState(false);
  const navigate = useNavigate();

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

  if (loading) return <p className="detail-container">Loading...</p>;
  if (error) return <p className="detail-container alert-error">{error}</p>;
  if (!complaint) return null;

  return (
    <div className="detail-container">
      <Link className="back-link" to="/dashboard">← Back to Dashboard</Link>
      <h2>Complaint #{complaint.id}</h2>
      <div className="card">
        <p><strong>Category:</strong> {complaint.category}</p>
        <p><strong>Description:</strong> {complaint.description}</p>
        <p><strong>Status:</strong> <span className={statusBadgeClass(complaint.current_status)}>{complaint.current_status}</span></p>
        <p><strong>Priority:</strong> {complaint.priority}</p>
        <p><strong>Created:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
        {complaint.resolved_at && (
          <p><strong>Resolved:</strong> {new Date(complaint.resolved_at).toLocaleString()}</p>
        )}
        {complaint.photo_url && (
          <img
            className="detail-photo"
            src={complaint.photo_url}
            alt="complaint"
            onClick={() => setZoomedPhoto(true)}
          />
        )}
      </div>

      <h3 style={{ marginTop: "var(--space-lg)" }}>History Timeline</h3>
      {complaint.history && complaint.history.length > 0 ? (
        <div>
          {complaint.history.map((h) => (
            <div key={h.id} className="timeline-item">
              <p><strong>{h.status}</strong> — {new Date(h.changed_at).toLocaleString()}</p>
              {h.note && <p className="timeline-note">Note: {h.note}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">No history yet.</p>
      )}

      {zoomedPhoto && complaint.photo_url && (
        <div className="photo-modal-overlay" onClick={() => setZoomedPhoto(false)}>
          <img src={complaint.photo_url} alt="complaint zoomed" />
        </div>
      )}
    </div>
  );
}

export default ComplaintDetail;
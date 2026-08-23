import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";

function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
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
      .get(`/complaints/${id}`)
      .then((res) => setComplaint(res.data))
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load complaint");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!complaint) return null;

  return (
    <div style={{ maxWidth: 600, margin: "30px auto" }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h2>Complaint #{complaint.id}</h2>
      <p><strong>Category:</strong> {complaint.category}</p>
      <p><strong>Description:</strong> {complaint.description}</p>
      <p><strong>Status:</strong> {complaint.current_status}</p>
      <p><strong>Priority:</strong> {complaint.priority}</p>
      <p><strong>Created:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
      {complaint.resolved_at && (
        <p><strong>Resolved:</strong> {new Date(complaint.resolved_at).toLocaleString()}</p>
      )}
      {complaint.photo_url && (
        <img
          src={complaint.photo_url}
          alt="complaint"
          style={{ maxWidth: 250, display: "block", marginTop: 8 }}
        />
      )}

      <h3 style={{ marginTop: 20 }}>History Timeline</h3>
      {complaint.history && complaint.history.length > 0 ? (
        <div>
          {complaint.history.map((h) => (
            <div
              key={h.id}
              style={{
                borderLeft: "3px solid #888",
                paddingLeft: 10,
                marginBottom: 10,
              }}
            >
              <p><strong>{h.status}</strong> — {new Date(h.changed_at).toLocaleString()}</p>
              {h.note && <p>Note: {h.note}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p>No history yet.</p>
      )}
    </div>
  );
}

export default ComplaintDetail;
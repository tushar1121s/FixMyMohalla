import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Notices.css";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [postError, setPostError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const fetchNotices = () => {
    setLoading(true);
    api
      .get("/notices/")
      .then((res) => setNotices(res.data))
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load notices");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    setPostError("");
    setSubmitting(true);
    try {
      await api.post("/notices/", {
        title,
        body,
        is_important: isImportant,
      });
      setTitle("");
      setBody("");
      setIsImportant(false);
      setShowCreateForm(false);
      fetchNotices();
    } catch (err) {
      setPostError(err.response?.data?.detail || "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading notice board...</div>;
  }

  return (
    <div className="notices-page-container">
      {/* Header */}
      <div className="notices-header">
        <div>
          <h2 className="notices-title">Society Notice Board</h2>
          <p className="notices-subtitle">Official announcements, updates, and maintenance schedules</p>
        </div>
        <div>
          {role === "admin" && (
            <button
              className="notice-create-toggle-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "+ Publish Notice"}
            </button>
          )}
        </div>
      </div>

      {/* Admin Publish Notice Form */}
      {role === "admin" && showCreateForm && (
        <div className="notice-form-card">
          <h3 className="notice-form-heading">Publish New Notice</h3>
          {postError && <div className="dashboard-error">{postError}</div>}
          <form className="notice-form" onSubmit={handlePostNotice}>
            <div className="notice-form-group">
              <label className="notice-form-label" htmlFor="notice-title">
                Notice Title
              </label>
              <input
                id="notice-title"
                className="notice-input"
                type="text"
                placeholder="e.g. Water Tank Cleaning on Sunday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="notice-form-group">
              <label className="notice-form-label" htmlFor="notice-body">
                Notice Details
              </label>
              <textarea
                id="notice-body"
                className="notice-input notice-textarea"
                placeholder="Write full details about the notice..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
              />
            </div>

            <label className="notice-checkbox-wrapper">
              <input
                className="notice-checkbox"
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
              />
              Mark as High-Priority / Important (Pins notice with badge)
            </label>

            <div className="notice-form-actions">
              <button className="notice-submit-btn" type="submit" disabled={submitting}>
                {submitting ? "Publishing..." : "Publish Notice"}
              </button>
              <button
                type="button"
                className="notice-cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="dashboard-error">{error}</div>}

      {notices.length === 0 && !error && (
        <div className="dashboard-empty-state">
          <h3 className="empty-state-title">No notices published</h3>
          <p className="empty-state-desc">The society notice board is currently clear.</p>
        </div>
      )}

      {/* Notices Feed */}
      <div className="notices-feed">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`notice-item-card ${n.is_important ? "notice-item-important" : ""}`}
          >
            <div className="notice-item-top">
              <h3 className="notice-item-title">{n.title}</h3>
              {n.is_important && <span className="notice-important-badge">Important</span>}
            </div>

            <p className="notice-item-body">{n.body}</p>

            <div className="notice-item-footer">
              <span>
                Posted on {new Date(n.created_at).toLocaleDateString()} at{" "}
                {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notices;
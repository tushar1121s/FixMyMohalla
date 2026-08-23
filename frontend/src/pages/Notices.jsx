import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [postError, setPostError] = useState("");
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
    try {
      await api.post("/notices/", {
        title,
        body,
        is_important: isImportant,
      });
      setTitle("");
      setBody("");
      setIsImportant(false);
      fetchNotices();
    } catch (err) {
      setPostError(err.response?.data?.detail || "Failed to post notice");
    }
  };

  if (loading) return <p className="page-container">Loading...</p>;

  return (
    <div className="page-container">
      <Link className="back-link" to={role === "admin" ? "/admin" : "/dashboard"}>← Back</Link>
      <h2>Notice Board</h2>

      {role === "admin" && (
        <form onSubmit={handlePostNotice} className="card notice-form">
          <h3>Post New Notice</h3>
          {postError && <p className="alert-error">{postError}</p>}
          <input
            className="input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input"
            placeholder="Notice body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
            />
            Mark as Important
          </label>
          <button className="btn btn-primary" type="submit">Post Notice</button>
        </form>
      )}

      {error && <p className="alert-error">{error}</p>}
      {notices.length === 0 && !error && <p className="text-muted">No notices yet.</p>}

      {notices.map((n) => (
        <div
          key={n.id}
          className={`card ${n.is_important ? "notice-card-important" : ""}`}
        >
          <p>
            <strong>{n.title}</strong>{" "}
            {n.is_important && <span className="important-tag">(Important)</span>}
          </p>
          <p>{n.body}</p>
          <p className="notice-timestamp">
            {new Date(n.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Notices;
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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "30px auto" }}>
      <Link to={role === "admin" ? "/admin" : "/dashboard"}>← Back</Link>
      <h2>Notice Board</h2>

      {role === "admin" && (
        <form
          onSubmit={handlePostNotice}
          style={{ border: "1px solid #ccc", padding: 12, marginBottom: 20 }}
        >
          <h3>Post New Notice</h3>
          {postError && <p style={{ color: "red" }}>{postError}</p>}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ display: "block", width: "100%", marginBottom: 10 }}
          />
          <textarea
            placeholder="Notice body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            style={{ display: "block", width: "100%", marginBottom: 10 }}
          />
          <label style={{ display: "block", marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
            />{" "}
            Mark as Important
          </label>
          <button type="submit">Post Notice</button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {notices.length === 0 && !error && <p>No notices yet.</p>}

      {notices.map((n) => (
        <div
          key={n.id}
          style={{
            border: n.is_important ? "2px solid orange" : "1px solid #ccc",
            borderRadius: 6,
            padding: 12,
            marginBottom: 10,
            backgroundColor: n.is_important ? "#fff8e1" : "white",
          }}
        >
          <p>
            <strong>{n.title}</strong>{" "}
            {n.is_important && <span style={{ color: "orange" }}>(Important)</span>}
          </p>
          <p>{n.body}</p>
          <p style={{ fontSize: 12, color: "#666" }}>
            {new Date(n.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Notices;
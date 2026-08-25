import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Notices.css";

function formatMonthLabel(ym) {
  if (!ym || ym === "all") return "All Months";
  const [year, month] = ym.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function Notices() {
  const [notices, setNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedDateSlot, setSelectedDateSlot] = useState("all");
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

  const handleDeleteNotice = async (id, noticeTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete the notice "${noticeTitle}"?`)) {
      return;
    }
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter((n) => n.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete notice");
    }
  };

  // Generate unique list of months from loaded notices
  const availableMonths = Array.from(
    new Set(
      notices.map((n) => {
        const d = new Date(n.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
    )
  ).sort().reverse();

  // Filtered list
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      searchQuery === "" ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());

    const dateObj = new Date(n.created_at);
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
    const matchesMonth = selectedMonth === "all" || monthKey === selectedMonth;

    const day = dateObj.getDate();
    let matchesSlot = true;
    if (selectedDateSlot === "1-10") {
      matchesSlot = day >= 1 && day <= 10;
    } else if (selectedDateSlot === "11-20") {
      matchesSlot = day >= 11 && day <= 20;
    } else if (selectedDateSlot === "21-31") {
      matchesSlot = day >= 21;
    }

    return matchesSearch && matchesMonth && matchesSlot;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.is_important);
  const regularNotices = filteredNotices.filter((n) => !n.is_important);

  const isFilteringActive = selectedMonth !== "all" || selectedDateSlot !== "all" || searchQuery !== "";

  const resetFilters = () => {
    setSelectedMonth("all");
    setSelectedDateSlot("all");
    setSearchQuery("");
  };

  if (loading) {
    return <div className="dashboard-loading">Loading notice board...</div>;
  }

  return (
    <div className="notices-page-container">
      {/* Header */}
      <div className="notices-header">
        <div className="notices-title-group">
          <h2 className="notices-title">Society Notice Board</h2>
          <p className="notices-subtitle">Official announcements, updates, and maintenance circulars</p>
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
              Mark as High-Priority / Important (Pins notice with priority highlight)
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

      {/* Operations Filter Toolbar */}
      <div className="notices-toolbar-card">
        <div className="notices-search-box">
          <input
            className="notices-search-input"
            type="text"
            placeholder="Search circulars by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="notices-filters-group">
          {/* Month Filter */}
          <div className="notices-filter-item">
            <span className="notices-filter-label">Month:</span>
            <select
              className="notices-select-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Segment Filter */}
          <div className="notices-filter-item">
            <span className="notices-filter-label">Date Slot:</span>
            <select
              className="notices-select-filter"
              value={selectedDateSlot}
              onChange={(e) => setSelectedDateSlot(e.target.value)}
            >
              <option value="all">All Dates (1–31)</option>
              <option value="1-10">1st – 10th (Days 1–10)</option>
              <option value="11-20">11th – 20th (Days 11–20)</option>
              <option value="21-31">21st – End of Month (21–31)</option>
            </select>
          </div>

          {isFilteringActive && (
            <button type="button" className="notices-reset-filter-btn" onClick={resetFilters}>
              Reset Filters ✕
            </button>
          )}
        </div>
      </div>

      {notices.length === 0 && !error && (
        <div className="dashboard-empty-state">
          <h3 className="empty-state-title">No notices published</h3>
          <p className="empty-state-desc">The society notice board is currently clear.</p>
        </div>
      )}

      {notices.length > 0 && filteredNotices.length === 0 && (
        <div className="dashboard-empty-state">
          <h3 className="empty-state-title">No notices found</h3>
          <p className="empty-state-desc">No circulars match your selected month, date slot, or search filter.</p>
          <button type="button" className="notices-reset-filter-btn" onClick={resetFilters} style={{ marginTop: 12 }}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pinned / Important Section */}
      {pinnedNotices.length > 0 && (
        <div className="notices-section-block">
          <h3 className="notices-section-title">
            Important Circulars <span className="section-pill-count">{pinnedNotices.length}</span>
          </h3>
          <div className="notices-feed">
            {pinnedNotices.map((n) => (
              <div key={n.id} className="notice-item-card notice-item-important">
                <div className="notice-item-top">
                  <h3 className="notice-item-title">{n.title}</h3>
                  <div className="notice-item-header-meta">
                    <span className="notice-official-tag">Official</span>
                    <span className="notice-important-badge">Priority</span>
                    {role === "admin" && (
                      <button
                        type="button"
                        className="notice-delete-btn"
                        title="Delete this notice"
                        onClick={() => handleDeleteNotice(n.id, n.title)}
                      >
                        Delete ✕
                      </button>
                    )}
                  </div>
                </div>

                <p className="notice-item-body">{n.body}</p>

                <div className="notice-item-footer">
                  <span className="notice-source-label">Society Administration</span>
                  <span className="notice-date-time">
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    ·{" "}
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notices Section */}
      {regularNotices.length > 0 && (
        <div className="notices-section-block">
          {pinnedNotices.length > 0 && (
            <h3 className="notices-section-title">General Announcements ({regularNotices.length})</h3>
          )}
          <div className="notices-feed">
            {regularNotices.map((n) => (
              <div key={n.id} className="notice-item-card">
                <div className="notice-item-top">
                  <h3 className="notice-item-title">{n.title}</h3>
                  <div className="notice-item-header-meta">
                    <span className="notice-official-tag">Official</span>
                    {role === "admin" && (
                      <button
                        type="button"
                        className="notice-delete-btn"
                        title="Delete this notice"
                        onClick={() => handleDeleteNotice(n.id, n.title)}
                      >
                        Delete ✕
                      </button>
                    )}
                  </div>
                </div>

                <p className="notice-item-body">{n.body}</p>

                <div className="notice-item-footer">
                  <span className="notice-source-label">Society Administration</span>
                  <span className="notice-date-time">
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    ·{" "}
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notices;
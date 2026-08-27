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

  // Manual & AI Publish Form States
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [postError, setPostError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Admin AI Copilot States
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("routine");
  const [aiLanguage, setAiLanguage] = useState("english");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // Resident Smart Reading States
  const [translatingId, setTranslatingId] = useState(null);
  const [translatedNotices, setTranslatedNotices] = useState({});
  const [summarizingId, setSummarizingId] = useState(null);
  const [noticeSummaries, setNoticeSummaries] = useState({});
  const [playingAudioId, setPlayingAudioId] = useState(null);

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

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Post Notice
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
      setShowAiDrawer(false);
      fetchNotices();
    } catch (err) {
      setPostError(err.response?.data?.detail || "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Admin Delete Notice
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

  // 3. Admin AI Drafter
  const handleGenerateAiNotice = async () => {
    if (!aiPrompt || aiPrompt.trim().length < 3) {
      setAiError("Please provide a few rough notes or keywords.");
      return;
    }
    setAiError("");
    setAiGenerating(true);
    try {
      const res = await api.post("/ai/generate-notice", {
        rough_notes: aiPrompt,
        tone: aiTone,
        language: aiLanguage,
      });
      setTitle(res.data.title);
      setBody(res.data.body);
      setIsImportant(res.data.is_important);
      setShowAiDrawer(false);
    } catch (err) {
      setAiError(err.response?.data?.detail || "AI generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  // 4. Resident AI Translation (English <-> Hindi)
  const handleTranslateNotice = async (noticeId, currentTitle, currentBody) => {
    const currentData = translatedNotices[noticeId];
    if (currentData && currentData.isTranslated) {
      setTranslatedNotices({
        ...translatedNotices,
        [noticeId]: { ...currentData, isTranslated: false },
      });
      return;
    }

    if (currentData && !currentData.isTranslated && currentData.translatedTitle) {
      setTranslatedNotices({
        ...translatedNotices,
        [noticeId]: { ...currentData, isTranslated: true },
      });
      return;
    }

    setTranslatingId(noticeId);
    try {
      const res = await api.post("/ai/translate-notice", {
        title: currentTitle,
        body: currentBody,
        target_language: "hindi",
      });
      setTranslatedNotices({
        ...translatedNotices,
        [noticeId]: {
          originalTitle: currentTitle,
          originalBody: currentBody,
          translatedTitle: res.data.translated_title,
          translatedBody: res.data.translated_body,
          isTranslated: true,
        },
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Translation failed. Check backend AI API key.");
    } finally {
      setTranslatingId(null);
    }
  };

  // 5. Resident AI TL;DR Summarizer
  const handleSummarizeNotice = async (noticeId, noticeTitle, noticeBody) => {
    if (noticeSummaries[noticeId]) {
      const updated = { ...noticeSummaries };
      delete updated[noticeId];
      setNoticeSummaries(updated);
      return;
    }

    setSummarizingId(noticeId);
    try {
      const res = await api.post("/ai/summarize-notice", {
        title: noticeTitle,
        body: noticeBody,
      });
      setNoticeSummaries({
        ...noticeSummaries,
        [noticeId]: res.data,
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Summarization failed");
    } finally {
      setSummarizingId(null);
    }
  };

    // 6. Resident Native Text-To-Speech (Auto Hindi & English Detection)
  const handleSpeakNotice = (noticeId, speakTitle, speakBody) => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support text-to-speech audio.");
      return;
    }

    if (playingAudioId === noticeId) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = `${speakTitle}. ${speakBody}`.replace(/[#*_-]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

          // 1. Check if text is Hindi (Devanagari Unicode)
    const isHindi = /[\u0900-\u097F]/.test(cleanText);

          // 2. Set Language Code
    utterance.lang = isHindi ? "hi-IN" : "en-IN";
    utterance.rate = isHindi ? 0.9 : 0.95;

          // 3. Match Browser Voice
    const voices = window.speechSynthesis.getVoices();
    if (isHindi) {
      const hindiVoice = voices.find(
        (v) => v.lang === "hi-IN" || v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi")
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      const englishVoice = voices.find(
        (v) => v.lang === "en-IN" || v.lang === "en-US" || v.lang === "en-GB"
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    setPlayingAudioId(noticeId);
    window.speechSynthesis.speak(utterance);
  };

  // Filter calculations
  const availableMonths = Array.from(
    new Set(
      notices.map((n) => {
        const d = new Date(n.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
    )
  ).sort().reverse();

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

  // Render individual notice card
  const renderNoticeCard = (n) => {
    const trData = translatedNotices[n.id];
    const isTranslated = trData && trData.isTranslated;
    const displayTitle = isTranslated ? trData.translatedTitle : n.title;
    const displayBody = isTranslated ? trData.translatedBody : n.body;
    const summary = noticeSummaries[n.id];
    const isPlaying = playingAudioId === n.id;

    return (
      <div key={n.id} className={`notice-item-card ${n.is_important ? "notice-item-important" : ""}`}>
        <div className="notice-item-top">
          <h3 className="notice-item-title">{displayTitle}</h3>
          <div className="notice-item-header-meta">
            <span className="notice-official-tag">Official</span>
            {n.is_important && <span className="notice-important-badge">Priority</span>}
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

        {/* Smart Action Toolbar on every notice */}
        <div className="notice-smart-actions-bar">
          <button
            type="button"
            className={`notice-smart-btn ${isTranslated ? "active" : ""}`}
            onClick={() => handleTranslateNotice(n.id, n.title, n.body)}
            disabled={translatingId === n.id}
            title="Translate with AI"
          >
             {translatingId === n.id ? "Translating..." : isTranslated ? "View in English" : "हिंदी में पढ़ें"}
          </button>

          <button
            type="button"
            className={`notice-smart-btn ${summary ? "active" : ""}`}
            onClick={() => handleSummarizeNotice(n.id, n.title, n.body)}
            disabled={summarizingId === n.id}
            title="Summarize with AI"
          >
           {summarizingId === n.id ? "Summarizing..." : summary ? "Hide Summary" : "Quick Summary"}
          </button>

          <button
            type="button"
            className={`notice-smart-btn ${isPlaying ? "active-audio" : ""}`}
            onClick={() => handleSpeakNotice(n.id, displayTitle, displayBody)}
            title="Listen to notice"
          >
            {isPlaying ? "⏹️ Stop Audio" : "🔊 Listen"}
          </button>
        </div>

        {/* AI TL;DR Summary Card */}
        {summary && (
          <div className="notice-tldr-box">
            <div className="tldr-badge-row">
              <span className="tldr-pill">✨ AI Quick Summary</span>
              <span className="tldr-headline">{summary.one_liner}</span>
            </div>
            <ul className="tldr-bullets-list">
              {summary.summary_bullets && summary.summary_bullets.map((b, i) => (
                <li key={i} className="tldr-bullet-item">{b}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="notice-item-body">{displayBody}</p>

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
    );
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
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                if (showCreateForm) setShowAiDrawer(false);
              }}
            >
              {showCreateForm ? "Close Form" : "+ Publish Notice"}
            </button>
          )}
        </div>
      </div>

      {/* Admin Publish Notice Form */}
      {role === "admin" && showCreateForm && (
        <div className="notice-form-card">
          <div className="notice-form-header-row">
            <h3 className="notice-form-heading">Publish New Notice</h3>
            <button
              type="button"
              className={`ai-drafter-toggle-btn ${showAiDrawer ? "active" : ""}`}
              onClick={() => setShowAiDrawer(!showAiDrawer)}
            >
              ✨ {showAiDrawer ? "Hide AI Copilot" : "Draft with AI Copilot"}
            </button>
          </div>

          {/* AI Copilot Expansion Drawer */}
          {showAiDrawer && (
            <div className="ai-copilot-drawer">
              <div className="ai-drawer-header">
                <span className="ai-badge-pill">Gemini 1.5 Copilot</span>
                <span className="ai-drawer-hint">Enter rough keywords; AI will format a professional circular.</span>
              </div>

              {aiError && <div className="dashboard-error ai-error-box">{aiError}</div>}

              <div className="ai-input-group">
                <textarea
                  className="notice-input ai-prompt-textarea"
                  placeholder="e.g. Tank cleaning Sunday 10am to 4pm, save water in advance, lift 2 closed 1 hr"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="ai-options-row">
                <div className="ai-option-item">
                  <span className="ai-option-label">Tone:</span>
                  <select
                    className="notices-select-filter ai-select"
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                  >
                    <option value="routine">ℹ️ Routine Maintenance</option>
                    <option value="urgent">🚨 Urgent Emergency</option>
                    <option value="festive">🎉 Festive & Community</option>
                    <option value="strict">⚠️ Strict Rule & Fine</option>
                  </select>
                </div>

                <div className="ai-option-item">
                  <span className="ai-option-label">Language:</span>
                  <select
                    className="notices-select-filter ai-select"
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi (हिंदी)</option>
                    <option value="bilingual">Bilingual (English + Hindi)</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="ai-generate-action-btn"
                  onClick={handleGenerateAiNotice}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? "Generating Draft..." : "✨ Generate Draft"}
                </button>
              </div>
            </div>
          )}

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
                Notice Details (Editable)
              </label>
              <textarea
                id="notice-body"
                className="notice-input notice-textarea"
                placeholder="Write full details about the notice..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={5}
              />
            </div>

            <label className="notice-checkbox-wrapper">
              <input
                className="notice-checkbox"
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
              />
              Mark as High-Priority / Urgent (Pins notice to the top with priority badge)
            </label>

            <div className="notice-form-actions">
              <button className="notice-submit-btn" type="submit" disabled={submitting}>
                {submitting ? "Publishing..." : "Publish Notice 📢"}
              </button>
              <button
                type="button"
                className="notice-cancel-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  setShowAiDrawer(false);
                }}
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
              <option value="all">All Dates (1-31)</option>
              <option value="1-10">1st - 10th (Days 1-10)</option>
              <option value="11-20">11th - 20th (Days 11-20)</option>
              <option value="21-31">21st - End of Month (21-31)</option>
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
          <button type="button" className="notices-reset-filter-btn empty-state-reset-btn" onClick={resetFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pinned Section */}
      {pinnedNotices.length > 0 && (
        <div className="notices-section-block">
          <h3 className="notices-section-title">
            Important Circulars <span className="section-pill-count">{pinnedNotices.length}</span>
          </h3>
          <div className="notices-feed">
            {pinnedNotices.map((n) => renderNoticeCard(n))}
          </div>
        </div>
      )}

      {/* Regular Section */}
      {regularNotices.length > 0 && (
        <div className="notices-section-block">
          {pinnedNotices.length > 0 && (
            <h3 className="notices-section-title">General Announcements ({regularNotices.length})</h3>
          )}
          <div className="notices-feed">
            {regularNotices.map((n) => renderNoticeCard(n))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notices;
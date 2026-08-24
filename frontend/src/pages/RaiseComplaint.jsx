import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./RaiseComplaint.css";

const PRESET_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleanliness",
  "Elevator / Lift",
  "Security",
  "Other",
];

function RaiseComplaint() {
  const [category, setCategory] = useState("Plumbing");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const finalCategory = category === "Other" && customCategory ? customCategory : category;

    const formData = new FormData();
    formData.append("category", finalCategory);
    formData.append("description", description);
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      await api.post("/complaints/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to raise complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="raise-complaint-page">
      <div className="raise-back-nav">
        <Link to="/dashboard" className="raise-back-link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="raise-card">
        <div className="raise-header">
          <h2 className="raise-title">Raise a Complaint</h2>
          <p className="raise-subtitle">
            Submit your maintenance issue with optional photo evidence for society management.
          </p>
        </div>

        {error && <div className="raise-alert-error">{error}</div>}

        <form className="raise-form" onSubmit={handleSubmit}>
          {/* Category Chips Selector */}
          <div className="raise-form-group">
            <label className="raise-label">Category</label>
            <div className="category-chips-wrapper">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip-btn ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {category === "Other" && (
              <input
                className="raise-input"
                type="text"
                placeholder="Specify custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            )}
          </div>

          {/* Description */}
          <div className="raise-form-group">
            <div className="raise-label-row">
              <label className="raise-label" htmlFor="complaint-desc">
                Description
              </label>
              <span className="raise-char-count">{description.length} characters</span>
            </div>
            <textarea
              id="complaint-desc"
              className="raise-input raise-textarea"
              placeholder="Provide specific details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          {/* Photo Upload with Preview */}
          <div className="raise-form-group">
            <label className="raise-label">Photo Attachment (Optional)</label>
            {!photoPreview ? (
              <input
                className="raise-file-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            ) : (
              <div className="photo-preview-box">
                <img src={photoPreview} alt="Preview" className="preview-thumbnail" />
                <div className="preview-info">
                  <span className="preview-name">{photo?.name}</span>
                  <span className="preview-size">{(photo?.size / 1024).toFixed(1)} KB</span>
                </div>
                <button type="button" className="preview-remove-btn" onClick={removePhoto}>
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button className="raise-submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting Complaint..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RaiseComplaint;
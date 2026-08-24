import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css";

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="verify-card" style={{ maxWidth: 440, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "36px 28px" }}>
        <h2 className="auth-title" style={{ marginBottom: 8 }}>Set New Password</h2>
        <p className="auth-subtitle" style={{ marginBottom: 20 }}>
          Create a new, strong password for your account.
        </p>

        {error && <div className="auth-alert-error">{error}</div>}

        {success ? (
          <div>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: 14, borderRadius: 6, fontSize: "0.88rem", marginBottom: 20 }}>
              Password reset successfully! Redirecting to Sign In...
            </div>
            <Link to="/login" className="auth-submit-btn" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
              Sign In Now
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
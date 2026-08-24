import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./ResetPassword.css";

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
    <div className="reset-page-container">
      <div className="reset-card">
        <h2 className="reset-title">Set New Password</h2>
        <p className="reset-subtitle">
          Create a new, strong password for your account.
        </p>

        {error && <div className="reset-alert-error">{error}</div>}

        {success ? (
          <div>
            <div className="reset-alert-success">
              Password reset successfully! Redirecting to Sign In...
            </div>
            <Link to="/login" className="reset-submit-btn">
              Sign In Now
            </Link>
          </div>
        ) : (
          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="reset-form-group">
              <label className="reset-form-label">New Password</label>
              <input
                className="reset-form-input"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="reset-form-group">
              <label className="reset-form-label">Confirm Password</label>
              <input
                className="reset-form-input"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className="reset-submit-btn" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
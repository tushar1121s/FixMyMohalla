import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page-container">
      <div className="forgot-card">
        <h2 className="forgot-title">Reset Password</h2>
        <p className="forgot-subtitle">
          Enter your registered email address to receive password reset instructions.
        </p>

        {error && <div className="forgot-alert-error">{error}</div>}

        {submitted ? (
          <div>
            <div className="forgot-alert-success">
              Password reset link has been sent to your email. Please check your inbox and spam folder.
            </div>
            <Link to="/login" className="forgot-submit-btn">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="forgot-form-group">
              <label className="forgot-form-label" htmlFor="reset-email">
                Email Address
              </label>
              <input
                id="reset-email"
                className="forgot-form-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="forgot-submit-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="forgot-footer">
              <Link className="forgot-back-link" to="/login">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

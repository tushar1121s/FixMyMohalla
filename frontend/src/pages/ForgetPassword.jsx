import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Login.css";

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
    <div className="auth-page-container">
      <div className="verify-card" style={{ maxWidth: 440, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "36px 28px" }}>
        <h2 className="auth-title" style={{ marginBottom: 8 }}>Reset Password</h2>
        <p className="auth-subtitle" style={{ marginBottom: 20 }}>
          Enter your registered email address to receive password reset instructions.
        </p>

        {error && <div className="auth-alert-error">{error}</div>}

        {submitted ? (
          <div>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: 14, borderRadius: 6, fontSize: "0.88rem", marginBottom: 20 }}>
              Password reset link has been sent to your email. Please check your inbox and spam folder.
            </div>
            <Link to="/login" className="auth-submit-btn" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                className="form-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="auth-footer" style={{ marginTop: 16 }}>
              <Link className="auth-footer-link" to="/login">← Back to Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
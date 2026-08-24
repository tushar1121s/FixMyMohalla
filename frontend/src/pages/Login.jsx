import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const { access_token, role } = res.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        {/* Left Side: Branding & Info */}
        <div className="auth-banner-side">
          <div>
            <span className="auth-brand-label">FixMyMohalla</span>
            <h2 className="auth-banner-heading">Society Complaint Management</h2>
            <p className="auth-banner-description">
              A transparent, accountable platform to register and resolve maintenance issues across your society.
            </p>

            <ul className="auth-value-props">
              <li className="auth-prop-item">
                <span className="auth-prop-bullet"></span>
                <span>Track complaints with status history and photo evidence</span>
              </li>
              <li className="auth-prop-item">
                <span className="auth-prop-bullet"></span>
                <span>Real-time resolution updates from society administration</span>
              </li>
              <li className="auth-prop-item">
                <span className="auth-prop-bullet"></span>
                <span>Direct access to official announcements and notice board</span>
              </li>
            </ul>
          </div>

          <div className="auth-banner-footer">
            FixMyMohalla Platform
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="auth-form-side">
          <div className="auth-header">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">Enter your email and password to access your account</p>
          </div>

          {error && <div className="auth-alert-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  className="form-input password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link className="auth-footer-link" to="/register">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
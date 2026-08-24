import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    flat_no: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card-wrapper">
        {/* Left Side: Branding & Info */}
        <div className="register-banner-side">
          <div>
            <span className="register-brand-label">FixMyMohalla</span>
            <h2 className="register-banner-heading">Resident Registration</h2>
            <p className="register-banner-description">
              Create an account to raise maintenance requests, monitor resolution progress, and stay updated with society notices.
            </p>

            <ul className="register-value-props">
              <li className="register-prop-item">
                <span className="register-prop-bullet"></span>
                <span>Direct complaint submission to society management</span>
              </li>
              <li className="register-prop-item">
                <span className="register-prop-bullet"></span>
                <span>Transparent audit timeline and resolution records</span>
              </li>
              <li className="register-prop-item">
                <span className="register-prop-bullet"></span>
                <span>Secure email authentication and notifications</span>
              </li>
            </ul>
          </div>

          <div className="register-banner-footer">
            FixMyMohalla Platform
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="register-form-side">
          <div className="register-header">
            <h2 className="register-title">Create Account</h2>
            <p className="register-subtitle">Enter your details to register as a resident</p>
          </div>

          {error && <div className="register-alert-error">{error}</div>}

          {success ? (
            <div className="register-alert-success">
              <div className="register-success-title">Registration Successful</div>
              <p>Please check your email inbox to verify your account before signing in.</p>
              <Link to="/login" className="register-success-link-btn">
                Proceed to Sign In
              </Link>
            </div>
          ) : (
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="register-form-group">
                <label className="register-form-label" htmlFor="register-name">
                  Full Name
                </label>
                <input
                  id="register-name"
                  className="register-form-input"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="register-email">
                  Email Address
                </label>
                <input
                  id="register-email"
                  className="register-form-input"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="register-flat">
                  Flat / Apartment Number (Optional)
                </label>
                <input
                  id="register-flat"
                  className="register-form-input"
                  type="text"
                  name="flat_no"
                  placeholder="e.g. Flat B-402"
                  value={form.flat_no}
                  onChange={handleChange}
                />
              </div>

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="register-password">
                  Password
                </label>
                <div className="register-password-wrapper">
                  <input
                    id="register-password"
                    className="register-form-input register-password-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="register-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button className="register-submit-btn" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Create Resident Account"}
              </button>
            </form>
          )}

          <div className="register-footer">
            Already registered?{" "}
            <Link className="register-footer-link" to="/login">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
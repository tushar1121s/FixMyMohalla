import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import "./VerifyEmail.css";

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.detail || "Verification failed or token expired.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="verify-page-container">
      <div className="verify-card">
        <h2 className="verify-title">Email Verification</h2>

        {status === "verifying" && (
          <p className="verify-desc">
            Please wait while your email address is being verified...
          </p>
        )}

        {status === "success" && (
          <div className="verify-success-block">
            <div className="verify-alert-success">{message}</div>
            
            <p className="verify-welcome-text">
              Welcome to <strong>FixMyMohalla</strong>! Your resident account is now active.
            </p>

            <div className="verify-creator-signature">
              <span className="verify-creator-label">Platform Architect:</span>
              <span className="verify-creator-name">Tushar Kumar · VIT Chennai</span>
              <div className="verify-social-row">
                <a
                  href="https://www.instagram.com/kum_tushar_1407/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="verify-social-pill"
                >
                  <svg className="verify-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                </a>
                <a
                  href="https://github.com/tushar1121s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="verify-social-pill"
                >
                  <svg className="verify-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/tushar-kumar-bb3ab128a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="verify-social-pill"
                >
                  <svg className="verify-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            <Link to="/login" className="verify-login-btn">
              Proceed to Sign In →
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="verify-error-block">
            <div className="verify-alert-error">{message}</div>
            <Link to="/login" className="verify-login-btn">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
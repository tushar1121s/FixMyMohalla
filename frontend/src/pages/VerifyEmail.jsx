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
          <>
            <div className="verify-alert-success">{message}</div>
            <Link to="/login" className="verify-btn">
              Proceed to Sign In
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="verify-alert-error">{message}</div>
            <Link to="/login" className="verify-btn">
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.detail || "Verification failed");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-container card">
      <h2>Email Verification</h2>
      {status === "verifying" && <p className="verify-status">Verifying your email...</p>}
      {status === "success" && (
        <>
          <p>{message}</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="alert-error">{message}</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
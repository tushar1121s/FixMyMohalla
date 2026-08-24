import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    flat_no: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="auth-container card">
      <h1>Register</h1>
      {error && <p className="alert-error">{error}</p>}
      {success && (
        <p className="alert-error" style={{ background: "var(--color-success)", color: "white" }}>
          Registered! Please check your email to verify your account before logging in.
        </p>
      )}
      {!success && (
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            type="text"
            name="flat_no"
            placeholder="Flat No (optional)"
            value={form.flat_no}
            onChange={handleChange}
          />
          <button className="btn btn-primary" type="submit">Register</button>
        </form>
      )}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
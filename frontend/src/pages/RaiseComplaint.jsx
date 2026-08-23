import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";


function RaiseComplaint() {
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const formData = new FormData();
        formData.append("category", category);
        formData.append("description", description);
        if (photo) {
            formData.append("photo", photo);
        }

        try {
            await api.post("/complaints/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to raise complaint");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-container card">
            <h2>Raise Complaint</h2>
            {error && <p className="alert-error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    className="input"
                    type="text"
                    placeholder="Category (e.g. Plumbing, Electrical, etc ... )"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                <textarea
                    className="input"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                />
                <input
                    className="file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                />
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
            </form>
            <p>
                <Link to="/dashboard">Back to Dashboard</Link>
            </p>
        </div>
    );
}

export default RaiseComplaint;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", flat_no: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setProfileForm({
          name: res.data.name || "",
          flat_no: res.data.flat_no || "",
        });
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
      });
  }, [navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const res = await api.patch("/auth/me", profileForm);
      setUser(res.data);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/auth/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading-text">Loading account profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Header */}
      <div className="profile-header">
        <h2 className="profile-title">Account Settings</h2>
        <p className="profile-subtitle">Manage your personal identification details and account security credentials</p>
      </div>

      {/* User Card Banner */}
      <div className="profile-card-banner">
        <div className="profile-avatar-circle">{getInitials(user.name)}</div>
        <div className="profile-identity-info">
          <div className="profile-user-name">{user.name}</div>
          <div className="profile-meta-row">
            <span className="profile-email-text">{user.email}</span>
            {user.is_verified ? (
              <span className="badge-verified-pill">Verified Account</span>
            ) : (
              <span className="badge-unverified-pill">Unverified</span>
            )}
            <span className="profile-role-tag">
              Role: {user.role}
            </span>
            <span className="profile-member-id">Member #{user.id}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="profile-sections-grid">
        {/* Section 1: Profile Details */}
        <div className="profile-section-card">
          <h3 className="section-card-title">Personal Details</h3>
          <p className="section-card-desc">Update your registered display name and apartment unit number</p>

          {profileSuccess && <div className="profile-alert-success">{profileSuccess}</div>}
          {profileError && <div className="profile-alert-error">{profileError}</div>}

          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="profile-form-group">
              <label className="profile-form-label">Email Address</label>
              <input className="profile-form-input" type="email" value={user.email} disabled />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Full Name</label>
              <input
                className="profile-form-input"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Flat / Room Number</label>
              <input
                className="profile-form-input"
                type="text"
                placeholder="e.g. Flat A-204"
                value={profileForm.flat_no}
                onChange={(e) => setProfileForm({ ...profileForm, flat_no: e.target.value })}
              />
            </div>

            <button className="profile-save-btn" type="submit" disabled={profileLoading}>
              {profileLoading ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </form>
        </div>

        {/* Section 2: Change Password */}
        <div className="profile-section-card">
          <h3 className="section-card-title">Security & Password</h3>
          <p className="section-card-desc">Ensure your account uses a secure, non-reused password</p>

          {passwordSuccess && <div className="profile-alert-success">{passwordSuccess}</div>}
          {passwordError && <div className="profile-alert-error">{passwordError}</div>}

          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <div className="profile-form-group">
              <label className="profile-form-label">Current Password</label>
              <input
                className="profile-form-input"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                required
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">New Password</label>
              <input
                className="profile-form-input"
                type="password"
                placeholder="Minimum 6 characters"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Confirm New Password</label>
              <input
                className="profile-form-input"
                type="password"
                placeholder="Re-type new password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                required
              />
            </div>

            <button className="profile-save-btn" type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;

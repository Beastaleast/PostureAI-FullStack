import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");


  if (!user) return null;

  const handleSave = () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) return setMessage("Name cannot be empty.");
    if (!cleanEmail) return setMessage("Email cannot be empty.");

    const result = updateUser({ name: cleanName, email: cleanEmail });
    if (!result.success) {
      setMessage(result.message);
      return;
    }

    setIsEditing(false);
    setMessage("Profile updated successfully.");
    window.setTimeout(() => setMessage(""), 3000);
  };

  const handleCancel = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setIsEditing(false);
    setMessage("");
  };

  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and account details.</p>
        </div>
        <button className="profile-back-button" onClick={() => navigate("/dashboard")}>← Dashboard</button>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">{initial}</div>
          <h2>{user.name || "User"}</h2>
          <p className="profile-email">{user.email}</p>
          <span className="profile-role">Posture Monitoring User</span>
        </div>

        <div className="profile-details-card">
          <div className="profile-section-header">
            <div>
              <h2>Personal Information</h2>
              <p>Keep your account details up to date.</p>
            </div>
            {!isEditing && (
              <button className="edit-profile-button" onClick={() => { setName(user?.name || ""); setEmail(user?.email || ""); setMessage(""); setIsEditing(true); }}>Edit Profile</button>
            )}
          </div>

          {message && <div className="profile-message">{message}</div>}

          <div className="profile-form-group">
            <label htmlFor="profile-name">Full Name</label>
            {isEditing ? (
              <input id="profile-name" type="text" value={name} onChange={(event) => setName(event.target.value)} />
            ) : (
              <div className="profile-value">{user.name || "Not provided"}</div>
            )}
          </div>

          <div className="profile-form-group">
            <label htmlFor="profile-email">Email Address</label>
            {isEditing ? (
              <input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            ) : (
              <div className="profile-value">{user.email || "Not provided"}</div>
            )}
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button type="button" className="cancel-profile-button" onClick={handleCancel}>Cancel</button>
              <button type="button" className="save-profile-button" onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>
      </div>

      <div className="account-info-card">
        <div className="account-info-header">
          <div>
            <span className="panel-kicker">ACCOUNT DETAILS</span>
            <h2>Account Information</h2>
            <p>Overview of your PostureAI account.</p>
          </div>
        </div>

        <div className="account-info-grid">
          <div className="account-info-item"><span className="account-info-icon">@</span><div><span>Account Name</span><strong>{user.name || "Not provided"}</strong></div></div>
          <div className="account-info-item"><span className="account-info-icon">✉</span><div><span>Email</span><strong>{user.email || "Not provided"}</strong></div></div>
          <div className="account-info-item"><span className="account-info-icon">P</span><div><span>Service</span><strong>AI Posture Monitoring</strong></div></div>
          <div className="account-info-item"><span className="account-info-icon">✓</span><div><span>Account Status</span><strong className="account-active">Active</strong></div></div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

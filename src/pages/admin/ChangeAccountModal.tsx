import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import "./ChangeAccountModal.css";

interface ChangeAccountModalProps {
  onClose: () => void;
  refreshUser: () => Promise<void>;
}

const ChangeAccountModal: React.FC<ChangeAccountModalProps> = ({ onClose }) => {
  const { user, logout } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (!user) {
        setError("User not authenticated.");
        return;
      }

      // Update username and/or email
      await axiosInstance.put(`/users/${user.id}`, {
        username,
        email,
      });

      // If password fields are filled, change password
      if (currentPassword && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          setError("New passwords do not match.");
          return;
        }

        await axiosInstance.post("/auth/change-password", {
          currentPassword,
          password: newPassword,
          passwordConfirmation: confirmPassword,
        });

        setMessage("Account and password updated successfully.");
        logout(); // Force re-login for security
        return;
      }

      setMessage("Account information updated successfully.");
    } catch (err: any) {
      const apiError =
        err.response?.data?.error?.message || "An error occurred.";
      setError(apiError);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Change Account Info</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <hr />
          <label>
            Current Password:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm New Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="modal-buttons">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeAccountModal;

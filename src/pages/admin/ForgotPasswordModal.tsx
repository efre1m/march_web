import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./ForgotPasswordModal.css";

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setMessage(
        "If this email is registered, a password reset link has been sent. Please check your inbox."
      );
      // Optional: auto-close modal after 3 seconds
      // setTimeout(() => onClose(), 3000);
    } catch (err: any) {
      const apiError =
        err.response?.data?.error?.message || "Failed to send reset email.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Forgot Password</h2>
        <p>Enter your email address to receive password reset instructions.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="modal-buttons">
            <button type="submit" disabled={loading || !email.trim()}>
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

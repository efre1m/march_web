import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      setMessage("Missing reset token.");
      setIsError(true);
      return;
    }

    if (password !== passwordConfirmation) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:1337/api/auth/reset-password", {
        code,
        password,
        passwordConfirmation,
      });

      setMessage("Password reset successful! Redirecting to login...");
      setIsError(false);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setIsError(true);
      setMessage(
        err.response?.data?.error?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2>Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="reset-form">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Return to login button */}
        <button
          type="button"
          className="return-login-button"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Return to Login
        </button>

        {message && (
          <p className={isError ? "reset-error" : "reset-success"}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

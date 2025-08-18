import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "./ForgotPasswordModal"; // Import the modal
import "./login.css";

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const success = await login(identifier, password);
    setLoading(false);

    if (success) {
      navigate("/admin");
    } else {
      setError("Invalid username/email or password");
    }
  };

  const openForgotModal = () => {
    setError(null);
    setShowForgotModal(true);
  };

  return (
    <div className="login-container">
      <h1 className="login-header">Welcome Back</h1>

      <form onSubmit={handleSubmit} noValidate className="login-form">
        <label htmlFor="identifier" className="login-label">
          Username or Email
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          disabled={loading}
          className="login-input"
        />

        <label htmlFor="password" className="login-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
          className="login-input"
        />

        <button type="submit" disabled={loading} className="login-button">
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
      </form>

      <button
        type="button"
        onClick={openForgotModal}
        className="forgot-password-button"
        disabled={loading}
      >
        Forgot Password?
      </button>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};

export default Login;

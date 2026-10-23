import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/useAuth";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Show / Hide password
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    const result = login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/dashboard", { state: { successMessage: "Welcome back! You are signed in." } });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-header">
          <h1>Welcome Back</h1>

          <p>
            Login to your posture detection account
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

          </div>

          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Remember Me + Forgot Password */}
          <div className="form-options">

            <label className="remember-me">

              <input
                type="checkbox"
              />

              <span>
                Remember me
              </span>

            </label>

            <span className="form-helper-text">Use the account details you registered with.</span>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="auth-button"
          >
            Login
          </button>

        </form>

        <div className="auth-footer">

          <p>
            Don't have an account?{" "}

            <Link to="/register">
              Create Account
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;
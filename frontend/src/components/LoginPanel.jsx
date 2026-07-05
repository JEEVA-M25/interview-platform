import { useState } from "react";
import { postJson } from "../services/api.js";

function LoginPanel({ onLogin, onSwitchToRegister }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const session = await postJson("/api/auth/login", credentials);
      const role = session?.role || session?.user?.role;

      if (!role) {
        throw new Error(
          "We could not determine your account role. Please try again.",
        );
      }

      onLogin({ ...session, role });
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <form className="auth-card login-panel" onSubmit={handleSubmit}>
      <div className="auth-card-head">
        <h2>Welcome back</h2>
        <p>Sign in to continue to your dashboard.</p>
      </div>

      <div className="auth-fields">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={credentials.email}
          onChange={(event) =>
            setCredentials({ ...credentials, email: event.target.value })
          }
          placeholder="you@company.com"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={credentials.password}
          onChange={(event) =>
            setCredentials({ ...credentials, password: event.target.value })
          }
          placeholder="Enter your password"
          required
        />
      </div>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>
      <p className="auth-switch">
        New here?
        <button
          type="button"
          className="text-button"
          onClick={onSwitchToRegister}
        >
          Create an account
        </button>
      </p>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

export default LoginPanel;

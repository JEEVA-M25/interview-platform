import { useState } from "react";
import { postJson } from "../services/api.js";
import { AtSign, Lock } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto px-8 md:px-12 py-8">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Welcome back</h2>
        <p className="text-slate-500 font-medium">Sign in to continue to your dashboard</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-400">
              <AtSign className="w-5 h-5" />
            </div>
            <input
              id="login-email"
              type="email"
              value={credentials.email}
              onChange={(event) =>
                setCredentials({ ...credentials, email: event.target.value })
              }
              placeholder="skcetstaff1@gmail.com"
              required
              className="w-full pl-12 pr-4 py-3 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="login-password"
              type="password"
              value={credentials.password}
              onChange={(event) =>
                setCredentials({ ...credentials, password: event.target.value })
              }
              placeholder="••••••••"
              required
              className="w-full pl-12 pr-4 py-3 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-orange-200 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-orange-500"
          />
          <span className="text-sm font-semibold text-slate-500">Remember me</span>
        </label>
        <span className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline cursor-pointer">
          Forgot password?
        </span>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full mt-8 py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </form>
  );
}

export default LoginPanel;
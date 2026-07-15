import { useState } from "react";
import { postJson } from "../services/api.js";
import { User, AtSign, Lock, Phone, Building2, GraduationCap, Calendar } from "lucide-react";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  college: "",
  degree: "",
  graduationYear: "",
};

function RegisterPanel({ onSwitchToLogin }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setSuccess("");

    try {
      const response = await postJson("/api/auth/register/student", form);
      setForm({ ...initialForm, email: response.email });
      setSuccess(response.message);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto px-8 md:px-12 py-6">
      <div className="mb-5 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1.5">Create your account</h2>
        <p className="text-slate-500 font-medium text-sm">
          Register to manage your profile and run resume analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Full name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
              <User className="w-4 h-4" />
            </div>
            <input
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="John Doe"
              required
              className="w-full pl-10 pr-3 py-2 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="skcetstaff1@gmail.com"
              required
              className="w-full pl-10 pr-3 py-2 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="••••••••"
              minLength="6"
              required
              className="w-full pl-10 pr-3 py-2 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Phone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full pl-10 pr-3 py-2 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            College
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              value={form.college}
              onChange={(event) => updateField("college", event.target.value)}
              placeholder="Stanford University"
              className="w-full pl-10 pr-3 py-2 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Degree
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <input
              value={form.degree}
              onChange={(event) => updateField("degree", event.target.value)}
              placeholder="B.S. Computer Science"
              className="w-full pl-10 pr-3 py-2 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Graduation year
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              value={form.graduationYear}
              onChange={(event) =>
                updateField("graduationYear", event.target.value)
              }
              placeholder="2025"
              className="w-full pl-10 pr-3 py-2 bg-white/90 border border-orange-100 hover:border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 outline-none text-slate-800 text-sm placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full mt-5 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading"
          ? "Creating account..."
          : "Create student account"}
      </button>

      {success && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 text-xs">{success}</p>
        </div>
      )}
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}
    </form>
  );
}

export default RegisterPanel;
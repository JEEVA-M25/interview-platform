import {
  LayoutGrid,
  Sparkles,
  BriefcaseBusiness,
  FileText,
  CircleGauge,
  Settings,
  LogOut,
} from "lucide-react";

function SidebarNav({ role, activeView, onNavigate, onLogout }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "ats-score", label: "ATS Resume Analysis", icon: Sparkles },
    { key: "job-applications", label: "Job Matching", icon: BriefcaseBusiness },
    { key: "students", label: "Students", icon: FileText, adminOnly: true },
    { key: "settings", label: "Settings", icon: Settings },
  ].filter((item) => !item.adminOnly || role === "ADMIN");

  return (
    <aside className="hidden w-72 shrink-0 flex-col rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_25px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur lg:flex">
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 p-4 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-80">
          CareerVerse AI
        </p>
        <p className="mt-2 text-xl font-semibold">Learning & Career Platform</p>
      </div>

      <nav className="space-y-2">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${activeView === key ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Need help?</p>
        <p className="mt-1 text-sm text-slate-600">
          Keep your profile, applications, and prep plan moving.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default SidebarNav;

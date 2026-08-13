import {
  LayoutGrid,
  FileText,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Clock3,
  BriefcaseBusiness,
  UserCircle2,
  Settings2,
  HelpCircle,
  Crown,
  Menu,
  BookOpen
} from "lucide-react";

const navItemsMain = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "readiness", label: "Placement Readiness", icon: Crown },
  { key: "ats-score", label: "ATS Analysis", icon: FileText },
  { key: "interview", label: "AI Interview", icon: BrainCircuit },
  { key: "job-applications", label: "Job Matching", icon: Sparkles },
  { key: "recommendations", label: "Recommendations", icon: BookOpen },
];

const navItemsSecondary = [
  { key: "progress", label: "Progress Dashboard", icon: TrendingUp },
  { key: "history", label: "Interview History", icon: Clock3 },
  { key: "ats-history", label: "ATS History", icon: FileText },
  { key: "job-match-history", label: "Job Match History", icon: BriefcaseBusiness },
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "settings", label: "Settings", icon: Settings2 },
];

export default function Sidebar({ user, activeView, onNavigate, isVisible = true, toggleSidebar }) {
  return (
    <aside className={`w-[280px] fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col z-40 overflow-y-auto transition-transform duration-300 ${isVisible ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Brand */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2.5 shrink-0 text-left">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm shadow-orange-200">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">CareerVerse AI</p>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Student Workspace</p>
          </div>
        </button>
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        <div className="space-y-1.5">
          {navItemsMain.map(({ key, label, icon: Icon }) => {
            const isActive = activeView === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5">
          {navItemsSecondary.map(({ key, label, icon: Icon, isNew }) => {
            const isActive = activeView === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Upgrade Box
      <div className="px-4 pb-6">
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-orange-600 font-bold">
            <Crown className="h-5 w-5" />
            <h4 className="text-sm">Upgrade Your Journey</h4>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
            Unlock advanced insights, mock tests, and personalized career guidance.
          </p>
          <button className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-transform">
            Go Premium
          </button>
        </div>
      </div> */}



      {/* Footer / Support */}
      <div className="px-4 pb-6 border-t border-slate-100 pt-4 mt-auto">
        <button className="flex items-center justify-between w-full p-2 text-slate-500 hover:text-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-indigo-500" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold">Need Help?</p>
              <p className="text-[10px] text-slate-400">Contact Support</p>
            </div>
          </div>
          <span className="text-slate-300">›</span>
        </button>
      </div>
    </aside>
  );
}

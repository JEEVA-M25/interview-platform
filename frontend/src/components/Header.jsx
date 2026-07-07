import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  LayoutGrid,
  LogOut,
  Settings2,
  Sparkles,
  UserCircle2,
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "applications", label: "Applications", icon: BriefcaseBusiness },
  { key: "ats-score", label: "ATS Score", icon: FileText },
  { key: "job-applications", label: "Job Matching", icon: Sparkles },
];

function Header({ user, activeView, onLogout, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function handleScroll() { setScrolled(window.scrollY > 4); }
    handleScroll();
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const profileLabel = user?.fullName || user?.email || "Profile";
  const initials = profileLabel.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-sm shadow-orange-100 border-b border-orange-100" : "bg-white border-b border-orange-100"}`}>
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">

        {/* Brand */}
        <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm shadow-orange-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900 tracking-tight">CareerVerse AI</p>
            <p className="text-[10px] text-orange-500 font-medium">{user?.role?.toLowerCase()} workspace</p>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeView === key
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-200"
                  : "text-gray-500 hover:text-gray-800 hover:bg-orange-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{profileLabel}</p>
              <p className="text-[10px] text-gray-400">{user?.role === "ADMIN" ? "Admin" : "Student"}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-orange-100/60 border border-orange-100 overflow-hidden z-50">
              <div className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{profileLabel}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-1.5">
                {[
                  { icon: UserCircle2, label: "My Profile", view: "profile" },
                  { icon: Settings2, label: "Settings", view: "settings" },
                  { icon: FileText, label: "Resume", view: "profile" },
                ].map(({ icon: Icon, label, view }) => (
                  <button
                    key={label}
                    onClick={() => { onNavigate(view); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="border-t border-orange-100 py-1.5">
                <button
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

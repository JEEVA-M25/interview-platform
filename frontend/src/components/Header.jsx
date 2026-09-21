import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  FileText,
  LayoutGrid,
  LogOut,
  Settings2,
  Sparkles,
  UserCircle2,
  Bell,
  ChevronDown,
  Menu
} from "lucide-react";

const navItems = [
  { key: "dashboard",        label: "Dashboard",       icon: LayoutGrid },
  { key: "interview",        label: "Interview",       icon: BrainCircuit },
  { key: "ats-score",        label: "ATS Score",       icon: FileText },
  { key: "job-applications", label: "Job Matching",    icon: BriefcaseBusiness },
  { key: "recommendations",  label: "Recommendations", icon: Sparkles },
];
import { BriefcaseBusiness } from "lucide-react";

navItems[3].icon = BriefcaseBusiness;

function Header({ user, activeView, onLogout, onNavigate, toggleSidebar, isSidebarOpen }) {
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

  const [profilePic, setProfilePic] = useState(user?.profilePictureUrl);

  useEffect(() => {
    setProfilePic(user?.profilePictureUrl);
  }, [user]);

  useEffect(() => {
    function handleStorage() {
      const stored = JSON.parse(localStorage.getItem("careerverse_user") || "{}");
      if (stored.profilePictureUrl) setProfilePic(stored.profilePictureUrl);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const profileLabel = user?.fullName || user?.email || "Profile";
  const initials = profileLabel.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "WS";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-slate-50/90 backdrop-blur shadow-sm" : "bg-slate-50"}`}>
      <div className="mx-auto px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Left Hamburger Toggle */}
        <div className="w-10 shrink-0 flex items-center">
          {user?.role === "STUDENT" && activeView !== "interview" && !isSidebarOpen && (
            <button 
              onClick={toggleSidebar} 
              className="text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Center Pill Nav */}
        <nav className="flex items-center gap-2 bg-white rounded-full px-2 py-2 shadow-sm border border-slate-100 mx-auto">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                activeView === key
                  ? "text-orange-500 bg-orange-50 shadow-sm border border-orange-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-orange-500 border-2 border-slate-50"></span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-white transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-extrabold shadow-md overflow-hidden">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="text-left leading-tight hidden md:block">
                <p className="text-sm font-bold text-slate-800 max-w-[120px] truncate">{profileLabel}</p>
                <p className="text-xs text-slate-500 font-medium">{user?.role === "ADMIN" ? "Admin" : "Student"}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 hidden md:block ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{profileLabel}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1.5">
                  {[
                    { icon: UserCircle2, label: "My Profile", view: "profile" },
                    { icon: Settings2, label: "Settings", view: "settings" },
                  ].map(({ icon: Icon, label, view }) => (
                    <button
                      key={label}
                      onClick={() => { onNavigate(view); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-slate-400" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 py-1.5">
                  <button
                    onClick={() => { onLogout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;

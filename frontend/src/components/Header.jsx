import { useEffect, useState } from "react";
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

function Header({ user, activeView, onLogout, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".profile-menu-wrap")) {
        setMenuOpen(false);
      }
    }

    function handleScroll() {
      setScrolled(window.scrollY > 4);
    }

    handleScroll();
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handleNavigate(section, targetId) {
    setMenuOpen(false);
    onNavigate?.(section);

    if (typeof window === "undefined") {
      return;
    }

    const target = targetId ? document.getElementById(targetId) : null;

    if (target) {
      setTimeout(
        () => target.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }
  }

  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  const profileLabel = user?.fullName || user?.email || user?.role || "Profile";
  const initials =
    profileLabel
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "applications", label: "Applications", icon: BriefcaseBusiness },
    { key: "ats-score", label: "ATS", icon: FileText },
    { key: "job-applications", label: "Job Matching", icon: Sparkles },
  ];

  return (
    <header className={`app-header ${scrolled ? "is-scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label="CareerVerse AI home">
        <span className="brand-mark">CV</span>
        <span className="brand-copy">
          <strong>CareerVerse AI</strong>
          <small>
            {user
              ? `${user.role.toLowerCase()} workspace`
              : "interview readiness platform"}
          </small>
        </span>
      </a>

      {user && (
        <div className="header-actions">
          <nav className="header-nav" aria-label="Quick tools">
            {navItems.map(({ key, label, icon: Icon }) => {
              const isActive = activeView === key;

              return (
                <button
                  key={key}
                  type="button"
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => handleNavigate(key)}
                >
                  <Icon className="nav-item-icon" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="profile-menu-wrap">
            <button
              type="button"
              className="profile-trigger"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="profile-avatar">{initials}</span>
              <span className="profile-meta">
                <span className="profile-name">{profileLabel}</span>
                <span className="profile-role">
                  {user.role === "ADMIN" ? "Admin" : "Student"}
                </span>
              </span>
              <ChevronDown className="profile-caret" />
            </button>

            {menuOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="dropdown-head">
                  <span className="profile-avatar large">{initials}</span>
                  <div>
                    <p className="dropdown-user-name">{profileLabel}</p>
                    <p className="dropdown-user-email">
                      {user.email || "No email available"}
                    </p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleNavigate("profile")}
                >
                  <UserCircle2 className="dropdown-item-icon" />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleNavigate("settings")}
                >
                  <Settings2 className="dropdown-item-icon" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleNavigate("profile")}
                >
                  <FileText className="dropdown-item-icon" />
                  <span>Resume</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleNavigate("dashboard")}
                >
                  <Sparkles className="dropdown-item-icon" />
                  <span>Help</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item danger"
                  onClick={handleLogout}
                >
                  <LogOut className="dropdown-item-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

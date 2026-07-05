import { useState } from "react";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import LoginPanel from "./components/LoginPanel.jsx";
import RegisterPanel from "./components/RegisterPanel.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("careerverse-session");
    return saved ? JSON.parse(saved) : null;
  });
  const [authView, setAuthView] = useState("login");
  const [activeView, setActiveView] = useState("dashboard");

  function handleLogin(session) {
    setUser(session);
    setActiveView("dashboard");
    localStorage.setItem("careerverse-session", JSON.stringify(session));
  }

  function handleLogout() {
    setUser(null);
    setActiveView("dashboard");
    localStorage.removeItem("careerverse-session");
  }

  return (
    <div className="app-shell" id="top">
      <Header
        user={user}
        activeView={activeView}
        onLogout={handleLogout}
        onNavigate={setActiveView}
      />

      <main>
        {!user && (
          <>
            <section className="landing-hero">
              <div className="hero-copy">
                <p className="eyebrow">CareerVerse access</p>
                <h1>Resume intelligence for students and placement teams.</h1>
                <p>
                  Students register, manage their profile, upload resumes, and
                  compare against job descriptions. Admins monitor students and
                  run the same analysis tools.
                </p>
              </div>
            </section>

            <section className="auth-layout">
              <div className="auth-panel">
                <div
                  className="auth-toggle"
                  role="tablist"
                  aria-label="Authentication mode"
                >
                  <button
                    type="button"
                    className={`auth-toggle-btn ${authView === "login" ? "active" : ""}`}
                    onClick={() => setAuthView("login")}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`auth-toggle-btn ${authView === "register" ? "active" : ""}`}
                    onClick={() => setAuthView("register")}
                  >
                    Register
                  </button>
                </div>

                {authView === "login" ? (
                  <LoginPanel
                    onLogin={handleLogin}
                    onSwitchToRegister={() => setAuthView("register")}
                  />
                ) : (
                  <RegisterPanel onSwitchToLogin={() => setAuthView("login")} />
                )}
              </div>
            </section>
          </>
        )}

        {user?.role === "STUDENT" && (
          <StudentDashboard
            user={user}
            activeView={activeView}
            onNavigate={setActiveView}
          />
        )}
        {user?.role === "ADMIN" && (
          <AdminDashboard
            user={user}
            activeView={activeView}
            onNavigate={setActiveView}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;

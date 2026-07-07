import { useState } from "react";
import studyImg from "./assets/study.jpg";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import LoginPanel from "./components/LoginPanel.jsx";
import RegisterPanel from "./components/RegisterPanel.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";

function DecorativePanel() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={studyImg}
        alt="Student studying"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/65 via-amber-700/55 to-yellow-600/60" />

      {/* brand text pinned to bottom */}
      <div className="absolute bottom-10 left-10 right-10 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CareerVerse AI</span>
        </div>
        <h2 className="text-3xl font-bold text-white leading-snug mb-2">
          Land your dream job<br />with AI on your side.
        </h2>
        <p className="text-orange-100 text-sm leading-relaxed">
          Intelligent resume analysis, ATS scoring, and job-description matching — built for students and placement teams.
        </p>
      </div>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [view, setView] = useState("login");
  const isLogin = view === "login";

  // slide: decorative moves left→right on login, right→left on register
  // form moves right→left on login, left→right on register
  const decorativeStyle = {
    transition: "transform 0.6s cubic-bezier(0.77,0,0.18,1)",
    transform: isLogin ? "translateX(0%)" : "translateX(100%)",
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Floating card */}
      <div className="relative flex w-[1100px] h-[720px] rounded-3xl shadow-2xl shadow-orange-200/60 overflow-hidden border border-orange-100">

        {/* Toggle pill — centered above the card */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex bg-white rounded-full shadow-md border border-orange-100 p-1">
          <button
            onClick={() => setView("login")}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              isLogin ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setView("register")}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              !isLogin ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        {/* Decorative panel — left on login, slides to right on register */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-10" style={decorativeStyle}>
          <DecorativePanel />
        </div>

        {/* Login form — right side, slides off-screen on register */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full z-10 flex items-center"
          style={{
            background: "linear-gradient(135deg, #fffbf5 0%, #fff7ed 50%, #fef3c7 100%)",
            transition: "transform 0.6s cubic-bezier(0.77,0,0.18,1)",
            transform: isLogin ? "translateX(0%)" : "translateX(100%)",
          }}
        >
          <LoginPanel onLogin={onLogin} />
        </div>

        {/* Register form — starts off-screen left, slides in on register */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full z-10 flex items-center"
          style={{
            background: "linear-gradient(135deg, #fffbf5 0%, #fff7ed 50%, #fef3c7 100%)",
            transition: "transform 0.6s cubic-bezier(0.77,0,0.18,1)",
            transform: isLogin ? "translateX(-100%)" : "translateX(0%)",
          }}
        >
          <RegisterPanel />
        </div>

      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("careerverse-session");
    return saved ? JSON.parse(saved) : null;
  });
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

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-100" id="top">
      <Header user={user} activeView={activeView} onLogout={handleLogout} onNavigate={setActiveView} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {user?.role === "STUDENT" && (
          <StudentDashboard user={user} activeView={activeView} onNavigate={setActiveView} />
        )}
        {user?.role === "ADMIN" && (
          <AdminDashboard user={user} activeView={activeView} onNavigate={setActiveView} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;

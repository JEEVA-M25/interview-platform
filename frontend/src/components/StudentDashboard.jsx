import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Clock3, Sparkles, UserCircle2, FileText, BrainCircuit, TrendingUp, LayoutGrid, Crown } from "lucide-react";
import AtsAnalyzer from "./AtsAnalyzer.jsx";
import Interview from "./Interview.jsx";
import SkillGapAnalyzer from "./SkillGapAnalyzer.jsx";
import DashboardCard from "./ui/DashboardCard.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { getJson, putJson } from "../services/api.js";
import Dashboard from "../pages/Dashboard.jsx";
import InterviewHistory from "../pages/InterviewHistory.jsx";
import InterviewDetail from "../pages/InterviewDetail.jsx";
import AtsHistory from "./AtsHistory.jsx";
import JobMatchHistory from "./JobMatchHistory.jsx";

const emptyProfile = {
  fullName: "", phone: "", college: "", degree: "",
  graduationYear: "", portfolioUrl: "", linkedinUrl: "", careerGoal: "",
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 hover:bg-white transition-colors";
const btnPrimary = "rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:scale-[1.02]";
const btnSecondary = "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors";
const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60";

function StudentDashboard({ user, activeView, onNavigate }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getJson("/api/student/profile", user.token);
        setProfile({ ...emptyProfile, ...data });
        setStatus("ready");
      } catch (err) {
        setMessage(err.message);
        setStatus("error");
      }
    }
    loadProfile();
  }, [user.token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const data = await putJson("/api/student/profile", profile, user.token);
      setProfile({ ...emptyProfile, ...data });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.message);
    }
  }

  function updateField(field, value) {
    setProfile(c => ({ ...c, [field]: value }));
  }

  if (activeView === "profile") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Profile"
          title="Your student profile"
          description="Keep your professional story polished and up to date."
          actions={[<button key="back" type="button" className={btnSecondary} onClick={() => onNavigate("dashboard")}>← Back</button>]}
        />
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <SectionHeader eyebrow="Student details" title="Edit profile" description="Your profile powers tailored recommendations and applications." />
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            {[
              { label: "Full name", field: "fullName", required: true },
              { label: "Phone", field: "phone" },
              { label: "College", field: "college" },
              { label: "Degree", field: "degree" },
              { label: "Graduation year", field: "graduationYear" },
              { label: "Portfolio URL", field: "portfolioUrl" },
            ].map(({ label, field, required }) => (
              <label key={field} className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                {label}
                <input className={inputClass} value={profile[field] || ""} onChange={e => updateField(field, e.target.value)} required={required} />
              </label>
            ))}
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 md:col-span-2">
              LinkedIn URL
              <input className={inputClass} value={profile.linkedinUrl || ""} onChange={e => updateField("linkedinUrl", e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 md:col-span-2">
              Career goal
              <textarea className={`${inputClass} min-h-28 resize-none`} value={profile.careerGoal || ""} onChange={e => updateField("careerGoal", e.target.value)} rows={4} />
            </label>
            <div className="md:col-span-2 flex items-center gap-4">
              <button type="submit" disabled={status === "loading"} className={btnPrimary}>
                {status === "loading" ? "Saving..." : "Save profile"}
              </button>
              {message && <p className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-red-500"}`}>{message}</p>}
            </div>
          </form>
        </motion.section>
      </div>
    );
  }

  if (activeView === "settings") {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Settings" title="Account preferences" description="Fine-tune how your workflow works."
          actions={[<button key="back" type="button" className={btnSecondary} onClick={() => onNavigate("dashboard")}>← Back</button>]} />
        <div className="grid gap-4 md:grid-cols-2">
          <DashboardCard title="Profile visibility" value="Shared" description="Keep your profile discoverable to recruiters." icon={BadgeCheck} accent="green" />
          <DashboardCard title="Reminders" value="Enabled" description="Stay ahead of interviews and deadlines." icon={Clock3} accent="amber" />
        </div>
      </div>
    );
  }

  if (activeView === "applications") {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Applications" title="Applications" description="Your saved applications will appear here."
          actions={[<button key="back" type="button" className={btnSecondary} onClick={() => onNavigate("dashboard")}>← Back</button>]} />
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <SectionHeader eyebrow="Applications" title="No applications yet" />
          <EmptyState title="No applications yet" description="Add your first application once the backend is available." icon={BriefcaseBusiness} />
        </motion.section>
      </div>
    );
  }

  if (activeView === "ats-score") return <AtsAnalyzer token={user.token} />;
  if (activeView === "job-applications") return <SkillGapAnalyzer token={user.token} />;
  if (activeView === "interview") return <Interview token={user.token} onBack={() => onNavigate("dashboard")} />;
  if (activeView === "progress") return <Dashboard user={user} onNavigate={onNavigate} />;
  if (activeView === "ats-history") return <AtsHistory user={user} onNavigate={onNavigate} />;
  if (activeView === "job-match-history") return <JobMatchHistory user={user} onNavigate={onNavigate} />;
  if (activeView === "history") return <InterviewHistory user={user} onNavigate={onNavigate} />;
  if (activeView.startsWith("history/")) {
    const sessionId = activeView.split("/")[1];
    return <InterviewDetail sessionId={sessionId} onBack={() => onNavigate("history")} user={user} />;
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full">
      {/* 1. WELCOME BANNER */}
      <div className="flex flex-col xl:flex-row items-center justify-between bg-white rounded-3xl p-8 border border-slate-100 shadow-sm shadow-slate-200/50 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Good morning, {user?.fullName?.split(" ")[0] || "Student"}! 👋</h1>
          <p className="text-slate-500 font-medium">Track your progress and take the next step toward your dream career.</p>
        </div>
        
        {/* Placeholder for illustration */}
        <div className="hidden xl:flex items-center justify-center w-48 h-24">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-8 h-16 bg-indigo-500 rounded-t-lg"></div>
            <div className="absolute top-0 left-6 w-8 h-20 bg-emerald-500 rounded-t-lg"></div>
            <div className="absolute -top-8 left-16 w-8 h-24 bg-orange-500 rounded-t-lg"></div>
          </div>
        </div>

              </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Resume Analyses", val: "3", sub: "↑ 50% this month", color: "text-orange-500", bg: "bg-orange-50", icon: FileText, subColor: "text-emerald-500" },
          { title: "ATS Score", val: "82", sub: "↑ 12% improvement", color: "text-emerald-500", bg: "bg-emerald-50", icon: BadgeCheck, subColor: "text-emerald-500" },
          { title: "Interviews Completed", val: "5", sub: "↑ 2 this month", color: "text-indigo-500", bg: "bg-indigo-50", icon: BrainCircuit, subColor: "text-emerald-500" },
          { title: "Avg Interview Score", val: "78%", sub: "↑ 8% improvement", color: "text-blue-500", bg: "bg-blue-50", icon: TrendingUp, subColor: "text-emerald-500" },
          { title: "Profile Completion", val: "45%", sub: "Complete your profile", color: "text-red-500", bg: "bg-red-50", icon: UserCircle2, subColor: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold text-slate-500">{stat.title}</h3>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{stat.val}</p>
              <p className={`text-xs font-semibold mt-2 ${stat.subColor}`}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Dashboard */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-1 xl:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Progress Dashboard
            </h3>
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-600">
              <option>Last 6 Interviews</option>
            </select>
          </div>
          
          <div className="h-48 w-full bg-orange-50/30 rounded-xl border border-orange-50 mb-6 flex items-end justify-between px-4 pb-4">
            {/* Simple mock chart bars */}
            {[62, 68, 72, 76, 81, 88].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <span className="text-[10px] font-bold text-slate-600">{val}%</span>
                <div className="w-2 bg-orange-400 rounded-full" style={{ height: `${val}%` }}></div>
                <span className="text-[10px] text-slate-400">May {10 + i * 7}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Highest Score", val: "88%", icon: "↑", color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Lowest Score", val: "62%", icon: "↓", color: "text-red-500", bg: "bg-red-50" },
              { label: "Average Score", val: "74%", icon: "○", color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Total Interviews", val: "5", icon: "⭐", color: "text-orange-500", bg: "bg-orange-50" },
            ].map((st, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <p className="text-[10px] font-semibold text-slate-500 mb-1">{st.label}</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-bold text-slate-900">{st.val}</p>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${st.bg} ${st.color}`}>{st.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-indigo-500" /> Recent Activity
            </h3>
            <button className="text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1">View All</button>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            {[
              { title: "AI Interview Completed", sub: "Java Developer • Score: 88%", time: "2 hours ago", icon: BrainCircuit, color: "text-orange-500", bg: "bg-orange-50" },
              { title: "ATS Analysis Done", sub: "Backend Developer • Score: 82%", time: "1 day ago", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50" },
              { title: "Job Match Found", sub: "Full Stack Developer • 92% match", time: "2 days ago", icon: BriefcaseBusiness, color: "text-blue-500", bg: "bg-blue-50" },
              { title: "Profile Updated", sub: "Basic information updated", time: "3 days ago", icon: UserCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.bg} ${act.color}`}>
                  <act.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{act.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{act.sub}</p>
                </div>
                <span className="text-[11px] font-medium text-slate-400 shrink-0 whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="w-5 h-5 text-orange-500" /> 
            <h3 className="text-lg font-bold text-slate-900">Quick Access</h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {[
              { title: "Progress Dashboard", sub: "View detailed analytics", view: "progress", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-orange-400 border-dashed bg-orange-50/30" },
              { title: "Interview History", sub: "View past interviews", view: "history", icon: Clock3, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-orange-400 border-dashed bg-orange-50/30" },
              { title: "ATS Reports", sub: "View all ATS analyses", view: "ats-score", icon: FileText, color: "text-purple-500", bg: "bg-purple-50", border: "border-slate-100" },
              { title: "Recommendations", sub: "Get AI recommendations", view: "job-applications", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50", border: "border-slate-100" },
            ].map((qa, i) => (
              <button key={i} onClick={() => onNavigate(qa.view)} className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left group hover:shadow-md ${qa.border}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${qa.bg} ${qa.color}`}>
                  <qa.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{qa.title}</p>
                  <p className="text-[11px] text-slate-500">{qa.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Top Job Matches", icon: BriefcaseBusiness, color: "text-red-500", content: (
            <div className="flex items-center justify-between border border-slate-100 p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center font-bold text-xs">FS</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Full Stack Developer</p>
                  <p className="text-xs text-slate-500">Tech Solutions Inc.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">92% Match</span>
            </div>
          )},
          { title: "AI Recommendations", icon: Sparkles, color: "text-amber-500", content: (
            <div className="border border-slate-100 p-3 rounded-xl border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-slate-900">Improve Your React Skills</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">High Impact</span>
              </div>
              <p className="text-[11px] text-slate-500">Based on your profile, enhancing React skills could increase your match score.</p>
            </div>
          )},
          { title: "Achievements", icon: Crown, color: "text-amber-500", content: (
            <div className="flex items-center justify-between border border-slate-100 p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center"><Crown className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">First Interview</p>
                  <p className="text-xs text-slate-500">Completed your first AI Interview</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">+50 XP</span>
            </div>
          )}
        ].map((block, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <block.icon className={`w-4 h-4 ${block.color}`} /> {block.title}
              </h3>
              <button className="text-[10px] font-semibold text-slate-500 border border-slate-200 rounded px-2 py-0.5">View All</button>
            </div>
            {block.content}
          </div>
        ))}
      </div>
      
    </div>
  );
}
export default StudentDashboard;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Clock3, Sparkles, UserCircle2, FileText, BrainCircuit, TrendingUp, LayoutGrid, Crown, Mic, Camera } from "lucide-react";
import AtsAnalyzer from "./AtsAnalyzer.jsx";
import ImageCropper from "./ImageCropper.jsx";
import Interview from "./Interview.jsx";
import SkillGapAnalyzer from "./SkillGapAnalyzer.jsx";
import DashboardCard from "./ui/DashboardCard.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { getJson, putJson, postForm, aiApi, interviewApi } from "../services/api.js";
import Dashboard from "../pages/Dashboard.jsx";
import InterviewHistory from "../pages/InterviewHistory.jsx";
import InterviewDetail from "../pages/InterviewDetail.jsx";
import AtsHistory from "./AtsHistory.jsx";
import JobMatchHistory from "./JobMatchHistory.jsx";
import PlacementReadiness from "../pages/PlacementReadiness.jsx";
import Recommendations from "../pages/Recommendations.jsx";
import ResumeBuilder from "./ResumeBuilder.jsx";

const emptyProfile = {
  fullName: "", phone: "", college: "", degree: "",
  graduationYear: "", portfolioUrl: "", linkedinUrl: "", careerGoal: "", profilePictureUrl: ""
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 hover:bg-white transition-colors";
const btnPrimary = "rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:scale-[1.02]";
const btnSecondary = "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors";
const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60";

function StudentDashboard({ user, activeView, onNavigate }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  const [dashData, setDashData] = useState({
    atsCount: 0,
    jobMatchCount: 0,
    interviewCount: 0,
    recentAts: null,
    recentJobMatch: null,
    recentInterview: null,
    loading: true
  });

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

  useEffect(() => {
    if (activeView === "dashboard") {
      async function loadDashboard() {
        try {
          const [ats, jobs, allInterviews] = await Promise.all([
            aiApi.getAtsHistory(user.token).catch(() => []),
            aiApi.getJobMatchHistory(user.token).catch(() => []),
            interviewApi.getSessions(user.token).catch(() => [])
          ]);
          
          const completedInterviews = (allInterviews || []).filter(i => i.status === 'COMPLETED');

          setDashData({
            atsCount: ats?.length || 0,
            jobMatchCount: jobs?.length || 0,
            interviewCount: completedInterviews.length,
            recentAts: ats?.length > 0 ? ats[0] : null,
            recentJobMatch: jobs?.length > 0 ? jobs[0] : null,
            recentInterview: completedInterviews.length > 0 ? completedInterviews[0] : null,
            loading: false
          });
        } catch (error) {
          console.error("Dashboard data load error:", error);
          setDashData(prev => ({ ...prev, loading: false }));
        }
      }
      loadDashboard();
    }
  }, [activeView, user.token]);

  const profileFields = ["fullName", "phone", "college", "degree", "graduationYear", "portfolioUrl", "linkedinUrl", "careerGoal"];
  const filledFields = profileFields.filter(f => profile[f] && profile[f].trim() !== "").length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100) || 0;


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

  function handleImageSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => setImageToCrop(reader.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  async function handleCropComplete(croppedBlob) {
    setImageToCrop(null);
    setIsUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.jpg");
      
      const data = await postForm("/api/student/profile/picture", formData, user.token);
      
      setProfile(p => ({ ...p, profilePictureUrl: data.profilePictureUrl }));
      
      // Update local storage user data so Header reflects it
      const savedUser = JSON.parse(localStorage.getItem("careerverse_user") || "{}");
      savedUser.profilePictureUrl = data.profilePictureUrl;
      localStorage.setItem("careerverse_user", JSON.stringify(savedUser));
      // Dispatch storage event so other components (Header) can update
      window.dispatchEvent(new Event("storage"));

      setMessage("Profile picture updated!");
    } catch(err) {
      setMessage(err.message);
    } finally {
      setIsUploadingPic(false);
    }
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
            <div className="md:col-span-2 flex flex-col items-center gap-4 py-4">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md">
                  {profile.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserCircle2 size={48} />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
              </div>
              <p className="text-sm text-slate-500 font-medium">Click to update picture {isUploadingPic && "(Uploading...)"}</p>
            </div>
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
        
        {imageToCrop && (
          <ImageCropper
            imageSrc={imageToCrop}
            onCancel={() => setImageToCrop(null)}
            onCropComplete={handleCropComplete}
          />
        )}
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

  if (activeView === "ats-score") return <AtsAnalyzer token={user.token} onNavigate={onNavigate} />;
  if (activeView === "job-applications") return <SkillGapAnalyzer token={user.token} onNavigate={onNavigate} />;
  if (activeView === "interview") return <Interview token={user.token} onBack={() => onNavigate("dashboard")} />;
  if (activeView === "progress") return <Dashboard user={user} onNavigate={onNavigate} />;
  if (activeView === "ats-history") return <AtsHistory user={user} onNavigate={onNavigate} />;
  if (activeView === "job-match-history") return <JobMatchHistory user={user} onNavigate={onNavigate} />;
  if (activeView === "history") return <InterviewHistory user={user} onNavigate={onNavigate} />;
  if (activeView === "readiness") return <PlacementReadiness user={user} onNavigate={onNavigate} />;
  if (activeView === "recommendations") return <Recommendations user={user} />;
  if (activeView === "resume-builder") return <ResumeBuilder user={user} />;

  if (activeView.startsWith("history/")) {
    const sessionId = activeView.split("/")[1];
    return <InterviewDetail sessionId={sessionId} onBack={() => onNavigate("history")} user={user} />;
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. WELCOME SECTION */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Welcome back, {user?.fullName?.split(" ")[0] || "Student"} 👋
        </h1>
        <p className="text-slate-500 font-medium">Keep improving your placement preparation.</p>
      </div>

      {/* 2. ACTIVITY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "ATS Analyses", val: dashData.atsCount, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Job Matches", val: dashData.jobMatchCount, icon: BriefcaseBusiness, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "AI Interviews", val: dashData.interviewCount, icon: BrainCircuit, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Profile Completion", val: `${profileCompletion}%`, icon: UserCircle2, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{dashData.loading ? "..." : stat.val}</p>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{stat.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { 
            title: "Analyze Your Resume", 
            desc: "Check your resume and identify ATS improvements.", 
            view: "ats-score", 
            icon: FileText, 
            bg: "bg-indigo-50", 
            color: "text-indigo-600",
            hoverRing: "group-hover:border-indigo-200"
          },
          { 
            title: "Match a Job", 
            desc: "Compare your resume with a job description and identify skill gaps.", 
            view: "job-applications", 
            icon: BriefcaseBusiness, 
            bg: "bg-blue-50", 
            color: "text-blue-600",
            hoverRing: "group-hover:border-blue-200"
          },
          { 
            title: "Practice with AI", 
            desc: "Take a role-specific mock interview and receive instant feedback.", 
            view: "interview", 
            icon: Mic, 
            bg: "bg-emerald-50", 
            color: "text-emerald-600",
            hoverRing: "group-hover:border-emerald-200"
          },
          { 
            title: "Check Placement Readiness", 
            desc: "View your overall readiness, strengths, weaknesses, and personalized study plan.", 
            view: "readiness", 
            icon: Crown, 
            bg: "bg-amber-50", 
            color: "text-amber-600",
            hoverRing: "group-hover:border-amber-200"
          },
        ].map((action, i) => (
          <button 
            key={i} 
            onClick={() => onNavigate(action.view)} 
            className={`group bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start gap-5 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${action.hoverRing}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${action.bg} ${action.color} transition-transform group-hover:scale-110`}>
              <action.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">{action.title}</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{action.desc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0 mt-1" />
          </button>
        ))}
      </div>

      {/* 4. RECENT ACTIVITY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock3 className="w-5 h-5 text-indigo-500" /> Recent Activity
        </h3>
        
        <div className="space-y-4">
          {dashData.loading ? (
            <p className="text-sm text-slate-500 font-medium">Loading activity...</p>
          ) : (!dashData.recentAts && !dashData.recentJobMatch && !dashData.recentInterview) ? (
            <div className="text-center py-6">
              <p className="text-sm font-bold text-slate-900 mb-1">No activity yet</p>
              <p className="text-xs font-medium text-slate-500">Start by analysing your resume or taking an AI interview.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {dashData.recentAts && (
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">ATS Analysis</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{dashData.recentAts.resumeName || "Resume analyzed"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md">{dashData.recentAts.score || dashData.recentAts.atsScore || 0}/100</span>
                  </div>
                </div>
              )}
              {dashData.recentJobMatch && (
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <BriefcaseBusiness className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Match</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{dashData.recentJobMatch.resumeName ? `Matched: ${dashData.recentJobMatch.resumeName}` : "Job analyzed"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">{dashData.recentJobMatch.matchScore || dashData.recentJobMatch.score || 0}/100</span>
                  </div>
                </div>
              )}
              {dashData.recentInterview && (
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">AI Interview</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{dashData.recentInterview.role ? `${dashData.recentInterview.role} Role` : "Interview completed"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">{dashData.recentInterview.overallScore || 0}/100</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default StudentDashboard;

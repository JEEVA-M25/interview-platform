import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Clock3, Sparkles, UserCircle2 } from "lucide-react";
import AtsAnalyzer from "./AtsAnalyzer.jsx";
import SkillGapAnalyzer from "./SkillGapAnalyzer.jsx";
import DashboardCard from "./ui/DashboardCard.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { getJson, putJson } from "../services/api.js";

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${user?.fullName?.split(" ")[0] || "there"} 👋`}
        description="Here's your career workspace at a glance."
        actions={[
          <button key="ats" type="button" className={btnPrimary} onClick={() => onNavigate("ats-score")}>ATS Analysis</button>,
          <button key="jobs" type="button" className={btnSecondary} onClick={() => onNavigate("job-applications")}>Job Matching</button>,
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Resume analyses" value="0" description="No analyses completed yet." icon={Sparkles} accent="orange" />
        <DashboardCard title="ATS score" value="—" description="Upload a resume to get your score." icon={BadgeCheck} accent="green" />
        <DashboardCard title="Applications" value="0" description="No applications recorded yet." icon={BriefcaseBusiness} accent="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <SectionHeader eyebrow="Recent activity" title="Recent activity" description="Your latest actions will appear here." />
          <EmptyState title="No recent activity" description="Your actions will show up here after backend integration." icon={UserCircle2} />
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <SectionHeader eyebrow="Quick actions" title="Get started" />
          <div className="space-y-2.5">
            {[
              { label: "Upload a resume", view: "ats-score" },
              { label: "Match with a role", view: "job-applications" },
              { label: "Complete your profile", view: "profile" },
            ].map(({ label, view }) => (
              <button
                key={view}
                type="button"
                onClick={() => onNavigate(view)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200"
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <SectionHeader eyebrow="Recommendations" title="Helpful resources" />
          <EmptyState title="No recommendations yet" description="Upload a resume and add a job description to generate recommendations." />
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <SectionHeader eyebrow="Profile" title="Profile readiness" />
          <DashboardCard title="Profile completion" value="0%" description="Fill in your profile to improve your match score." icon={Clock3} accent="amber" />
        </motion.section>
      </div>
    </div>
  );
}

export default StudentDashboard;

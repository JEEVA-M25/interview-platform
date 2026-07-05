import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import AtsAnalyzer from "./AtsAnalyzer.jsx";
import SkillGapAnalyzer from "./SkillGapAnalyzer.jsx";
import DashboardCard from "./ui/DashboardCard.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { getJson, putJson } from "../services/api.js";

const emptyProfile = {
  fullName: "",
  phone: "",
  college: "",
  degree: "",
  graduationYear: "",
  portfolioUrl: "",
  linkedinUrl: "",
  careerGoal: "",
};

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
    setProfile((current) => ({ ...current, [field]: value }));
  }

  if (activeView === "profile") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Profile"
          title="Your student profile"
          description="Keep your professional story polished and up to date."
          actions={[
            <button
              key="back"
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
              onClick={() => onNavigate("dashboard")}
            >
              Back to dashboard
            </button>,
          ]}
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)]"
        >
          <SectionHeader
            eyebrow="Student details"
            title="Edit profile"
            description="Your profile helps power tailored recommendations and applications."
          />

          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Full name
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Phone
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.phone || ""}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              College
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.college || ""}
                onChange={(event) => updateField("college", event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Degree
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.degree || ""}
                onChange={(event) => updateField("degree", event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Graduation year
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.graduationYear || ""}
                onChange={(event) =>
                  updateField("graduationYear", event.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Portfolio URL
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.portfolioUrl || ""}
                onChange={(event) =>
                  updateField("portfolioUrl", event.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              LinkedIn URL
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.linkedinUrl || ""}
                onChange={(event) =>
                  updateField("linkedinUrl", event.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Career goal
              <textarea
                className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-blue-500 focus:bg-white"
                value={profile.careerGoal || ""}
                onChange={(event) =>
                  updateField("careerGoal", event.target.value)
                }
                rows="4"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {status === "loading" ? "Saving..." : "Save profile"}
              </button>
              {message && (
                <p
                  className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-emerald-600"}`}
                >
                  {message}
                </p>
              )}
            </div>
          </form>
        </motion.section>
      </div>
    );
  }

  if (activeView === "settings") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Settings"
          title="Account preferences"
          description="Fine-tune how your learning and application workflow works."
          actions={[
            <button
              key="back"
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
              onClick={() => onNavigate("dashboard")}
            >
              Back to dashboard
            </button>,
          ]}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <DashboardCard
            title="Profile visibility"
            value="Shared"
            description="Keep your profile discoverable to recruiters and mentors."
            icon={BadgeCheck}
            accent="green"
          />
          <DashboardCard
            title="Reminders"
            value="Enabled"
            description="Stay ahead of interviews, deadlines, and application tasks."
            icon={Clock3}
            accent="amber"
          />
        </div>
      </div>
    );
  }

  if (activeView === "applications") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Applications"
          title="Applications"
          description="Your saved applications will appear here once the backend is connected."
          actions={[
            <button
              key="back"
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
              onClick={() => onNavigate("dashboard")}
            >
              Back to dashboard
            </button>,
          ]}
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <SectionHeader
            eyebrow="Applications"
            title="No applications yet"
            description="Your application pipeline will appear here after backend integration."
          />
          <EmptyState
            title="No applications yet"
            description="Add your first application once the backend is available."
            icon={BriefcaseBusiness}
          />
        </motion.section>
      </div>
    );
  }

  if (activeView === "ats-score") {
    return <AtsAnalyzer token={user.token} />;
  }

  if (activeView === "job-applications") {
    return <SkillGapAnalyzer token={user.token} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Good evening"
        description="Career Workspace"
        actions={[
          <button
            key="ats"
            type="button"
            className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            onClick={() => onNavigate("ats-score")}
          >
            ATS analysis
          </button>,
          <button
            key="jobs"
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
            onClick={() => onNavigate("job-applications")}
          >
            Job matching
          </button>,
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Resume analyses"
          value="0"
          description="No analyses completed yet."
          icon={Sparkles}
          accent="blue"
        />
        <DashboardCard
          title="ATS score"
          value="0"
          description="No ATS data available yet."
          icon={BadgeCheck}
          accent="green"
        />
        <DashboardCard
          title="Applications"
          value="0"
          description="No applications recorded yet."
          icon={BriefcaseBusiness}
          accent="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <SectionHeader
            eyebrow="Recent activity"
            title="Recent activity"
            description="Your actions will appear here once data is available."
          />
          <EmptyState
            title="No recent activity"
            description="Your latest actions will appear here after backend integration."
            icon={UserCircle2}
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <SectionHeader
            eyebrow="Quick actions"
            title="Getting started"
            description="Use the tools below to begin your workflow."
          />
          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700"
              onClick={() => onNavigate("ats-score")}
            >
              <span>Upload a resume</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700"
              onClick={() => onNavigate("job-applications")}
            >
              <span>Match with a role</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700"
              onClick={() => onNavigate("profile")}
            >
              <span>Complete your profile</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <SectionHeader
            eyebrow="Recommendations"
            title="Helpful resources"
            description="Recommendations will appear here when backend data is available."
          />
          <EmptyState
            title="No recommendations available"
            description="Upload a resume and add a job description to generate recommendations."
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <SectionHeader
            eyebrow="Profile"
            title="Profile readiness"
            description="Your profile completion will be shown here once connected to the backend."
          />
          <DashboardCard
            title="Profile completion"
            value="0%"
            description="No profile data available yet."
            icon={Clock3}
            accent="amber"
          />
        </motion.section>
      </div>
    </div>
  );
}

export default StudentDashboard;

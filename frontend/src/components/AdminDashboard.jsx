import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import DashboardCard from "./ui/DashboardCard.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { getJson } from "../services/api.js";

function AdminDashboard({ user, activeView, onNavigate }) {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await getJson("/api/admin/students", user.token);
        setStudents(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadStudents();
  }, [user.token]);

  if (activeView === "students") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin workspace"
          title="Student management"
          description="Monitor learners and keep your placement operations organized."
          actions={[
            <button
              key="back"
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
              onClick={() => onNavigate("dashboard")}
            >
              Back to overview
            </button>,
          ]}
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)]"
        >
          <SectionHeader
            eyebrow="Students"
            title="Registered students"
            description="A live view of the learners currently active in your platform."
          />

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_0.6fr] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <span>Name</span>
                <span>Email</span>
                <span>College</span>
                <span>Degree</span>
                <span>Year</span>
              </div>
              {students.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.8fr_0.6fr] border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
                >
                  <span className="font-medium text-slate-900">
                    {student.fullName}
                  </span>
                  <span>{student.email}</span>
                  <span>{student.college || "-"}</span>
                  <span>{student.degree || "-"}</span>
                  <span>{student.graduationYear || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Workspace overview"
        description="Run your placement operations from a polished admin console."
        actions={[
          <button
            key="students"
            type="button"
            className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
            onClick={() => onNavigate("students")}
          >
            View students
          </button>,
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Students"
          value={students.length}
          description="No student data available yet."
          icon={Users}
          accent="blue"
        />
        <DashboardCard
          title="Resume analyses"
          value="0"
          description="No analyses recorded yet."
          icon={Sparkles}
          accent="green"
        />
        <DashboardCard
          title="Job matches"
          value="0"
          description="No job matches available yet."
          icon={Workflow}
          accent="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <SectionHeader
            eyebrow="Latest activity"
            title="Recent students"
            description="Student activity will appear here once the backend is connected."
          />
          {students.length ? (
            <div className="space-y-3">
              {students.slice(0, 4).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {student.college || "No college listed"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent activity"
              description="New student activity will appear here after the backend is integrated."
            />
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <SectionHeader
            eyebrow="Quick actions"
            title="Getting started"
            description="Use the admin workspace to guide student progress."
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>Review student profiles</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>Monitor ATS reports</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>Support job matching</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
      >
        <SectionHeader
          eyebrow="Operations"
          title="Admin tools"
          description="The workspace is ready for backend-driven insights and actions."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Student oversight</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No student data available yet. The admin workspace will populate
              once the backend is live.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">
              Resume intelligence
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ATS and skill-gap reports will appear here as soon as the backend
              provides them.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default AdminDashboard;

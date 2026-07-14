import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, ChevronRight, Loader2, UploadCloud } from "lucide-react";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { interviewApi } from "../services/api.js";
import LoadingDistractor from "./ui/LoadingDistractor.jsx";

const ROLES = [
  { value: "Java Developer", label: "Java Developer", emoji: "☕" },
  { value: "Full Stack", label: "Full Stack", emoji: "🌐" },
  { value: "Data Analyst", label: "Data Analyst", emoji: "📊" },
  { value: "Frontend", label: "Frontend", emoji: "🎨" },
];

const DIFFICULTIES = [
  { value: "Easy", label: "Easy", desc: "Fundamentals & concepts", color: "emerald" },
  { value: "Medium", label: "Medium", desc: "Applied knowledge", color: "amber" },
  { value: "Hard", label: "Hard", desc: "Senior-level depth", color: "red" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 hover:bg-white transition-colors";
const btnPrimary =
  "rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
const btnSecondary =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors";

function InterviewSetup({ token, onSessionCreated, onBack }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [role, setRole] = useState("Java Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleStart(e) {
    e.preventDefault();
    if (!resumeFile) return;
    setStatus("loading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      fd.append("role", role);
      fd.append("difficulty", difficulty);
      const session = await interviewApi.createSession(fd, token);
      onSessionCreated(session);
    } catch (err) {
      setError(err.message || "Failed to create session. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Interview"
        title="Set up your interview"
        description="Upload your resume, choose a role and difficulty — we'll generate 10 tailored questions."
        actions={[
          <button key="back" type="button" className={btnSecondary} onClick={onBack}>
            ← Back
          </button>,
        ]}
      />

      {status === "loading" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-8 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)]"
        >
          <LoadingDistractor
            type="setup"
            title="Preparing your assessment questions"
            subtitle="Tailoring 10 personalized questions using Gemini..."
            estimatedDuration={16000}
          />
        </motion.div>
      ) : (
        <form onSubmit={handleStart}>
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            {/* Left — resume upload */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 space-y-5"
            >
              <SectionHeader
                eyebrow="Step 1"
                title="Upload your resume"
                description="PDF, DOC, DOCX, or TXT — we'll extract your skills automatically."
              />
              <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-6 text-sm font-medium text-slate-700 hover:border-orange-400 hover:bg-orange-50 transition-all">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <UploadCloud className="h-6 w-6 text-orange-500" />
                  </div>
                  <span className="font-semibold text-slate-700">
                    {resumeFile ? resumeFile.name : "Click to choose a file"}
                  </span>
                  <span className="text-xs text-slate-400">PDF, DOC, DOCX, TXT supported</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  required
                />
              </label>
            </motion.section>

            {/* Right — role + difficulty */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 space-y-6"
            >
              <SectionHeader
                eyebrow="Step 2"
                title="Choose role & difficulty"
                description="Gemini will tailor questions to your resume and this target role."
              />

              {/* Role */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Target role</p>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        role === r.value
                          ? "border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50/40"
                      }`}
                    >
                      <span className="text-base">{r.emoji}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`flex flex-col items-center rounded-xl border px-3 py-3 text-sm transition-all ${
                        difficulty === d.value
                          ? d.color === "emerald"
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                            : d.color === "amber"
                            ? "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-red-400 bg-red-50 text-red-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-semibold">{d.label}</span>
                      <span className="text-[11px] mt-0.5 opacity-70">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Ready to start?</p>
                <p className="text-xs text-slate-500">
                  Gemini will generate 10 questions tailored to your resume and role.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {error && <p className="text-sm text-red-500 max-w-xs">{error}</p>}
              <button type="submit" disabled={!resumeFile || status === "loading"} className={btnPrimary}>
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating questions...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Start Interview <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      )}
    </div>
  );
}

export default InterviewSetup;

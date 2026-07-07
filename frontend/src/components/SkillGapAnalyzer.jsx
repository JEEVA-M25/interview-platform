import { useState } from "react";
import { Sparkles, Star, AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import ResultList from "./ResultList.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { postForm } from "../services/api.js";

function getScoreLevel(score) {
  const n = parseFloat(score);
  if (n >= 80) return { label: "Excellent match",  icon: CheckCircle, stars: 5, color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", ring: "from-emerald-400 to-green-500"   };
  if (n >= 60) return { label: "Good match",        icon: TrendingUp,  stars: 4, color: "text-orange-600",  bg: "bg-orange-50",   border: "border-orange-200",  ring: "from-orange-400 to-amber-500"   };
  if (n >= 40) return { label: "Partial match",     icon: AlertTriangle,stars:3, color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200",   ring: "from-amber-400 to-yellow-500"   };
  return         { label: "Low match",              icon: XCircle,     stars: 2, color: "text-red-500",     bg: "bg-red-50",      border: "border-red-200",     ring: "from-red-400 to-orange-400"     };
}

function ScoreBadge({ score }) {
  const level = getScoreLevel(score);
  const Icon = level.icon;

  return (
    <div className={`rounded-2xl border ${level.border} ${level.bg} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Match Score</p>
      <div className="flex items-center gap-4">
        {/* circular score */}
        <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${level.ring} shadow-lg`}>
          <span className="text-2xl font-bold text-white">{score ?? 0}</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Icon className={`h-4 w-4 ${level.color}`} />
            <span className={`text-sm font-bold ${level.color}`}>{level.label}</span>
          </div>
          {/* stars */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < level.stars ? "text-amber-400 fill-amber-400" : "text-slate-300 fill-slate-200"}`}
              />
            ))}
            <span className="ml-1.5 text-xs text-slate-500">{level.stars}/5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillGapAnalyzer({ token }) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);
      const data = await postForm("/api/ai/skill-gap", formData, token);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 hover:bg-white transition-colors";

  return (
    <div className="space-y-6" id="job-applications">
      <PageHeader
        eyebrow="JD Matching"
        title="Role matching"
        description="Paste a job description and upload your resume to get a detailed match report."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        {/* Input */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <SectionHeader eyebrow="Input" title="Compare with a role" description="Paste a job description and upload a resume." />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
              Job description
              <textarea
                className={`${inputClass} min-h-44 resize-none`}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={8}
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
              Resume
              <input
                className={inputClass}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={e => setResumeFile(e.target.files?.[0] || null)}
                required
              />
              <span className="text-xs text-slate-400 font-normal">PDF, DOC, DOCX, PPT, PPTX, TXT</span>
            </label>

            <button
              type="submit"
              disabled={status === "loading" || !resumeFile}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : "Analyze match"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
          </form>
        </section>

        {/* Results */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60" aria-live="polite">
          <SectionHeader eyebrow="Results" title="Match report" />
          {result ? (
            <div className="space-y-4">
              <ScoreBadge score={result.matchScore ?? 0} />

              {result.summary && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Summary</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
                </div>
              )}

              <ResultList title="Matched skills" items={result.matchedSkills} />
              <ResultList title="Missing skills" items={result.missingSkills} />
              <ResultList title="Action plan" items={result.actionPlan} />
            </div>
          ) : (
            <EmptyState
              title="No match report yet"
              description="Upload a resume and paste a job description to generate your match report."
              icon={Sparkles}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default SkillGapAnalyzer;

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import ResultList from "./ResultList.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { postForm } from "../services/api.js";

const sampleJobDescription = "";

function SkillGapAnalyzer({ token }) {
  const [jobDescription, setJobDescription] = useState(sampleJobDescription);
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

  return (
    <div className="space-y-6" id="job-applications">
      <PageHeader
        eyebrow="JD matching"
        title="Role matching"
        description="Add a job description and upload a resume when the backend is ready to return match insights."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6">
          <SectionHeader
            eyebrow="Input"
            title="Compare with a role"
            description="Paste a job description and upload a resume file."
          />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Job description
              <textarea
                className="min-h-40 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows="8"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Resume upload
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                id="gap-resume"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={(event) =>
                  setResumeFile(event.target.files?.[0] || null)
                }
                required
              />
            </label>
            <p className="text-xs text-slate-500">
              Supported: PDF, DOC, DOCX, PPT, PPTX, TXT.
            </p>

            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={status === "loading" || !resumeFile}
            >
              {status === "loading" ? "Comparing..." : "Analyze skill gap"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </section>

        <section
          className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6"
          aria-live="polite"
        >
          <SectionHeader
            eyebrow="Results"
            title="Match report"
            description="The match report will appear here once the backend returns the analysis."
          />
          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">
                  Match score
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {result.matchScore ?? 0}
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {result.summary || "No summary available yet."}
              </p>
              <ResultList title="Matched skills" items={result.matchedSkills} />
              <ResultList title="Missing skills" items={result.missingSkills} />
              <ResultList title="Action plan" items={result.actionPlan} />
            </div>
          ) : (
            <EmptyState
              title="No job matches yet"
              description="Upload a resume and add a job description to generate a match report."
              icon={Sparkles}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default SkillGapAnalyzer;

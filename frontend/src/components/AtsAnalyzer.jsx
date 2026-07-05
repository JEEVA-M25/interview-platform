import { useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import ResultList from "./ResultList.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { postForm } from "../services/api.js";

function AtsAnalyzer({ token }) {
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
      const data = await postForm("/api/ai/ats-score", formData, token);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6" id="ats-score">
      <PageHeader
        eyebrow="ATS module"
        title="Resume analysis"
        description="Upload a resume to prepare for ATS scoring once the backend is connected."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] sm:p-6">
          <SectionHeader
            eyebrow="Upload"
            title="Analyze your resume"
            description="Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT."
          />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-medium text-slate-700">
              <span className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" /> Choose a resume file
              </span>
              <input
                className="hidden"
                id="ats-resume"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={(event) =>
                  setResumeFile(event.target.files?.[0] || null)
                }
                required
              />
              <span className="text-xs font-normal text-slate-500">
                {resumeFile ? resumeFile.name : "No file selected"}
              </span>
            </label>
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={status === "loading" || !resumeFile}
            >
              {status === "loading" ? "Analyzing..." : "Analyze ATS score"}
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
            title="ATS report"
            description="Insights will appear here after the backend returns analysis data."
          />
          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">ATS score</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {result.score ?? 0}
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {result.summary || "No summary available yet."}
              </p>
              <ResultList title="Strengths" items={result.strengths} />
              <ResultList title="Improvements" items={result.improvements} />
              <ResultList title="Keywords" items={result.keywords} />
            </div>
          ) : (
            <EmptyState
              title="No ATS reports yet"
              description="Upload your first resume to generate a structured ATS report."
              icon={FileText}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default AtsAnalyzer;

import { motion } from "framer-motion";
import {
  Award, BookOpen, Brain, ChevronDown, ChevronUp,
  Download, Loader2, MessageSquare, Mic, RotateCcw, Star, TrendingUp, ShieldAlert, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import PageHeader from "./ui/PageHeader.jsx";
import { interviewApi } from "../services/api.js";

const btnPrimary =
  "rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:scale-[1.02]";
const btnSecondary =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors";

// ── Dimension bar ─────────────────────────────────────────────────────────
function DimensionBar({ label, score, icon: Icon, color }) {
  const colorMap = {
    orange:  "from-orange-500 to-amber-500",
    emerald: "from-emerald-500 to-green-500",
    blue:    "from-blue-500 to-cyan-500",
    violet:  "from-violet-500 to-purple-500",
    rose:    "from-rose-500 to-pink-500",
    amber:   "from-amber-500 to-yellow-500",
  };
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm font-bold text-slate-900">{score}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Question result row ───────────────────────────────────────────────────
function QuestionRow({ result, index }) {
  const [open, setOpen] = useState(false);
  const score = result.score ?? 0;
  const scoreColor =
    score >= 8 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : score >= 5 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-800 line-clamp-1">{result.question}</span>
        <div className="flex items-center gap-2 shrink-0">
          {result.isFollowUp && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              Follow-up
            </span>
          )}
          {result.state === "SKIPPED" ? (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              Skipped
            </span>
          ) : (
            <span className={`text-xs font-bold border px-2.5 py-0.5 rounded-full ${scoreColor}`}>
              {score}/10
            </span>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-3"
        >
          {result.rawTranscript && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your answer</p>
              <p className="text-sm text-slate-700 leading-relaxed">{result.editedTranscript || result.rawTranscript}</p>
            </div>
          )}
          {result.feedback && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Feedback</p>
              <p className="text-sm text-slate-700 leading-relaxed">{result.feedback}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Mic className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vocal Pattern:</span>
            <span className="text-xs text-slate-700 font-medium">
              {result.emotion ? (
                <>{result.emotion.charAt(0).toUpperCase() + result.emotion.slice(1)} <span className="text-slate-400 font-normal">({(result.emotionConfidence * 100).toFixed(1)}% confidence)</span></>
              ) : (
                <span className="text-slate-400 italic">Not available</span>
              )}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {result.strengths && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                <p className="text-xs font-semibold text-emerald-600 mb-0.5">Strengths</p>
                <p className="text-xs text-slate-700">{result.strengths}</p>
              </div>
            )}
            {result.weaknesses && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-xs font-semibold text-red-600 mb-0.5">Weaknesses</p>
                <p className="text-xs text-slate-700">{result.weaknesses}</p>
              </div>
            )}
          </div>
          {result.responseTimeSeconds != null && (
            <p className="text-xs text-slate-400">Response time: {result.responseTimeSeconds}s</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
function InterviewReport({ report, sessionId, token, onNewInterview, onBack }) {
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  async function handleDownloadPdf() {
    setDownloading(true);
    setPdfError("");
    try {
      const blob = await interviewApi.downloadReportPdf(sessionId, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CareerVerse-Interview-Report-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(err.message || "Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  }

  const recommendationColor =
    report.overallScore >= 80 ? "from-emerald-500 to-green-500"
    : report.overallScore >= 60 ? "from-amber-500 to-yellow-500"
    : "from-red-500 to-orange-500";

  const integrityScore = report.integrityScore !== null ? report.integrityScore : 100;
  const warningsCount = report.warningsCount !== null ? report.warningsCount : 0;
  const eyeContactPercentage = report.eyeContactPercentage !== null ? report.eyeContactPercentage : 100;
  const facePresentPercentage = report.facePresentPercentage !== null ? report.facePresentPercentage : 100;
  const multipleFacesDetected = report.multipleFacesDetected || "No";
  const phoneChecked = report.phoneChecked || "Not Checked";
  const tabSwitches = report.tabSwitches !== null ? report.tabSwitches : 0;

  const integrityColor =
    integrityScore >= 80 ? "#10b981"
    : integrityScore >= 60 ? "#f59e0b"
    : "#ef4444";

  const dimensions = [
    { label: "Technical",       score: report.technicalScore,      icon: Brain,         color: "orange"  },
    { label: "Communication",   score: report.communicationScore,  icon: MessageSquare, color: "blue"    },
    { label: "Problem Solving", score: report.problemSolvingScore, icon: TrendingUp,    color: "violet"  },
    { label: "Grammar",         score: report.grammarScore,        icon: BookOpen,      color: "emerald" },
    { label: "Confidence",      score: report.confidenceScore,     icon: Star,          color: "amber"   },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Interview Complete"
        title="Your interview report"
        description={`${report.role} · ${report.difficulty} · ${report.questionResults?.length ?? 0} questions`}
        actions={[
          <button key="back" type="button" className={btnSecondary} onClick={onBack}>
            ← Dashboard
          </button>,
          <button
            key="pdf"
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading || !sessionId}
            className={`${btnSecondary} flex items-center gap-2 disabled:opacity-50`}
          >
            {downloading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Downloading...</>
            ) : (
              <><Download className="h-4 w-4" /> Download PDF</>
            )}
          </button>,
          ...(pdfError ? [
            <span key="pdf-err" className="text-xs text-red-500">{pdfError}</span>
          ] : []),
          <button key="new" type="button" className={btnPrimary} onClick={onNewInterview}>
            <span className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> New Interview
            </span>
          </button>,
        ]}
      />

      {/* Double scoring layout: Overall Score + Integrity Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall score card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-28 h-28">
                <svg width={112} height={112} className="-rotate-90">
                  <circle cx={56} cy={56} r={48} fill="none" stroke="#e2e8f0" strokeWidth={10} />
                  <motion.circle
                    cx={56} cy={56} r={48}
                    fill="none"
                    stroke={report.overallScore >= 80 ? "#10b981" : report.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 48}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 48 - (report.overallScore / 100) * 2 * Math.PI * 48 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{report.overallScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600">Interview Score</p>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${recommendationColor} px-4 py-1.5 mb-3`}>
                <Award className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{report.overallRecommendation || "Keep Practicing"}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                You completed {report.questionResults?.filter((q) => q.state === "ANSWERED").length ?? 0} of{" "}
                {report.questionResults?.length ?? 0} questions.{" "}
                {report.overallScore >= 80
                  ? "Excellent performance — you're interview ready!"
                  : report.overallScore >= 60
                  ? "Good effort. Focus on the weak areas highlighted below."
                  : "Keep practicing. Review the feedback for each question carefully."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Integrity score card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-28 h-28">
                <svg width={112} height={112} className="-rotate-90">
                  <circle cx={56} cy={56} r={48} fill="none" stroke="#e2e8f0" strokeWidth={10} />
                  <motion.circle
                    cx={56} cy={56} r={48}
                    fill="none"
                    stroke={integrityColor}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 48}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 48 - (integrityScore / 100) * 2 * Math.PI * 48 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{integrityScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600">Integrity Score</p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
              <div className="col-span-2 pb-1.5 border-b border-slate-100 flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldAlert className="h-4 w-4 text-orange-500" />
                  <span>Proctoring Details</span>
                </div>
                <span className="font-semibold text-slate-500">Warnings: {warningsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Eye Contact:</span>
                <span className="font-bold text-slate-800">{eyeContactPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Face Present:</span>
                <span className="font-bold text-slate-800">{facePresentPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Multiple Faces:</span>
                <span className="font-bold text-slate-800">{multipleFacesDetected}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone Checked:</span>
                <span className="font-bold text-slate-800">{phoneChecked}</span>
              </div>
              <div className="flex justify-between col-span-2 pt-1 border-t border-slate-100">
                <span>Workspace Tab Switches:</span>
                <span className="font-bold text-slate-800">{tabSwitches}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Overall strengths & weaknesses */}
      {(report.overallStrengths?.length > 0 || report.overallWeaknesses?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {report.overallStrengths?.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Overall Strengths</p>
              <ul className="space-y-1.5">
                {report.overallStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.overallWeaknesses?.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500">Areas to Improve</p>
              <ul className="space-y-1.5">
                {report.overallWeaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-red-400 font-bold mt-0.5">✗</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Dimension scores */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Breakdown</p>
          <h2 className="text-lg font-bold text-slate-800">Score by dimension</h2>
        </div>
        <div className="space-y-4">
          {dimensions.map((d) => <DimensionBar key={d.label} {...d} />)}
        </div>
      </motion.div>

      {/* Per-question results */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Questions</p>
            <h2 className="text-lg font-bold text-slate-800">Question-by-question review</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Mic className="h-3.5 w-3.5" /> Click any row to expand
          </div>
        </div>
        <div className="space-y-2">
          {(report.questionResults ?? []).map((result, i) => (
            <QuestionRow key={i} result={result} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Proctoring Log Grid */}
      {report.proctorLogs && report.proctorLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
        >
          <div className="mb-5 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-0.5">Audit Log</p>
              <h2 className="text-lg font-bold text-slate-800">Proctoring Activity Log</h2>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[100px_160px_1fr] bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Time</span>
              <span>Violation Type</span>
              <span>Details</span>
            </div>
            <div className="divide-y divide-slate-200">
              {report.proctorLogs.map((log, i) => (
                <div key={i} className="grid grid-cols-[100px_160px_1fr] px-4 py-3 text-xs text-slate-600 font-mono items-center hover:bg-slate-50/50">
                  <span className="text-slate-400">{log.timestamp}</span>
                  <span className="font-semibold text-red-600">{log.type}</span>
                  <span className="text-slate-700">{log.description}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default InterviewReport;

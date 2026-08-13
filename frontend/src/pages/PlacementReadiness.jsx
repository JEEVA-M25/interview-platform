import React, { useEffect, useState } from 'react';
import { readinessApi } from '../services/api';
import { CheckCircle2, AlertTriangle, RefreshCw, Briefcase, FileText, Mic, BrainCircuit, MessageSquare, ShieldCheck, FileCheck2, ArrowUp, ArrowDown, Sparkles, BookOpen } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import bg1 from '../assets/bg2.jpg';

export default function PlacementReadiness({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const token = user?.token || localStorage.getItem('token');
        if (!token) return;
        const res = await readinessApi.getReadiness(token);
        setData(res);
      } catch (err) {
        console.error("Failed to load readiness data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReadiness();
  }, [user]);


  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center justify-center">
      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Calculating your readiness score...</p>
    </div>
  );

  if (!data) return (
    <div className="p-12 text-center text-slate-500">
      Failed to load readiness data. Please try again.
    </div>
  );

  const isReady = data.hasAts && data.hasJobMatch && data.hasInterviews;

  const getScoreColor = (score) => {
    if (!score) return "text-slate-400";
    if (score >= 80) return "text-emerald-600";
    if (score >= 65) return "text-amber-600";
    return "text-red-600";
  };

  const getBgColor = (score) => {
    if (!score) return "bg-slate-100";
    if (score >= 80) return "bg-emerald-500";
    if (score >= 65) return "bg-amber-500";
    return "bg-red-500";
  };

  // Metrics sorting
  const allMetrics = [
    { name: 'ATS', score: data.atsScore, icon: <FileCheck2 className="w-4 h-4" /> },
    { name: 'Job Match', score: data.jobMatchScore, icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Interview Performance', score: data.interviewScore, icon: <Mic className="w-4 h-4" /> },
    { name: 'Technical', score: data.technicalScore, icon: <BrainCircuit className="w-4 h-4" /> },
    { name: 'Communication', score: data.communicationScore, icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Confidence', score: data.confidenceScore, icon: <ShieldCheck className="w-4 h-4" /> }
  ].filter(m => m.score != null);

  const sortedMetrics = [...allMetrics].sort((a, b) => b.score - a.score);
  const topStrengths = sortedMetrics.slice(0, 3);
  const areasToImprove = sortedMetrics.slice(-4).reverse();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Placement Readiness"
        description="Comprehensive evaluation based on your resume, job matches, and AI interviews."
      />

      {!isReady ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-10 text-center border-b border-slate-100">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Insufficient Data</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto">
              Complete the following to calculate your overall Placement Readiness score.
            </p>
          </div>
          <div className="p-8 sm:p-10 max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  {data.hasAts ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertTriangle className="w-6 h-6 text-amber-500" />}
                  <span className="font-bold text-slate-700">ATS Analysis</span>
                </div>
                {data.hasAts ? (
                  <span className={`font-bold ${getScoreColor(data.atsScore)}`}>{data.atsScore}/100</span>
                ) : (
                  <span className="text-sm font-medium text-slate-400">Not available</span>
                )}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  {data.hasJobMatch ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertTriangle className="w-6 h-6 text-amber-500" />}
                  <span className="font-bold text-slate-700">Job Match</span>
                </div>
                {data.hasJobMatch ? (
                  <span className={`font-bold ${getScoreColor(data.jobMatchScore)}`}>{data.jobMatchScore}/100</span>
                ) : (
                  <span className="text-sm font-medium text-slate-400">Not available</span>
                )}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  {data.hasInterviews ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertTriangle className="w-6 h-6 text-amber-500" />}
                  <span className="font-bold text-slate-700">AI Interview</span>
                </div>
                {data.hasInterviews ? (
                  <span className={`font-bold ${getScoreColor(data.interviewScore)}`}>{data.interviewScore}/100</span>
                ) : (
                  <span className="text-sm font-medium text-slate-400">Not completed</span>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              {!data.hasJobMatch && (
                <button onClick={() => onNavigate('job-matching')} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  Analyze a Job Description
                </button>
              )}
              {!data.hasInterviews && (
                <button onClick={() => onNavigate('interview')} className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                  Start AI Interview
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top Row: Overall Score & Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Readiness</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">{data.readinessScore}</span>
                  <span className="text-lg font-semibold text-slate-400">/ 100</span>
                </div>
                <p className={`text-lg font-bold mt-2 ${getScoreColor(data.readinessScore)}`}>
                  {data.classification}
                </p>
              </div>
              <div className="w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={getScoreColor(data.readinessScore)} strokeDasharray={`${data.readinessScore}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>

            {data.previousReadinessScore != null && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">📈 Readiness Progress</h3>
                <div className="flex items-center gap-4 text-xl font-bold">
                  <span className="text-slate-500">{data.previousReadinessScore}</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-slate-900">{data.readinessScore}</span>

                  {data.readinessScore > data.previousReadinessScore && (
                    <span className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm ml-auto">
                      <ArrowUp className="w-4 h-4 mr-1" /> {(data.readinessScore - data.previousReadinessScore).toFixed(1)} points
                    </span>
                  )}
                  {data.readinessScore < data.previousReadinessScore && (
                    <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm ml-auto">
                      <ArrowDown className="w-4 h-4 mr-1" /> {(data.previousReadinessScore - data.readinessScore).toFixed(1)} points
                    </span>
                  )}
                  {data.readinessScore === data.previousReadinessScore && (
                    <span className="text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-sm ml-auto">No change</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Breakdown & Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Score Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Score Breakdown</h3>
              <div className="space-y-5">
                {[
                  { label: 'ATS Analysis', val: data.atsScore, weight: '20%' },
                  { label: 'Job Match', val: data.jobMatchScore, weight: '20%' },
                  { label: 'Interview Average', val: data.interviewScore, weight: '30%' },
                  { label: 'Technical Score', val: data.technicalScore, weight: '15%' },
                  { label: 'Communication', val: data.communicationScore, weight: '10%' },
                  { label: 'Confidence', val: data.confidenceScore, weight: '5%' }
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{stat.label}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{stat.weight}</span>
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(stat.val)}`}>{stat.val}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getBgColor(stat.val)}`} style={{ width: `${stat.val || 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  🏆 Strongest Areas
                </h3>
                <div className="space-y-3">
                  {topStrengths.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">{metric.name}</span>
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">{metric.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 rounded-3xl border border-amber-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  🎯 Focus Areas
                </h3>
                <div className="space-y-3">
                  {areasToImprove.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">{metric.name}</span>
                      <span className="text-sm font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">{metric.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Extracted Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">💼 Skills to Work On</h3>
              {data.skillsToWorkOn?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.skillsToWorkOn.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No recent skill gaps found.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">📄 Resume Improvements</h3>
              {data.resumeImprovements?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.resumeImprovements.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No recent resume improvements found.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">🎤 Interview Insights</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-600">Technical</span>
                  <span className="font-bold text-slate-900">{data.technicalScore}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-600">Communication</span>
                  <span className="font-bold text-slate-900">{data.communicationScore}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-600">Confidence</span>
                  <span className="font-bold text-slate-900">{data.confidenceScore}</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      )}
    </div>
  );
}




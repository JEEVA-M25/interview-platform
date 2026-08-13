import React, { useEffect, useState } from 'react';
import { historyApi } from '../services/api';
import { Download, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, UserCheck, Eye, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function InterviewDetail({ sessionId, onBack, user }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQs, setExpandedQs] = useState({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = user?.token || localStorage.getItem('token');
        if (!token) return;
        const data = await historyApi.getInterviewDetails(sessionId, token);
        setReport(data);
      } catch (err) {
        console.error("Failed to load interview details", err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchReport();
  }, [sessionId, user]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = user?.token || localStorage.getItem('token');
      const blob = await historyApi.downloadReport(sessionId, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CareerVerse-Interview-Report-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  const toggleQ = (idx) => {
    setExpandedQs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center justify-center">
      <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading your report...</p>
    </div>
  );
  
  if (!report) return (
    <div className="p-12 text-center text-slate-500">
      Failed to load report. Please try again.
    </div>
  );

  const totalQuestions = report.questionResults?.length || 10;
  const maxScore = totalQuestions * 10;
  const scoreNum = report.overallScore || 0;
  const scorePercent = Math.min(100, Math.max(0, (scoreNum / maxScore) * 100)) || 0;

  const scoreLabel = scorePercent >= 80 ? "Excellent Performance" 
                   : scorePercent >= 60 ? "Good Effort" 
                   : "Needs Significant Preparation";

  const getDimensionColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your interview report</h1>
            <p className="text-slate-500 font-medium mt-1">
              {report.role} • {report.difficulty}
            </p>
          </div>
        </div>
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Overall Score & Integrity */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center flex flex-col items-center">
            {/* Circular Progress (SVG) */}
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${scorePercent >= 80 ? 'text-emerald-500' : scorePercent >= 60 ? 'text-amber-500' : 'text-red-500'}`}
                  strokeDasharray={`${scorePercent}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">{scoreNum}</span>
                <span className="text-sm font-semibold text-slate-400">/ {maxScore}</span>
              </div>
            </div>
            
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Interview Score</h3>
            <p className={`text-lg font-bold ${scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {scoreLabel}
            </p>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              You completed {report.questionResults?.length || 0} questions. Keep practicing.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Session Integrity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Warnings Issued</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{report.warningsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Eye Contact</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{report.eyeContactPercentage || 100}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Face Present</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{report.facePresentPercentage || 100}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Dimensions & Strengths/Weaknesses */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Overall Strengths</h3>
              <p className="text-emerald-900 font-medium text-sm leading-relaxed">
                {report.overallStrengths || "No major strengths recorded for this session."}
              </p>
            </div>
            <div className="bg-red-50 rounded-3xl border border-red-100 p-6">
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3">Areas to Improve</h3>
              <p className="text-red-900 font-medium text-sm leading-relaxed">
                {report.overallWeaknesses || "No major weaknesses recorded for this session."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <span className="text-xl">🎙️</span> Vocal Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Vocal Pattern</p>
                <p className="text-lg font-extrabold text-slate-900">{report.overallEmotion ? `🎙️ ${report.overallEmotion}` : 'Not Available'}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Average Emotion Confidence</p>
                <p className="text-lg font-extrabold text-slate-900">{report.averageEmotionConfidence ? `${(report.averageEmotionConfidence * 100).toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Analyzed Answers</p>
                <p className="text-lg font-extrabold text-slate-900">{report.analyzedAnswers || 0} / {report.totalAnswers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Score by dimension</h3>
            <div className="space-y-6">
              {[
                { label: 'Technical', val: report.technicalScore },
                { label: 'Communication', val: report.communicationScore },
                { label: 'Problem Solving', val: report.problemSolvingScore },
                { label: 'Grammar', val: report.grammarScore },
                { label: 'Confidence', val: report.confidenceScore },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">{stat.label}</span>
                    <span className="text-sm font-bold text-slate-900">{stat.val || 0}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getDimensionColor(stat.val || 0)}`} 
                      style={{ width: `${stat.val || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Question-by-question review</h2>
        <div className="space-y-4">
          {report.questionResults?.map((q, idx) => {
            const isExpanded = expandedQs[idx];
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                <div 
                  className="flex cursor-pointer items-center justify-between p-5 sm:p-6 hover:bg-slate-50 transition-colors"
                  onClick={() => toggleQ(idx)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {idx + 1}
                    </div>
                    <div className="mt-1">
                      <p className="font-bold text-slate-900 leading-snug">
                        {q.question}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                          q.score >= 8 ? 'bg-emerald-50 text-emerald-600' 
                          : q.score >= 5 ? 'bg-amber-50 text-amber-600' 
                          : 'bg-red-50 text-red-600'
                        }`}>
                          {q.score}/10
                        </span>
                        
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                          {q.emotion ? `🎙️ ${q.emotion} · ${(q.emotionConfidence * 100).toFixed(1)}%` : `🎙️ Vocal analysis unavailable`}
                        </span>
                        {q.isFollowUp && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 uppercase">
                            Follow-Up
                          </span>
                        )}
                        <span className="text-xs font-medium text-slate-400">
                          {q.responseTimeSeconds}s response time
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    {isExpanded ? <ChevronUp className="text-slate-400 w-5 h-5" /> : <ChevronDown className="text-slate-400 w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Your Answer
                        </h4>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-700 leading-relaxed font-medium">
                          {q.editedTranscript || q.rawTranscript ? (
                            <p>"{q.editedTranscript || q.rawTranscript}"</p>
                          ) : (
                            <p className="text-slate-400 italic">No answer provided.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-orange-500" /> AI Feedback
                        </h4>
                        <div className="text-sm text-slate-700 leading-relaxed font-medium">
                          <p>{q.feedback}</p>
                          
                          {(q.strengths || q.weaknesses) && (
                            <div className="mt-4 space-y-3">
                              {q.strengths && (
                                <div>
                                  <span className="font-bold text-emerald-600 text-xs uppercase tracking-wider block mb-1">Strengths</span>
                                  <p className="text-slate-600">{q.strengths}</p>
                                </div>
                              )}
                              {q.weaknesses && (
                                <div>
                                  <span className="font-bold text-red-600 text-xs uppercase tracking-wider block mb-1">Areas to Improve</span>
                                  <p className="text-slate-600">{q.weaknesses}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

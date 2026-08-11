import React from 'react';
import { Calendar, Award, BriefcaseBusiness, ChevronRight } from 'lucide-react';

export default function InterviewCard({ interview, onClick }) {
  const { role, difficulty, interviewDate, overallScore, status } = interview;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-slate-400 bg-slate-50';
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-md hover:border-orange-200 flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <BriefcaseBusiness className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {role}
            </h3>
            <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4 flex-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatDate(interviewDate)}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span className={`w-2 h-2 rounded-full ${
            status === 'COMPLETED' ? 'bg-emerald-500' : status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-300'
          }`}></span>
          {status}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 px-2 items-center justify-center rounded-lg text-xs font-bold ${getScoreColor(overallScore)}`}>
            {overallScore ? `${overallScore} / 100` : '—'}
          </div>
        </div>
        <div className="text-slate-300 group-hover:text-orange-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function ScoreCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
            <Icon size={20} />
          </div>
        )}
        <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        {subtitle && <span className="text-sm text-slate-500">{subtitle}</span>}
      </div>
    </div>
  );
}

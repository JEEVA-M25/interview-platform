import React from 'react';

export default function ScoreCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <Icon size={20} />
          </div>
        )}
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {subtitle && <span className="text-sm text-slate-500">{subtitle}</span>}
      </div>
    </div>
  );
}

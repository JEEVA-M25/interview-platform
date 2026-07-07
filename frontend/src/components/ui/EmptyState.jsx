function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm border border-slate-200">
        {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xl">✦</span>}
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;

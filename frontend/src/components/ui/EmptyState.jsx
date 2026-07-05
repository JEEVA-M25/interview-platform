function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
        {Icon ? (
          <Icon className="h-6 w-6" />
        ) : (
          <span className="text-2xl">✦</span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action}
    </div>
  );
}

export default EmptyState;

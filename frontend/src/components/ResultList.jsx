const sectionStyles = {
  "Matched skills":  { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-100" },
  "Missing skills":  { dot: "bg-red-400",     text: "text-red-700",     bg: "bg-red-50",      border: "border-red-100"     },
  "Action plan":     { dot: "bg-orange-400",  text: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-100"  },
};

const fallback = { dot: "bg-slate-400", text: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" };

function parseItems(items) {
  if (!items?.length) return [];
  return items.flatMap(item =>
    String(item)
      .split(/\n|(?<=\.)\s+(?=[A-Z•\-*\d])/)
      .map(s => s.replace(/^[\s•\-*\d.]+/, "").trim())
      .filter(Boolean)
  );
}

function ResultList({ title, items }) {
  const parsed = parseItems(items);
  if (!parsed.length) return null;

  const style = sectionStyles[title] || fallback;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${style.text}`}>{title}</h3>
      <ul className="space-y-2">
        {parsed.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResultList;

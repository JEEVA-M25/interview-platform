import { motion } from "framer-motion";

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "blue",
  trend,
  children,
}) {
  const accentStyles = {
    blue: "from-blue-500/10 to-cyan-500/10 text-blue-600",
    green: "from-emerald-500/10 to-green-500/10 text-emerald-600",
    amber: "from-amber-500/10 to-orange-500/10 text-amber-600",
    violet: "from-violet-500/10 to-fuchsia-500/10 text-violet-600",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.3)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={`rounded-2xl bg-gradient-to-br ${accentStyles[accent]} p-3`}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      {description && (
        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      )}
      {trend && (
        <p className="mt-3 text-sm font-medium text-emerald-600">{trend}</p>
      )}
      {children}
    </motion.article>
  );
}

export default DashboardCard;

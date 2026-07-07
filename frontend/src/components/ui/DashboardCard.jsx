import { motion } from "framer-motion";

const accentStyles = {
  orange: "from-orange-500/15 to-amber-500/15 text-orange-600",
  green:  "from-emerald-500/15 to-green-500/15 text-emerald-600",
  amber:  "from-amber-500/15 to-yellow-500/15 text-amber-600",
  red:    "from-red-500/15 to-orange-500/15 text-red-600",
  blue:   "from-orange-500/15 to-amber-500/15 text-orange-600",
  violet: "from-amber-500/15 to-orange-500/15 text-amber-600",
};

function DashboardCard({ title, value, description, icon: Icon, accent = "orange", trend, children }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl bg-gradient-to-br ${accentStyles[accent] || accentStyles.orange} p-2.5`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {description && <p className="mt-3 text-sm text-slate-500 leading-relaxed">{description}</p>}
      {trend && <p className="mt-2 text-sm font-medium text-emerald-600">{trend}</p>}
      {children}
    </motion.article>
  );
}

export default DashboardCard;

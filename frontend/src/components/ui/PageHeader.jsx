import { motion } from "framer-motion";

function PageHeader({ eyebrow, title, description, actions, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] backdrop-blur sm:p-5 ${compact ? "min-h-[132px]" : ""}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}

export default PageHeader;

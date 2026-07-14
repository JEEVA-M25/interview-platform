import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIPS = {
  ats: [
    "Tailor your resume keywords to match the target job description for a higher ATS score.",
    "Use active, strong action verbs (e.g., 'led', 'engineered', 'optimized') rather than passive ones.",
    "Quantify your achievements: 'increased sales by 20%' is stronger than 'responsible for sales'.",
    "Keep formatting clean; avoid complex multi-column tables which can confuse older ATS scanners.",
    "Include both full terms and acronyms, e.g., 'Project Management Professional (PMP)'.",
    "Ensure your contact details are clear and avoid putting critical info in headers/footers."
  ],
  matching: [
    "Tailor your resume keywords to match the target job description for a higher match score.",
    "Quantify your achievements: 'led a team of 4 developers to build X' is more impactful than 'helped build X'.",
    "Make sure key technologies listed in the JD are prominently displayed in your resume.",
    "Use standard section headers (e.g., 'Work Experience', 'Skills') so the AI can easily parse your background.",
    "Showcase projects that demonstrate hands-on experience with the requirements of the job description."
  ],
  setup: [
    "Find a quiet, well-lit space where you won't be interrupted during the session.",
    "Make sure your webcam is positioned at eye level for optimal proctoring metrics.",
    "Speak at a natural, steady pace. Taking short pauses is completely fine!",
    "Have a glass of water nearby to stay comfortable throughout the interview.",
    "Double-check that your microphone levels are clear and background noise is minimal."
  ],
  submitting: [
    "Gemini is analyzing your response for semantic correctness and relevance...",
    "Using the STAR method (Situation, Task, Action, Result) helps keep your answers structured.",
    "Remember to speak clearly; our speech-to-text model benefits from precise pronunciation."
  ],
  finishing: [
    "Compiling your answers, eye-contact metrics, and safety flags for the final report...",
    "Evaluating key developer capabilities based on your target role...",
    "Generating personalized recommendations to bridge identified skill gaps...",
    "Almost ready! Finalizing your comprehensive AI feedback report..."
  ]
};

export function LoadingDots({ color = "bg-orange-500", size = "w-2.5 h-2.5" }) {
  const dotVariants = {
    initial: {
      y: 0,
      opacity: 0.3,
    },
    animate: {
      y: [0, -6, 0],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex items-center gap-1.5 justify-center py-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${size} rounded-full ${color}`}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
}

export function Spinner({ color = "border-orange-500", size = "h-4 w-4" }) {
  return (
    <div
      className={`${size} animate-spin rounded-full border-2 border-slate-200 border-t-transparent ${color}`}
    />
  );
}

export default function LoadingDistractor({
  type = "setup",
  title = "Processing...",
  subtitle = "Please wait a moment",
  estimatedDuration = 15000, // milliseconds
}) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const tips = TIPS[type] || TIPS.setup;
  const isAts = type === "ats";
  const themeColor = isAts ? "blue" : "orange";

  // Progress Bar Simulation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Calculate fraction, cap at 95% to let actual transition handle the 100% completion
      const fraction = Math.min(0.95, elapsed / estimatedDuration);
      // Logarithmic curve for more realistic progress feel
      const easeProgress = Math.round((1 - Math.pow(1 - fraction, 2)) * 100);
      setProgress(easeProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [estimatedDuration]);

  // Tips Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [tips]);

  return (
    <div className="w-full mx-auto p-6 text-center space-y-6">
      {/* Visual Indicator */}
      <div className="flex justify-center items-center">
        <div className={`relative flex items-center justify-center p-6 rounded-full ${isAts ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <div className={`absolute inset-0 rounded-full border-4 ${isAts ? 'border-blue-100/50' : 'border-orange-100/50'} animate-pulse`} />
          <Spinner
            size="h-12 w-12"
            color={isAts ? "text-blue-600 border-t-blue-600" : "text-orange-500 border-t-orange-500"}
          />
        </div>
      </div>

      {/* Title & Bouncing Dots */}
      <div className="space-y-1">
        <h3 className={`text-lg font-bold text-slate-800 flex items-center justify-center gap-2`}>
          {title}
        </h3>
        <p className="text-sm text-slate-500">{subtitle}</p>
        <LoadingDots
          color={isAts ? "bg-blue-600" : "bg-orange-500"}
          size="w-2 h-2"
        />
      </div>

      {/* Progress Bar Container */}
      <div className="max-w-md mx-auto space-y-1.5">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${
              isAts ? "from-blue-500 to-indigo-500" : "from-orange-500 to-amber-500"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400 font-semibold px-1">
          <span>Preparing system</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Distracting Tips Slide */}
      <div className={`max-w-md mx-auto p-4 rounded-2xl border bg-slate-50 border-slate-150 relative overflow-hidden min-h-[96px] flex items-center justify-center`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-xs text-slate-600 leading-relaxed font-medium px-4"
          >
            <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              isAts ? "text-blue-600" : "text-orange-500"
            }`}>
              Useful Tip
            </span>
            "{tips[tipIndex]}"
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

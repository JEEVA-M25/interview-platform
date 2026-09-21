import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ChevronRight, ChevronLeft, Loader2, UploadCloud, CheckCircle2, Check, ChevronDown } from "lucide-react";
import PageHeader from "./ui/PageHeader.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";
import { interviewApi } from "../services/api.js";
import LoadingDistractor from "./ui/LoadingDistractor.jsx";

const ROLES = [
  { value: "Software Engineer", label: "Software Engineer", emoji: "💻" },
  { value: "Frontend Developer", label: "Frontend Developer", emoji: "🎨" },
  { value: "Backend Developer", label: "Backend Developer", emoji: "⚙️" },
  { value: "Full Stack Developer", label: "Full Stack Developer", emoji: "🌐" },
  { value: "Data Scientist", label: "Data Scientist", emoji: "🧠" },
  { value: "Data Analyst", label: "Data Analyst", emoji: "📊" },
  { value: "DevOps Engineer", label: "DevOps Engineer", emoji: "🚀" },
  { value: "Product Manager", label: "Product Manager", emoji: "👔" },
  { value: "UI/UX Designer", label: "UI/UX Designer", emoji: "✨" },
  { value: "QA Engineer", label: "QA Engineer", emoji: "🧪" },
  { value: "Mobile Developer", label: "Mobile Developer", emoji: "📱" },
  { value: "Cloud Architect", label: "Cloud Architect", emoji: "☁️" },
  { value: "Security Analyst", label: "Security Analyst", emoji: "🛡️" },
  { value: "Machine Learning Engineer", label: "ML Engineer", emoji: "🤖" },
  { value: "System Administrator", label: "SysAdmin", emoji: "🖥️" },
  { value: "Business Analyst", label: "Business Analyst", emoji: "📈" }
];

const DIFFICULTIES = [
  { value: "Easy", label: "Easy", desc: "Fundamentals & concepts", color: "emerald" },
  { value: "Medium", label: "Medium", desc: "Applied knowledge", color: "amber" },
  { value: "Hard", label: "Hard", desc: "Senior-level depth", color: "red" },
];

const btnPrimary =
  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
const btnSecondary =
  "flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors";

function RoleSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-all bg-white ${
          isOpen ? "border-purple-600 ring-4 ring-purple-600/10" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              <span className="text-xl bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100">{selectedOption.emoji}</span>
              <span className="font-bold text-slate-800">{selectedOption.label}</span>
            </>
          ) : (
            <>
              <span className="text-xl bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100">🎯</span>
              <span className="text-slate-400 font-medium">-- Select a Target Role --</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Decorative K key hint like in the screenshot */}
          {selectedOption && !isOpen && (
            <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500">
              K
            </div>
          )}
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden"
          >
            <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all border-2 border-transparent ${
                    value === opt.value ? "bg-slate-100/80" : "hover:bg-slate-50 hover:border-slate-300 hover:border-dashed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className={`text-sm ${value === opt.value ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                      {opt.label}
                    </span>
                  </div>
                  {value === opt.value && (
                    <Check className="w-4 h-4 text-slate-800" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InterviewSetup({ token, onSessionCreated, onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const totalSteps = 2;

  async function handleStart(e) {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    if (!resumeFile) return;
    setStatus("loading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      fd.append("role", role);
      fd.append("difficulty", difficulty);
      const session = await interviewApi.createSession(fd, token);
      onSessionCreated(session);
    } catch (err) {
      setError(err.message || "Failed to create session. Please try again.");
      setStatus("idle");
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <PageHeader
        eyebrow="AI Interview"
        title="Set up your interview"
        description="Upload your resume, choose a role and difficulty — we'll generate 10 tailored questions."
        actions={[
          <button key="back" type="button" className="text-slate-500 hover:text-slate-900 font-semibold px-4 py-2" onClick={onBack}>
            ← Exit Setup
          </button>,
        ]}
      />

      {status === "loading" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[24px] border border-slate-200/80 bg-white p-8 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)]"
        >
          <LoadingDistractor
            type="setup"
            title="Preparing your assessment questions"
            subtitle="Tailoring 10 personalized questions ..."
            estimatedDuration={16000}
          />
        </motion.div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
          {/* Stepper Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 sm:px-10">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
              </div>
              <span className={`font-bold text-sm ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Select Role</span>
              
              <div className="w-8 sm:w-16 h-0.5 bg-slate-200 mx-2">
                <div className={`h-full bg-orange-500 transition-all duration-500 ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>

              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
              <span className={`font-bold text-sm ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Upload Resume</span>
            </div>
            <div className="text-sm font-bold text-slate-400">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          <form onSubmit={handleStart} className="p-6 sm:p-10 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 space-y-8"
                >
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-900">Choose your role & difficulty</h2>
                    <p className="text-slate-500 font-medium">We will tailor the interview specifically for this target.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center text-xs">A</span> 
                      Select Target Role
                    </h3>
                    <RoleSelect 
                      value={role} 
                      onChange={setRole} 
                      options={ROLES} 
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">B</span> 
                      Select Difficulty
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDifficulty(d.value)}
                          className={`flex flex-col items-start rounded-2xl border-2 p-5 transition-all text-left ${
                            difficulty === d.value
                              ? d.color === "emerald"
                                ? "border-emerald-500 bg-emerald-50 shadow-md scale-[1.02]"
                                : d.color === "amber"
                                ? "border-amber-500 bg-amber-50 shadow-md scale-[1.02]"
                                : "border-red-500 bg-red-50 shadow-md scale-[1.02]"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`font-extrabold text-lg mb-1 ${difficulty === d.value ? (d.color === "emerald" ? 'text-emerald-700' : d.color === "amber" ? 'text-amber-700' : 'text-red-700') : 'text-slate-700'}`}>
                            {d.label}
                          </span>
                          <span className={`text-sm font-medium ${difficulty === d.value ? (d.color === "emerald" ? 'text-emerald-600' : d.color === "amber" ? 'text-amber-600' : 'text-red-600') : 'text-slate-500'}`}>
                            {d.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 space-y-6"
                >
                  <div className="text-center space-y-2 mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900">Upload your resume</h2>
                    <p className="text-slate-500 font-medium">PDF, DOC, DOCX, or TXT — we'll extract your skills automatically.</p>
                  </div>

                  <div className="max-w-xl mx-auto">
                    <label className={`flex cursor-pointer flex-col gap-4 rounded-3xl border-2 border-dashed p-10 text-center transition-all ${resumeFile ? 'border-emerald-400 bg-emerald-50/50' : 'border-orange-200 bg-orange-50/40 hover:border-orange-400 hover:bg-orange-50'}`}>
                      <div className="flex flex-col items-center gap-3">
                        {resumeFile ? (
                          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-2">
                            <UploadCloud className="h-8 w-8 text-orange-500" />
                          </div>
                        )}
                        <span className={`text-lg font-bold ${resumeFile ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {resumeFile ? resumeFile.name : "Click to choose a file"}
                        </span>
                        <span className="text-sm font-medium text-slate-400">
                          {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : "Maximum file size: 5MB"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        required={currentStep === 2}
                      />
                    </label>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Stepper Footer Controls */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button type="button" onClick={prevStep} className={btnSecondary}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-4">
                {error && <p className="text-sm font-bold text-red-500 max-w-xs text-right">{error}</p>}
                
                {currentStep < totalSteps ? (
                  <button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!role} 
                    className={btnPrimary}
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={status === "loading" || !resumeFile} 
                    className={btnPrimary}
                  >
                    {status === "loading" ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><BrainCircuit className="w-4 h-4" /> Start Interview</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default InterviewSetup;

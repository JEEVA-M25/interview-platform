import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle2, ChevronRight, Loader2,
  Mic, MicOff, SkipForward, Square, Video, VideoOff,
} from "lucide-react";
import { interviewApi } from "../services/api.js";

// ── Speech Recognition ────────────────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => !!SpeechRecognition);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      setTranscript(full);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    setTranscript("");
    setListening(false);
  }, []);

  return { transcript, setTranscript, listening, supported, start, stop, reset };
}

// ── Timer ─────────────────────────────────────────────────────────────────
function useTimer(active) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ── TTS ───────────────────────────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

// ── Camera preview ────────────────────────────────────────────────────────
function CameraPreview() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    if (active) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setActive(true);
        setError(false);
      } catch {
        setError(true);
      }
    }
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm shadow-slate-200/60">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Camera</span>
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            active
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {active ? <><VideoOff className="h-3 w-3" /> Off</> : <><Video className="h-3 w-3" /> On</>}
        </button>
      </div>
      <div className="relative bg-slate-900 aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${active ? "opacity-100" : "opacity-0"}`}
        />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
            <VideoOff className="h-8 w-8 opacity-30" />
            <span className="text-xs opacity-50">{error ? "Camera unavailable" : "Camera off"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Typing animation ──────────────────────────────────────────────────────
function TypingDots() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 3), 500);
    return () => clearInterval(id);
  }, []);
  const dots = ["●", "● ●", "● ● ●"][frame];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
        <span className="text-orange-500 text-sm font-bold">AI</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-orange-500 mb-0.5">Evaluating your answer...</p>
        <p className="text-base text-orange-400 tracking-widest">{dots}</p>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────
function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-500 shrink-0">{completed}/{total}</span>
    </div>
  );
}

// ── Eval card ─────────────────────────────────────────────────────────────
function EvalCard({ evaluation, onNext }) {
  const color = evaluation.score >= 8 ? "emerald" : evaluation.score >= 5 ? "amber" : "red";
  const colorMap = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700"   },
    red:     { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     badge: "bg-red-100 text-red-700"       },
  };
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${c.border} ${c.bg} p-5 space-y-3`}
    >
      {evaluation.interviewerComment && (
        <div className="flex items-start gap-2.5 rounded-xl border border-orange-200 bg-white px-4 py-3">
          <span className="text-xs font-bold text-orange-500 bg-orange-50 rounded-lg px-2 py-1 shrink-0">AI</span>
          <p className="text-sm text-slate-700 italic leading-relaxed">{evaluation.interviewerComment}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`h-5 w-5 ${c.text}`} />
          <span className="font-semibold text-slate-800">Answer evaluated</span>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${c.badge}`}>{evaluation.score}/10</span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{evaluation.feedback}</p>
      {evaluation.strengths && (
        <p className="text-sm text-emerald-700"><span className="font-semibold">✓ </span>{evaluation.strengths}</p>
      )}
      {evaluation.weaknesses && (
        <p className="text-sm text-red-600"><span className="font-semibold">✗ </span>{evaluation.weaknesses}</p>
      )}
      {evaluation.responseTimeSeconds != null && (
        <p className="text-xs text-slate-400">Response time: {evaluation.responseTimeSeconds}s</p>
      )}
      {evaluation.hasFollowUp && evaluation.followUpQuestion && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Follow-up question</p>
          <p className="text-sm text-slate-800">{evaluation.followUpQuestion.question}</p>
        </div>
      )}
      <button
        onClick={onNext}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
      >
        {evaluation.hasFollowUp ? "Answer follow-up" : "Next question"}
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ── Interviewer intro screen ──────────────────────────────────────────────
function InterviewerIntro({ intro, onBegin }) {
  useEffect(() => {
    speak(intro);
    return () => stopSpeaking();
  }, [intro]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-8 shadow-sm text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
        <span className="text-2xl font-bold text-white">AI</span>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Your AI Interviewer</p>
        <p className="text-slate-800 text-base leading-relaxed font-medium">{intro}</p>
      </div>
      <button
        onClick={() => { stopSpeaking(); onBegin(); }}
        className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02]"
      >
        I'm ready — let's begin →
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
function InterviewSession({ session: initialSession, token, onFinished }) {
  const [session] = useState(initialSession);
  const [questions, setQuestions] = useState(initialSession.questions);
  const [currentIdx, setCurrentIdx] = useState(initialSession.currentQuestionIndex ?? 0);
  const [phase, setPhase] = useState("question"); // question | submitting | evaluated | finishing
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(!!initialSession.interviewerIntro);
  const shownAtRef = useRef(null);

  const { transcript, setTranscript, listening, supported, start, stop, reset } =
    useSpeechRecognition();
  const timerSeconds = useTimer(listening);

  const currentQuestion = questions[currentIdx] ?? null;
  const answeredCount = questions.filter(
    (q) => q.state === "ANSWERED" || q.state === "SKIPPED"
  ).length;

  // Speak question when it changes (after intro dismissed)
  useEffect(() => {
    if (showIntro || !currentQuestion) return;
    shownAtRef.current = new Date().toISOString();
    speak(currentQuestion.question);
    interviewApi.markQuestionShown(session.sessionId, currentQuestion.id, token).catch(() => {});
  }, [currentQuestion?.id, showIntro]);

  // Speak interviewerComment when evaluation arrives
  useEffect(() => {
    if (evaluation?.interviewerComment) speak(evaluation.interviewerComment);
  }, [evaluation]);

  function handleBeginInterview() {
    setShowIntro(false);
  }

  function handleStartRecording() {
    stopSpeaking();
    reset();
    start();
  }

  function handleStopRecording() { stop(); }

  async function handleSubmit() {
    if (!transcript.trim()) return;
    stopSpeaking();
    setPhase("submitting");
    setError("");
    try {
      const payload = {
        questionId: currentQuestion.id,
        transcript: transcript.trim(),
        questionShownAt: shownAtRef.current,
      };
      const eval_ = await interviewApi.submitAnswer(session.sessionId, payload, token);
      setQuestions((prev) =>
        prev.map((q) => q.id === currentQuestion.id ? { ...q, state: "ANSWERED" } : q)
      );
      if (eval_.hasFollowUp && eval_.followUpQuestion) {
        setQuestions((prev) => {
          const next = [...prev];
          next.splice(currentIdx + 1, 0, eval_.followUpQuestion);
          return next;
        });
      }
      setEvaluation(eval_);
      setPhase("evaluated");
    } catch (err) {
      setError(err.message || "Failed to submit answer.");
      setPhase("question");
    }
  }

  async function handleSkip() {
    setError("");
    stopSpeaking();
    try {
      await interviewApi.skipQuestion(session.sessionId, currentQuestion.id, token);
      setQuestions((prev) =>
        prev.map((q) => q.id === currentQuestion.id ? { ...q, state: "SKIPPED" } : q)
      );
      advanceOrFinish();
    } catch (err) {
      setError(err.message || "Failed to skip question.");
    }
  }

  function handleNext() {
    setEvaluation(null);
    reset();
    advanceOrFinish();
  }

  function advanceOrFinish() {
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      setPhase("question");
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    stopSpeaking();
    setPhase("finishing");
    setError("");
    try {
      const report = await interviewApi.endSession(session.sessionId, token);
      onFinished(report);
    } catch (err) {
      setError(err.message || "Failed to generate report.");
      setPhase("question");
    }
  }

  // Show intro screen first
  if (showIntro) {
    return (
      <div className="max-w-3xl mx-auto pt-8">
        <InterviewerIntro intro={initialSession.interviewerIntro} onBegin={handleBeginInterview} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 max-w-5xl mx-auto items-start">
      {/* Main column */}
      <div className="space-y-4">
        {/* Header bar */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">AI Interview</p>
              <h1 className="text-lg font-bold text-slate-900">{session.role} · {session.difficulty}</h1>
            </div>
            <div className="flex items-center gap-3">
              {listening && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full tabular-nums">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {formatTime(timerSeconds)}
                </span>
              )}
              <button
                onClick={handleFinish}
                disabled={phase === "finishing"}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {phase === "finishing" ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Finishing...</span>
                ) : "End Interview"}
              </button>
            </div>
          </div>
          <ProgressBar completed={answeredCount} total={questions.length} />
          <p className="text-xs text-slate-400 mt-1.5">
            Question {currentIdx + 1} of {questions.length} · {questions.length - answeredCount} remaining
          </p>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 space-y-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-orange-600">{currentIdx + 1}</span>
                </div>
                <div className="flex-1">
                  {currentQuestion.isFollowUp && (
                    <span className="inline-block mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                      Follow-up
                    </span>
                  )}
                  <p className="text-base font-semibold text-slate-900 leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>
              </div>

              {/* Typing animation while submitting */}
              {phase === "submitting" && <TypingDots />}

              {/* Transcript + controls */}
              {phase !== "evaluated" && phase !== "submitting" && (
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder={
                        supported
                          ? "Click the mic to start speaking, or type your answer here..."
                          : "Type your answer here..."
                      }
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 resize-none transition-colors"
                    />
                    {listening && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-red-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Listening...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {supported && (
                      <>
                        {!listening ? (
                          <button
                            type="button"
                            onClick={handleStartRecording}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02]"
                          >
                            <Mic className="h-4 w-4" /> Start Recording
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleStopRecording}
                            className="flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
                          >
                            <Square className="h-4 w-4" /> Stop Recording
                          </button>
                        )}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!transcript.trim() || listening}
                      className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <MicOff className="h-4 w-4" /> Submit Answer
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors"
                    >
                      <SkipForward className="h-4 w-4" /> Skip
                    </button>
                  </div>

                  {!supported && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700">Speech recognition not supported. Please type your answer.</p>
                    </div>
                  )}
                </div>
              )}

              {phase === "evaluated" && evaluation && (
                <EvalCard evaluation={evaluation} onNext={handleNext} />
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "finishing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center shadow-sm"
          >
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">Generating your report...</p>
            <p className="text-sm text-slate-500 mt-1">Gemini is scoring your full interview. This takes a few seconds.</p>
          </motion.div>
        )}
      </div>

      {/* Side column — camera */}
      <div className="space-y-4">
        <CameraPreview />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tips</p>
          <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
            <li>• Speak clearly and at a steady pace</li>
            <li>• Structure answers with examples</li>
            <li>• It's OK to take a moment to think</li>
            <li>• You can edit the transcript before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InterviewSession;

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle2, ChevronRight, Loader2,
  Mic, MicOff, SkipForward, Square, Video, ShieldAlert
} from "lucide-react";
import { interviewApi, speechApi } from "../services/api.js";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import LoadingDistractor, { Spinner } from "./ui/LoadingDistractor.jsx";

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
    // Cancel any active session before starting
    recognitionRef.current?.stop();
    
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

// ── Timer formatting ──────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ── TTS ───────────────────────────────────────────────────────────────────
let currentAudio = null;
let currentSpeakId = 0;
const audioCache = new Map();

export function cancelSpeech() {
  currentSpeakId++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export async function prefetchAudio(id, text, token) {
  if (audioCache.has(id)) return audioCache.get(id);
  try {
    // Pad text to prevent Sarvam from cutting off first words due to Bluetooth/audio initialization
    const paddedText = "Here is the question. " + text;
    const blob = await speechApi.synthesizeSpeech(paddedText, token);
    const url = URL.createObjectURL(blob);
    audioCache.set(id, url);
    return url;
  } catch (err) {
    console.error("Prefetch failed:", err);
    return null;
  }
}

export async function playAudio(id, text, token) {
  cancelSpeech();
  const speakId = currentSpeakId;
  
  let url = audioCache.get(id);
  if (!url) {
    url = await prefetchAudio(id, text, token);
  }
  
  if (speakId !== currentSpeakId) return; // aborted during fetch
  
  if (url) {
    currentAudio = new Audio(url);
    currentAudio.play().catch(e => console.error("Audio play failed:", e));
  }
}

// ── Main component ────────────────────────────────────────────────────────
function InterviewSession({ session: initialSession, token, onFinished }) {
  const [session] = useState(initialSession);
  const [questions, setQuestions] = useState(initialSession.questions);
  const [currentIdx, setCurrentIdx] = useState(initialSession.currentQuestionIndex ?? 0);
  const [phase, setPhase] = useState("question"); // question | submitting | finishing
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(!!initialSession.interviewerIntro);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const shownAtRef = useRef(null);

  const { transcript, setTranscript, listening, supported, start, stop, reset } =
    useSpeechRecognition();

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);
  const [isProcessingStt, setIsProcessingStt] = useState(false);

  // Proctor state counters
  const [faceState, setFaceState] = useState("Detected"); // Detected | Not Detected
  const [eyesState, setEyesState] = useState("Looking Forward"); // Looking Forward | Looking Away
  const [peopleState, setPeopleState] = useState("1"); // 0 | 1 | 2+
  const [warningsCount, setWarningsCount] = useState(0);

  // Timeouts for violations
  const noFaceTimeRef = useRef(0);
  const lookingAwayTimeRef = useRef(0);

  const lastNoFaceWarningTime = useRef(0);
  const lastLookingAwayWarningTime = useRef(0);
  const lastMultipleFacesWarningTime = useRef(0);

  // Warning text to overlay on UI
  const [warningText, setWarningText] = useState("");

  // MediaPipe landmarker refs
  const [landmarker, setLandmarker] = useState(null);
  const [loadingLandmarker, setLoadingLandmarker] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [tabSwitchesCount, setTabSwitchesCount] = useState(0);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Integrity metrics variables
  const totalFramesRef = useRef(0);
  const facePresentFramesRef = useRef(0);
  const eyeContactFramesRef = useRef(0);
  const tabSwitchesRef = useRef(0);
  const multipleFacesRef = useRef(false);

  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Synchronize transcript for timeout handler
  const transcriptRef = useRef("");
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Load MediaPipe Face Landmarker
  useEffect(() => {
    async function initLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        const lm = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO"
        });
        setLandmarker(lm);
        setLoadingLandmarker(false);
      } catch (err) {
        console.error("Failed to initialize FaceLandmarker:", err);
        setLoadingLandmarker(false);
      }
    }
    initLandmarker();
  }, []);

  // Initialize camera stream
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setCameraError(false);
      } catch (err) {
        console.error("Failed to start camera:", err);
        setCameraActive(false);
        setCameraError(true);
      }
    }
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Re-bind camera stream to videoRef when intro screen changes
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showIntro, cameraActive]);

  const handleRetryCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraError(false);
    } catch (err) {
      console.error("Failed to restart camera:", err);
      setCameraActive(false);
      setCameraError(true);
    }
  }, []);

  // Violation logging handler
  const handleViolation = useCallback(async (type, description) => {
    setWarningsCount((w) => w + 1);
    try {
      await interviewApi.submitProctorLog(session.sessionId, type, description, token);
    } catch (err) {
      console.error("Failed to upload proctor violation log:", err);
    }
  }, [session.sessionId, token]);

  // MediaPipe detection loop
  const loop = useCallback(() => {
    if (!videoRef.current || !landmarker || !cameraActive) {
      requestRef.current = requestAnimationFrame(loop);
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;

      // Run detection
      const startTimeMs = performance.now();
      const result = landmarker.detectForVideo(video, startTimeMs);

      totalFramesRef.current += 1;
      const numFaces = result.faceLandmarks ? result.faceLandmarks.length : 0;
      
      // Face detection evaluation
      if (numFaces === 0) {
        setFaceState("Not Detected");
        setEyesState("Looking Away");
        setPeopleState("0");

        if (noFaceTimeRef.current === 0) {
          noFaceTimeRef.current = startTimeMs;
        } else {
          const elapsed = startTimeMs - noFaceTimeRef.current;
          if (elapsed >= 3000) { // 3 seconds
            const now = Date.now();
            if (now - lastNoFaceWarningTime.current > 5000) {
              lastNoFaceWarningTime.current = now;
              handleViolation("FACE_LOST", "Warning: Face not detected.");
            }
            setWarningText("⚠️ Face not detected.");
          }
        }
        lookingAwayTimeRef.current = 0;

      } else if (numFaces > 1) {
        setFaceState("Detected");
        setPeopleState(numFaces.toString());
        multipleFacesRef.current = true;

        const now = Date.now();
        if (now - lastMultipleFacesWarningTime.current > 5000) {
          lastMultipleFacesWarningTime.current = now;
          handleViolation("MULTIPLE_FACES", "Warning: Multiple faces detected.");
        }
        setWarningText("⚠️ Multiple faces detected.");

        noFaceTimeRef.current = 0;
        lookingAwayTimeRef.current = 0;

      } else {
        // Single face detected
        setFaceState("Detected");
        setPeopleState("1");
        facePresentFramesRef.current += 1;
        noFaceTimeRef.current = 0;
        setWarningText((prev) => prev.includes("Face not detected") || prev.includes("Multiple faces") ? "" : prev);

        const landmarks = result.faceLandmarks[0];
        
        // Eye tracking
        // Left Eye: Outer corner: 33, Inner corner: 133, Iris: 468, Top: 159, Bottom: 145
        // Right Eye: Inner corner: 362, Outer corner: 263, Iris: 473, Top: 386, Bottom: 374
        const leftWidth = landmarks[133].x - landmarks[33].x;
        const leftIrisOffset = landmarks[468].x - landmarks[33].x;
        const ratioL = leftWidth > 0 ? leftIrisOffset / leftWidth : 0.5;

        const rightWidth = landmarks[263].x - landmarks[362].x;
        const rightIrisOffset = landmarks[473].x - landmarks[362].x;
        const ratioR = rightWidth > 0 ? rightIrisOffset / rightWidth : 0.5;

        const leftHeight = landmarks[145].y - landmarks[159].y;
        const leftIrisOffsetV = landmarks[468].y - landmarks[159].y;
        const ratioV = leftHeight > 0 ? leftIrisOffsetV / leftHeight : 0.5;

        // Head rotation (Center lines)
        const dLeft = landmarks[1].x - landmarks[234].x;
        const dRight = landmarks[454].x - landmarks[1].x;
        const rotationRatio = dRight > 0 ? dLeft / dRight : 1.0;

        const isCenterGaze = (ratioL >= 0.38 && ratioL <= 0.62) &&
                             (ratioR >= 0.38 && ratioR <= 0.62) &&
                             (ratioV >= 0.38 && ratioV <= 0.62) &&
                             (rotationRatio >= 0.7 && rotationRatio <= 1.4);

        if (isCenterGaze) {
          setEyesState("Looking Forward");
          eyeContactFramesRef.current += 1;
          lookingAwayTimeRef.current = 0;
          setWarningText((prev) => prev.includes("keep your eyes") ? "" : prev);
        } else {
          setEyesState("Looking Away");
          if (lookingAwayTimeRef.current === 0) {
            lookingAwayTimeRef.current = startTimeMs;
          } else {
            const elapsed = startTimeMs - lookingAwayTimeRef.current;
            if (elapsed >= 5000) { // 5 seconds
              const now = Date.now();
              if (now - lastLookingAwayWarningTime.current > 7000) {
                lastLookingAwayWarningTime.current = now;
                handleViolation("LOOKING_AWAY", "Warning: Please keep your eyes on the screen.");
              }
              setWarningText("⚠️ Please keep your eyes on the screen.");
            }
          }
        }
      }
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [landmarker, cameraActive, handleViolation]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // Tab switch logs
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        tabSwitchesRef.current += 1;
        setTabSwitchesCount((prev) => {
          const newCount = prev + 1;
          handleViolation("TAB_SWITCH", `Warning: Tab switch detected (Switch #${newCount}).`);
          setShowTabSwitchWarning(true);
          return newCount;
        });
        setWarningText("⚠️ Tab switch detected.");
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleViolation]);

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState(90);

  useEffect(() => {
    if (phase !== "question" || showIntro || isPreparingAudio) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIdx, phase, showIntro, isPreparingAudio]);

  const handleTimeout = useCallback(() => {
    if (transcriptRef.current && transcriptRef.current.trim()) {
      handleSubmitAnswer(transcriptRef.current.trim());
    } else {
      handleSkipQuestion();
    }
  }, [currentIdx]);

  const currentQuestion = questions[currentIdx] ?? null;
  const answeredCount = questions.filter(
    (q) => q.state === "ANSWERED" || q.state === "SKIPPED"
  ).length;

  // Speak question & mark shown when question changes
  useEffect(() => {
    if (showIntro || !currentQuestion) return;
    
    let isCancelled = false;
    
    async function initQuestion() {
      if (!audioCache.has(currentQuestion.id)) {
        setIsPreparingAudio(true);
      }
      
      await prefetchAudio(currentQuestion.id, currentQuestion.question, token);
      
      if (isCancelled) return;
      
      setIsPreparingAudio(false);
      shownAtRef.current = new Date().toISOString();
      
      playAudio(currentQuestion.id, currentQuestion.question, token);
      interviewApi.markQuestionShown(session.sessionId, currentQuestion.id, token).catch(() => {});
    }
    
    initQuestion();
    
    return () => {
      isCancelled = true;
      cancelSpeech();
    };
  }, [currentQuestion?.id, showIntro]);

  // Pre-fetch next question in the background
  useEffect(() => {
    if (showIntro || !currentQuestion) return;
    const nextQ = questions[currentIdx + 1];
    if (nextQ && !audioCache.has(nextQ.id)) {
      prefetchAudio(nextQ.id, nextQ.question, token);
    }
  }, [currentIdx, questions, showIntro]);

  // Auto-mic activation (3.5s delay to allow question reading)
  useEffect(() => {
    if (showIntro || !currentQuestion || phase !== "question" || isPreparingAudio) return;
    setTimeLeft(90);
    
    if (supported) {
      const micTimer = setTimeout(() => {
        if (phase === "question") {
          start();
        }
      }, 3500);
      return () => clearTimeout(micTimer);
    }
  }, [currentIdx, showIntro, phase, isPreparingAudio]);

  function handleBeginInterview() {
    setShowIntro(false);
  }

  async function handleStartRecording() {
    cancelSpeech();
    reset();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setIsProcessingStt(true);
        try {
          const res = await speechApi.transcribeAudio(blob, token);
          if (res.transcript) {
            setTranscript(res.transcript); // Replace live STT with Groq accurate transcript
          }
        } catch (e) {
          console.error("Groq STT failed", e);
        } finally {
          setIsProcessingStt(false);
        }
      };
      setMediaRecorder(recorder);
      recorder.start();
      start(); // Start native live preview
    } catch (e) {
      console.error("Failed to start mic", e);
    }
  }

  function handleStopRecording() { 
    stop(); 
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  async function handleSubmitAnswer(answerText) {
    if (phase !== "question") return;
    const textToSubmit = answerText || transcript.trim();
    if (!textToSubmit) return;
    
    stop();
    cancelSpeech();
    setPhase("submitting");
    setError("");
    
    try {
      const payload = {
        questionId: currentQuestion.id,
        transcript: textToSubmit,
        questionShownAt: shownAtRef.current,
      };
      
      const eval_ = await interviewApi.submitAnswer(session.sessionId, payload, token);
      
      setQuestions((prev) =>
        prev.map((q) => q.id === currentQuestion.id ? { ...q, state: "ANSWERED" } : q)
      );
      
      // Dynamic follow-up splicing
      if (eval_.hasFollowUp && eval_.followUpQuestion) {
        setQuestions((prev) => {
          const next = [...prev];
          next.splice(currentIdx + 1, 0, eval_.followUpQuestion);
          return next;
        });
      }
      
      reset();
      advanceOrFinish();
    } catch (err) {
      setError(err.message || "Failed to submit answer.");
      setPhase("question");
    }
  }

  async function handleSkipQuestion() {
    if (phase !== "question") return;
    setError("");
    stop();
    cancelSpeech();
    try {
      await interviewApi.skipQuestion(session.sessionId, currentQuestion.id, token);
      setQuestions((prev) =>
        prev.map((q) => q.id === currentQuestion.id ? { ...q, state: "SKIPPED" } : q)
      );
      reset();
      advanceOrFinish();
    } catch (err) {
      setError(err.message || "Failed to skip question.");
    }
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
    stop();
    cancelSpeech();
    setPhase("finishing");
    setError("");
    try {
      const finalFrames = totalFramesRef.current > 0 ? totalFramesRef.current : 1;
      const facePresentPct = Math.min(100, Math.round((facePresentFramesRef.current / finalFrames) * 100));
      const eyeContactPct = Math.min(100, Math.round((eyeContactFramesRef.current / finalFrames) * 100));
      const integrityScr = Math.max(0, 100 - warningsCount * 5 - tabSwitchesRef.current * 10);

      const integrityPayload = {
        integrityScore: integrityScr,
        warningsCount: warningsCount,
        eyeContactPercentage: eyeContactPct,
        facePresentPercentage: facePresentPct,
        multipleFacesDetected: multipleFacesRef.current ? "Yes" : "No",
        phoneChecked: "Not Checked",
        tabSwitches: tabSwitchesRef.current,
      };

      const report = await interviewApi.endSession(session.sessionId, integrityPayload, token);
      onFinished(report);
    } catch (err) {
      setError(err.message || "Failed to generate report.");
      setPhase("question");
    }
  }

  // Get Timer Color classes
  function getTimerClass() {
    if (timeLeft <= 5) return "text-red-600 bg-red-50 border-red-200";
    if (timeLeft <= 15) return "text-orange-500 bg-orange-50 border-orange-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  }

  if (showIntro) {
    return (
      <div className="max-w-3xl mx-auto pt-8">
        <InterviewerIntro
          token={token}
          intro={initialSession.interviewerIntro}
          onBegin={handleBeginInterview}
          cameraActive={cameraActive}
          cameraError={cameraError}
          videoRef={videoRef}
          onRetryCamera={handleRetryCamera}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 max-w-6xl mx-auto items-start">
      {/* Left column — Mock interview panel */}
      <div className="space-y-4">
        {/* Header metrics bar */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">AI Interview</p>
              <h1 className="text-lg font-bold text-slate-900">{session.role} · {session.difficulty}</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Question Countdown Timer */}
              <span className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-1.5 rounded-full tabular-nums ${getTimerClass()}`}>
                Time Left: {formatTime(timeLeft)}
              </span>
              
              <button
                onClick={handleFinish}
                disabled={phase === "finishing"}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {phase === "finishing" ? (
                  <>
                    <Spinner size="h-3 w-3" color="text-orange-500 border-t-orange-500 animate-spin" />
                    <span>Ending...</span>
                  </>
                ) : "End Interview"}
              </button>
            </div>
          </div>
          <ProgressBar completed={answeredCount} total={questions.length} />
          <p className="text-xs text-slate-400 mt-1.5">
            Question {currentIdx + 1} of {questions.length} · {questions.length - answeredCount} remaining
          </p>
        </div>

        {/* Warning Banner Overlay */}
        <AnimatePresence>
          {warningText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold"
            >
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <span>{warningText}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Panel */}
        <AnimatePresence mode="wait">
          {currentQuestion && phase === "question" && isPreparingAudio && (
            <motion.div
              key={`loading-${currentQuestion.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
            >
              <LoadingDistractor
                type="setup"
                title="Preparing Audio"
                subtitle="Synthesizing question audio via Sarvam AI..."
                estimatedDuration={8000}
              />
            </motion.div>
          )}

          {currentQuestion && phase === "question" && !isPreparingAudio && (
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

              {/* Speech transcript input */}
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={transcript}
                    readOnly
                    placeholder={
                      supported
                        ? "Speak your answer..."
                        : "Speech recognition not supported."
                    }
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none transition-colors cursor-default select-none focus:ring-0"
                  />
                  {isProcessingStt && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-orange-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                      Groq Transcribing...
                    </div>
                  )}
                  {!isProcessingStt && listening && (
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
                    onClick={() => handleSubmitAnswer()}
                    disabled={!transcript.trim() || isProcessingStt}
                    className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <MicOff className="h-4 w-4" /> Submit Answer
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipQuestion}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors"
                  >
                    <SkipForward className="h-4 w-4" /> Skip
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "submitting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
            >
              <LoadingDistractor
                type="submitting"
                title="Submitting your response"
                subtitle="Analyzing answer transcript & coherence..."
                estimatedDuration={6000}
              />
            </motion.div>
          )}

          {phase === "finishing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm"
            >
              <LoadingDistractor
                type="finishing"
                title="Generating final report"
                subtitle="Evaluating scores, proctoring metrics, and performance recommendations..."
                estimatedDuration={20000}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 break-words overflow-hidden">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}
      </div>

      {/* Right Column — Webcam lock & Integrity monitor */}
      <div className="space-y-4">
        {/* Webcam View */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Webcam Stream</span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Always ON
            </span>
          </div>
          <div className="relative bg-slate-900 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"}`}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
                {cameraError ? (
                  <AlertCircle className="h-8 w-8 text-red-400" />
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                )}
                <span className="text-xs font-semibold">
                  {cameraError ? "Camera Access Denied" : "Starting Video..."}
                </span>
              </div>
            )}
            {/* Absolute loading indicator for MediaPipe model loading */}
            {loadingLandmarker && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-white">
                <Loader2 className="h-3 w-3 animate-spin text-orange-400" />
                <span>Loading Face tracking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning Integrity Dashboard Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-sm text-slate-800">Interview Integrity</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Camera", val: cameraActive ? "Active" : "Inactive", ok: cameraActive },
              { label: "Face", val: faceState, ok: faceState === "Detected" },
              { label: "Eyes", val: eyesState, ok: eyesState === "Looking Forward" },
              { label: "People", val: peopleState, ok: peopleState === "1" }
            ].map(({ label, val, ok }) => (
              <div key={label} className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">{label}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                  ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
                  {val}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
              <span className="text-slate-500 font-semibold">Warnings</span>
              <span className={`font-bold px-2 py-0.5 rounded ${warningsCount > 0 ? "text-red-600 bg-red-50" : "text-slate-700 bg-slate-100"}`}>
                {warningsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Proctoring Tips */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Security Policies</p>
          <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
            <li>• Webcam must remain active at all times.</li>
            <li>• Keep your eyes focused forward on the screen.</li>
            <li>• Ensure you are alone in a well-lit room.</li>
            <li>• Do not toggle browser tabs or leave focus.</li>
          </ul>
        </div>
      </div>

      {/* Camera Lost Modal Overlay */}
      <AnimatePresence>
        {!showIntro && !cameraActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <Video className="h-6 w-6 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Camera Access Required</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                The webcam stream must remain active at all times during the interview. 
                Please check your camera settings and ensure permission is granted to proceed.
              </p>
              <button
                onClick={handleRetryCamera}
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-3 text-sm font-semibold text-white transition-colors"
              >
                Enable Camera & Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Required Modal Overlay */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-6 w-6 text-orange-600 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Fullscreen Mode Required</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                This interview session is proctored. You must be in fullscreen mode to start or continue the test.
              </p>
              <button
                onClick={async () => {
                  try {
                    if (document.documentElement.requestFullscreen) {
                      await document.documentElement.requestFullscreen();
                    }
                    setIsFullscreen(true);
                  } catch (err) {
                    console.error("Failed to enter fullscreen:", err);
                  }
                }}
                className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 py-3 text-sm font-semibold text-white transition-colors"
              >
                Enter Fullscreen & Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switch Warning Modal Overlay */}
      <AnimatePresence>
        {showTabSwitchWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Security Alert: Tab Switch Detected</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                You shifted focus away from the test tab. Navigating to other tabs, windows, or applications 
                is logged as an integrity warning.
              </p>
              <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex justify-between items-center text-red-700 font-semibold text-sm">
                <span>Tab Switch Count:</span>
                <span className="text-base">{tabSwitchesCount}</span>
              </div>
              <button
                onClick={() => setShowTabSwitchWarning(false)}
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-sm font-semibold text-white transition-colors"
              >
                I Understood & Resume Test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

// ── Interviewer intro screen ──────────────────────────────────────────────
function InterviewerIntro({ token, intro, onBegin, cameraActive, cameraError, videoRef, onRetryCamera }) {
  useEffect(() => {
    playAudio('intro', intro, token);
    return () => { cancelSpeech(); }
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

      {/* Webcam Preview inside Intro card */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden aspect-video max-w-sm mx-auto relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${cameraActive ? "opacity-100" : "opacity-0"}`}
        />
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 p-4">
            {cameraError ? (
              <AlertCircle className="h-6 w-6 text-red-400" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            )}
            <span className="text-xs font-semibold">
              {cameraError ? "Camera Access Denied" : "Preparing camera preview..."}
            </span>
            {cameraError && (
              <button
                onClick={onRetryCamera}
                className="mt-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-[10px] text-white transition-colors"
              >
                Retry Access
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => { cancelSpeech(); onBegin(); }}
          disabled={!cameraActive}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
        >
          I'm ready — let's begin →
        </button>
        {!cameraActive && (
          <p className="text-xs font-semibold text-red-500">
            ⚠️ Camera stream is required to begin. Please check permissions above.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default InterviewSession;

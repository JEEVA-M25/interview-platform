import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Check,
  TrendingUp,
  Brain,
  FileText,
  ShieldCheck,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  UserCheck,
  Users,
  Mic,
  Target
} from "lucide-react";
import interviewerAvatar from "../assets/interviewer_avatar.png";

function DottedGrid({ className }) {
  return (
    <svg className={className} width="120" height="120" fill="none" viewBox="0 0 120 120">
      <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="2.5" fill="rgba(255, 138, 61, 0.2)" />
      </pattern>
      <rect width="120" height="120" fill="url(#dotPattern)" />
    </svg>
  );
}

function TwitterIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function GithubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function LandingPage({ onAuth }) {
  const [emailInput, setEmailInput] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "The AI interviewer is amazing! It feels like a real Interview experience. Helped me crack my dream job!",
      name: "Rohan",
      role: "SDE Intern",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
      rating: 5,
    },
    {
      quote: "Instant feedback and detailed analysis helped me improve my answers and confidence.",
      name: "Priya",
      role: "Full Stack Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      rating: 5,
    },
    {
      quote: "Best platform to practice interviews. The resume analysis is a game changer!",
      name: "Karthik",
      role: "Data Analyst",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      rating: 5,
    }
  ];

  // Auto-slide Testimonials every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const features = [
    {
      title: "AI Mock Interviews",
      desc: "Smart AI asks role-specific questions and follows up like a real interviewer.",
      icon: Brain,
      color: "from-purple-500 to-indigo-500",
      bg: "bg-purple-50",
      border: "border-purple-200",
      shadow: "shadow-purple-100",
    },
    {
      title: "Resume Intelligence",
      desc: "Upload your resume and get AI-powered analysis & improvement tips.",
      icon: FileText,
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
      shadow: "shadow-orange-100",
    },
    {
      title: "ATS Resume Analysis",
      desc: "Check your resume score against applicant tracking systems to optimize matching.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      shadow: "shadow-emerald-100",
    },
    {
      title: "Communication Analysis",
      desc: "Evaluate your speaking pace, eye-contact, confidence, and grammatical accuracy.",
      icon: UserCheck,
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
      border: "border-pink-200",
      shadow: "shadow-pink-100",
    },
    {
      title: "Performance Dashboard",
      desc: "Detailed scoring charts breaking down technical, verbal, and visual metrics.",
      icon: BarChart3,
      color: "from-blue-500 to-sky-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
      shadow: "shadow-blue-100",
    },
    {
      title: "Progress Tracking",
      desc: "Track interview score analytics over time and monitor key improvement rates.",
      icon: Award,
      color: "from-amber-500 to-yellow-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
      shadow: "shadow-amber-100",
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backgroundImage: "radial-gradient(rgba(255, 138, 61, 0.07) 1.2px, transparent 1.2px)",
        backgroundSize: "24px 24px"
      }}
      className="min-h-screen bg-[#FFFDF8] text-slate-800 relative overflow-x-hidden selection:bg-orange-200 selection:text-orange-900"
    >
      {/* Floating Edge Bubbles */}
      <div className="absolute right-0 top-[15%] w-[25vw] h-[25vw] rounded-full bg-purple-400/15 filter blur-[90px] translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute left-0 top-[45%] w-[30vw] h-[30vw] rounded-full bg-orange-300/15 filter blur-[100px] -translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute right-0 top-[65%] w-[28vw] h-[28vw] rounded-full bg-[#FF7DAE]/12 filter blur-[90px] translate-x-1/3 pointer-events-none z-0" />
      {/* Custom Global Animation Styles */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes blob-shift {
          0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
          33% { border-radius: 70% 30% 52% 48% / 60% 40% 60% 40%; }
          66% { border-radius: 50% 50% 30% 70% / 50% 60% 40% 60%; }
        }
        @keyframes wave-grow {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .anim-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .anim-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
        .anim-blob {
          animation: blob-shift 12s ease-in-out infinite alternate;
        }
        .wave-bar:nth-child(even) {
          animation: wave-grow 1.2s ease-in-out infinite;
        }
        .wave-bar:nth-child(odd) {
          animation: wave-grow 0.8s ease-in-out infinite 0.2s;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .gradient-text-orange {
          background: linear-gradient(135deg, #FF8A3D 0%, #FFC857 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .gradient-text-purple {
          background: linear-gradient(135deg, #7B61FF 0%, #FF7DAE 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .gradient-border-glow {
          box-shadow: 0 0 15px rgba(255, 138, 61, 0.15);
        }
        @keyframes dash-animation {
          to {
            stroke-dashoffset: -100;
          }
        }
        .dashed-flow {
          animation: dash-animation 6s linear infinite;
        }
      `}</style>

      {/* Floating Blob Background Elements */}
      <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] bg-[#FFE7D1]/30 rounded-full filter blur-[80px] pointer-events-none anim-blob" />
      <div className="absolute top-[40%] right-[-10%] w-[35vw] h-[35vw] bg-[#7B61FF]/10 rounded-full filter blur-[100px] pointer-events-none anim-blob" />
      <div className="absolute top-[75%] left-[5%] w-[30vw] h-[30vw] bg-[#62C8FF]/10 rounded-full filter blur-[90px] pointer-events-none anim-blob" />

      {/* 1. Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-orange-100/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#FFC857] flex items-center justify-center shadow-md shadow-orange-200">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              CareerVerse <span className="text-[#FF8A3D]">AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#FF8A3D] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#FF8A3D] transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-[#FF8A3D] transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-[#FF8A3D] transition-colors">Pricing</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onAuth("login")}
              className="font-bold text-slate-700 hover:text-[#FF8A3D] transition-colors cursor-pointer text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => onAuth("register")}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FFC857] hover:from-[#e8772a] hover:to-[#e8b548] text-white font-bold shadow-md shadow-orange-200 transition-all hover:scale-[1.03] active:scale-95 text-sm flex items-center gap-1 cursor-pointer"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-6 pt-16 pb-24 md:py-32">
        <div className="max-w-7xl mx-auto grid gap-16 lg:grid-cols-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left relative z-10">
            {/* Dotted background pattern floating on left */}
            <DottedGrid className="absolute -left-12 -top-16 w-24 h-24 pointer-events-none opacity-40 z-0 hidden lg:block" />

            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/60 border border-orange-200 text-[#FF8A3D] text-xs font-bold uppercase tracking-wider relative z-10">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Interview Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              Practice Smarter.<br />
              Interview Better.<br />
              <div className="relative inline-block mt-2">
                <span className="font-bold text-[#FF8A3D] text-5xl sm:text-6xl lg:text-7xl block pl-1 pr-4 select-none" style={{ fontFamily: "'Caveat', cursive" }}>
                  Get Hired.
                </span>
                {/* Custom wavy hand-drawn loop underline */}
                <svg className="absolute -bottom-3.5 left-0 w-full h-4 text-[#FF8A3D]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M3,5 Q35,9 97,2 Q50,7 6,8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Realistic AI interviews, instant feedback, and personalized insights to help you crack any job interview with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onAuth("register")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FFC857] hover:from-[#e8772a] hover:to-[#e8b548] text-white font-extrabold shadow-lg shadow-orange-200/50 transition-all hover:scale-105 active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                Start Free Mock Interview <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onAuth("login")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 hover:border-orange-300 bg-white text-slate-700 hover:text-orange-500 font-bold transition-all hover:scale-105 active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-slate-100"
              >
                <Play className="w-4 h-4 fill-current" /> Watch Demo
              </button>
            </div>

            {/* Ratings & Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              {/* Overlapping Avatars */}
              <div className="flex -space-x-3">
                <img className="w-9 h-9 rounded-full border-2 border-[#FFFDF8] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" alt="Student" />
                <img className="w-9 h-9 rounded-full border-2 border-[#FFFDF8] object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120" alt="Student" />
                <img className="w-9 h-9 rounded-full border-2 border-[#FFFDF8] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" alt="Student" />
                <img className="w-9 h-9 rounded-full border-2 border-[#FFFDF8] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" alt="Student" />
              </div>
              <div>
                <div className="flex items-center gap-0.5 justify-center sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  4.9/5 rating from 2,000+ users
                </p>
              </div>
            </div>
          </div>

          {/* Right Hero Column - Dashboard Mockup */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Curved SVG Loop Ribbon behind the Mockup */}
            <svg
              className="absolute -left-12 -top-12 w-[120%] h-[120%] pointer-events-none overflow-visible z-0 hidden lg:block"
              viewBox="0 0 600 600"
              fill="none"
            >
              <defs>
                <linearGradient id="hero-ribbon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B61FF" />
                  <stop offset="50%" stopColor="#FF7DAE" />
                  <stop offset="100%" stopColor="#FF8A3D" />
                </linearGradient>
              </defs>
              {/* Loop arrow */}
              <path
                d="M 50 180 C 180 50, 420 50, 450 200 C 480 350, 200 450, 100 350 C 0 250, 150 100, 350 150 C 480 180, 520 280, 550 350"
                stroke="url(#hero-ribbon-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="4 8"
                className="opacity-60"
              />
              <path
                d="M 545 330 L 553 353 L 530 350"
                stroke="url(#hero-ribbon-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              />
            </svg>

            {/* Purple swirled loop arrow on the left of card */}
            <div className="absolute -left-16 top-[22%] w-24 h-48 pointer-events-none overflow-visible z-0 hidden lg:block">
              <svg className="w-full h-full overflow-visible animate-pulse" fill="none" style={{ animationDuration: '6s' }}>
                <path
                  d="M 100,50 C 40,20 10,80 30,120 C 50,160 90,140 70,80 C 50,20 0,60 10,10"
                  stroke="#7B61FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="opacity-70"
                />
              </svg>
            </div>

            {/* Yellow Paper Plane / Rocket Arrow Path under the Card */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-visible hidden lg:block">
              <svg className="w-full h-full overflow-visible" fill="none">
                {/* Short swirled dotted path */}
                <path
                  d="M 50,220 C 120,320 280,310 320,250 C 360,180 300,100 420,80"
                  stroke="#FFC857"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="4 6"
                  className="dashed-flow"
                />
                {/* Floating Yellow Paper Plane at the top */}
                <g transform="translate(420, 80) rotate(-25)" className="anim-float-medium">
                  <path
                    d="M 0,-10 L 14,14 L 0,8 L -14,14 Z"
                    fill="#FFC857"
                    stroke="#FFC857"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <line x1="0" y1="-10" x2="0" y2="8" stroke="#FFF" strokeWidth="1.2" />
                </g>
              </svg>
            </div>

            {/* Dotted pattern on the right edge of hero mockup */}
            <DottedGrid className="absolute -right-6 -top-10 w-24 h-24 pointer-events-none opacity-40 z-20" />

            {/* Dashboard Card Container - High Contrast bg-white */}
            <div className="relative w-full max-w-lg bg-white rounded-[28px] border-2 border-orange-200/60 p-6 shadow-[0_32px_64px_-16px_rgba(255,138,61,0.28)] space-y-6 z-10 anim-float-slow transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_48px_96px_-20px_rgba(255,138,61,0.32)]">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-xs font-bold text-slate-400 ml-2">Mock Interview Session</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Interview in Progress</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* AI Interviewer Avatar Card - Full Rectangular Overlay */}
                <div className="md:col-span-5 rounded-2xl border border-slate-100 shadow-inner relative overflow-hidden h-[220px] group/avatar">
                  <img
                    src={interviewerAvatar}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                    alt="AI Interviewer"
                  />
                  {/* Glassmorphic overlay tag */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/70 backdrop-blur-md py-1.5 px-2.5 rounded-xl text-center border border-white/40 shadow-sm z-10">
                    <span className="text-[10px] font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-1">
                      🤖 AI Interviewer
                    </span>
                  </div>
                </div>

                {/* Question & Waveform Column */}
                <div className="md:col-span-7 space-y-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <span className="text-[10px] font-extrabold text-[#7B61FF] uppercase tracking-wider">Question 4/8</span>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed mt-1">
                      "How would you optimize a slow database query in a high traffic system?"
                    </p>
                  </div>

                  {/* Animated Waveform Wrapper */}
                  <div className="flex flex-col gap-1 rounded-2xl bg-[#7B61FF]/5 border border-[#7B61FF]/10 p-3">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Speech Waveform</span>
                    <div className="flex items-end justify-center gap-1.5 h-12 py-1">
                      {[0.5, 0.9, 0.4, 0.7, 0.3, 0.8, 0.6, 0.9, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 0.8, 0.4].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-[#7B61FF] to-[#FF7DAE] rounded-full wave-bar origin-bottom"
                          style={{ height: `${h * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Control Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                    ⏱️ <span className="font-mono text-slate-800">02:45</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-xs font-bold text-slate-500 flex items-center gap-1">
                    🟢 <span className="font-bold text-[#FF8A3D]">AI Listening</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-all cursor-pointer">
                    🎙️
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-all cursor-pointer">
                    📹
                  </button>
                  <button className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md transition-all cursor-pointer">
                    ❌
                  </button>
                </div>
              </div>
            </div>
            
            {/* Soft shadow glow behind container */}
            <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-[#FF8A3D]/10 to-[#7B61FF]/10 filter blur-[40px] rounded-full z-0 pointer-events-none" />
          </div>

        </div>
      </section>

      {/* 3. Trusted By Logos Bar - Large & High Contrast */}
      <section className="px-6 py-10 relative">
        {/* Dotted grid under trusted by bar */}
        <DottedGrid className="absolute right-12 top-[10%] w-24 h-24 pointer-events-none opacity-20 z-0 hidden lg:block" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Solid White Pill Container standing away from background */}
          <div className="bg-white rounded-[28px] border-2 border-orange-200/50 p-8 md:py-10 shadow-[0_24px_50px_rgba(255,138,61,0.18)] text-center space-y-6">
            <span className="text-xs sm:text-sm font-extrabold text-slate-400 uppercase tracking-widest block">
              Trusted by placements & students from
            </span>
            <div className="flex flex-wrap items-center justify-center gap-y-8 gap-x-10 md:gap-x-14 opacity-90">
              {/* Google */}
              <div className="flex items-center gap-2 font-black text-slate-850 text-lg sm:text-xl hover:opacity-100 transition-opacity">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-extrabold tracking-tight text-slate-800">Google</span>
              </div>

              {/* Microsoft */}
              <div className="flex items-center gap-2 font-black text-slate-850 text-lg sm:text-xl hover:opacity-100 transition-opacity">
                <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                  <div className="bg-[#F25022] w-2.5 h-2.5" />
                  <div className="bg-[#7FBA00] w-2.5 h-2.5" />
                  <div className="bg-[#00A4EF] w-2.5 h-2.5" />
                  <div className="bg-[#FFB900] w-2.5 h-2.5" />
                </div>
                <span className="font-extrabold tracking-tight text-slate-800">Microsoft</span>
              </div>

              {/* Amazon */}
              <div className="flex flex-col items-center justify-center text-slate-800 hover:opacity-100 transition-opacity">
                <span className="font-black text-lg sm:text-xl tracking-tighter lowercase leading-none">amazon</span>
                <svg className="w-14 h-3 -mt-0.5 text-[#FF9900]" viewBox="0 0 100 15" fill="none">
                  <path d="M5,2 C30,12 70,12 95,2" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M90,3 L96,2 L94,8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* TCS */}
              <div className="flex items-center gap-2 font-black text-[#002244] text-sm sm:text-base hover:opacity-100 transition-opacity">
                <span className="text-[#008080] font-black text-lg">tcs</span>
                <div className="h-6.5 w-[1.5px] bg-slate-300 mx-1" />
                <span className="text-[11px] text-slate-400 font-bold tracking-tight leading-none uppercase text-left">TATA<br />CONSULTANCY<br />SERVICES</span>
              </div>

              {/* Infosys */}
              <div className="font-black text-[#006699] text-xl sm:text-2xl tracking-wider hover:opacity-100 transition-opacity">
                Infosys
              </div>

              {/* Accenture */}
              <div className="flex items-center gap-1 font-black text-slate-800 text-lg sm:text-xl hover:opacity-100 transition-opacity">
                <span className="font-extrabold tracking-tight">accenture</span>
                <span className="text-[#A12BDF] font-black text-xl">{`>`}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Organic SVG Wave transition to Features */}
      <div className="w-full relative h-16 pointer-events-none select-none overflow-hidden z-10">
        <svg viewBox="0 0 1440 74" fill="none" className="absolute bottom-0 w-full h-full preserve-3d">
          <path d="M0 40 C 240 10, 480 70, 720 40 C 960 10, 1200 70, 1440 40 L1440 74 L0 74 Z" fill="#FFE7D1" className="opacity-20" />
          <path d="M0 50 C 300 20, 600 80, 900 50 C 1200 20, 1350 80, 1440 60 L1440 74 L0 74 Z" fill="#FFC857" className="opacity-10" />
        </svg>
      </div>

      {/* 5. Features Section */}
      <section id="features" className="px-6 py-20 relative bg-[#FFFDF8]">
        
        {/* Winding Arrow Ribbon background */}
        <svg className="absolute top-[20%] left-[-5%] w-[110%] h-[70%] pointer-events-none overflow-visible z-0 hidden xl:block" viewBox="0 0 1200 800" fill="none">
          <path
            d="M 100 150 C 400 300, 200 600, 600 500 C 900 400, 800 100, 1050 300 M 1050 300 L 1025 285 M 1050 300 L 1040 325"
            stroke="url(#features-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="6 10"
            className="opacity-50"
          />
          <defs>
            <linearGradient id="features-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7B61FF" />
              <stop offset="100%" stopColor="#62C8FF" />
            </linearGradient>
          </defs>
        </svg>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Why Choose CareerVerse AI?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              A comprehensive toolkit engineered to prepare you for job placements and tech roles.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const IconComp = f.icon;
              return (
                <div
                  key={i}
                  className={`glass-card rounded-[24px] border ${f.border} p-6 shadow-md ${f.shadow} transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-[230px]`}
                >
                  <div className="space-y-4">
                    {/* Circle Icon Container */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{f.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium mt-1">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-[#FF8A3D] mt-3">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Statistics Section */}
      <section className="px-6 py-12 relative bg-[#FFFDF8]">
        <div className="max-w-5xl mx-auto relative">
          
          {/* Stat Curved Ribbon SVG */}
          <svg className="absolute top-[50%] left-[-2%] w-[104%] h-[60px] pointer-events-none overflow-visible z-0 hidden lg:block" viewBox="0 0 1000 60" fill="none">
            <path
              d="M 10 30 Q 250 -20, 500 30 T 990 30"
              stroke="url(#stats-ribbon-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="6 8"
              className="opacity-40"
            />
            <defs>
              <linearGradient id="stats-ribbon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF8A3D" />
                <stop offset="50%" stopColor="#FFC857" />
                <stop offset="100%" stopColor="#FF7DAE" />
              </linearGradient>
            </defs>
          </svg>

          {/* Statistics Horizontal Capsule Bar - Exactly like the second image */}
          <div className="relative max-w-5xl mx-auto z-10 px-4">
            
            {/* White dotted loops on the left and right edges of the Statistics Capsule */}
            <div className="absolute -left-6 top-[20%] w-12 h-16 pointer-events-none hidden md:block">
              <svg className="w-full h-full" viewBox="0 0 50 100" fill="none">
                <path d="M 50,10 C 10,20 10,70 50,80 C 60,82 40,90 20,80" stroke="white" strokeWidth="2" strokeDasharray="3 3" className="opacity-40" />
              </svg>
            </div>
            <div className="absolute -right-6 top-[20%] w-12 h-16 pointer-events-none hidden md:block">
              <svg className="w-full h-full" viewBox="0 0 50 100" fill="none">
                <path d="M 0,10 C 40,20 40,70 0,80 C -10,82 10,90 30,80" stroke="white" strokeWidth="2" strokeDasharray="3 3" className="opacity-40" />
              </svg>
            </div>
            
            {/* The Gradient Capsule Bar Container */}
            <div className="rounded-[32px] bg-gradient-to-r from-[#FF8A3D] via-[#7B61FF] to-[#FF7DAE] p-8 md:p-10 shadow-[0_24px_50px_rgba(255,138,61,0.35)] relative overflow-hidden">
              {/* Background curves */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.06),transparent_60%)]" />

              <div className="relative z-10 grid gap-y-8 grid-cols-2 md:grid-cols-4 items-center divide-y md:divide-y-0 md:divide-x divide-white/20">
                {[
                  { val: "10,000+", lbl: "Happy Users", icon: Users },
                  { val: "25,000+", lbl: "Interviews Taken", icon: Mic },
                  { val: "4.9/5", lbl: "User Rating", icon: Star },
                  { val: "85%", lbl: "Improvement Rate", icon: Target },
                ].map((s, idx) => {
                  const IconComponent = s.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center text-center px-4 space-y-3.5 first:pt-0 pt-6 md:pt-0"
                    >
                      {/* White semi-transparent bubble icon */}
                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                          {s.val}
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-orange-50/80 uppercase tracking-wider mt-0.5">
                          {s.lbl}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dotted Grid Pattern on the right of the statistics bar */}
            <DottedGrid className="absolute -right-20 -bottom-10 w-24 h-24 pointer-events-none opacity-30 z-0 hidden xl:block" />
          </div>

        </div>
      </section>

      {/* 7. How It Works Section */}
      <section id="how-it-works" className="px-6 py-20 relative bg-[#FFFDF8]">
        
        {/* Winding Connection ribbon */}
        <svg className="absolute top-[48%] left-[10%] w-[80%] h-[120px] pointer-events-none overflow-visible z-0 hidden lg:block" viewBox="0 0 800 120" fill="none">
          <path
            d="M 10 30 C 150 110, 250 -40, 400 30 C 550 100, 650 -10, 780 30"
            stroke="url(#timeline-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="5 10"
            className="opacity-50"
          />
          <defs>
            <linearGradient id="timeline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF8A3D" />
              <stop offset="50%" stopColor="#7B61FF" />
              <stop offset="100%" stopColor="#FF7DAE" />
            </linearGradient>
          </defs>
        </svg>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#FF8A3D] text-xs font-bold uppercase tracking-wider">
              💡 Simple. Smart. Effective.
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">
              Prepare for your dream tech job in four simple steps.
            </p>
          </div>

          {/* Step Timeline Grid */}
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Sign Up",
                desc: "Create your free candidate account in seconds.",
                color: "bg-purple-100 text-[#7B61FF] border-purple-200",
              },
              {
                step: "2",
                title: "Choose Role & Upload",
                desc: "Paste the job description and upload your resume.",
                color: "bg-orange-100 text-[#FF8A3D] border-orange-200",
              },
              {
                step: "3",
                title: "Start AI Interview",
                desc: "Answer dynamic verbal or text questions generated by Gemini.",
                color: "bg-emerald-100 text-emerald-600 border-emerald-200",
              },
              {
                step: "4",
                title: "Get Feedback",
                desc: "Receive scores, strengths, weaknesses, and a full report.",
                color: "bg-pink-100 text-[#FF7DAE] border-pink-200",
              },
            ].map((s, idx) => (
              <div key={idx} className="text-center space-y-4 flex flex-col items-center">
                {/* Outer pulsing ring */}
                <div className="relative flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-full border-2 ${s.color} flex items-center justify-center font-black text-xl shadow-md bg-white z-10 transition-transform duration-300 hover:scale-110`}>
                    {s.step}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-slate-200/30 scale-125 -z-0 animate-ping opacity-30" style={{ animationDuration: "3s" }} />
                </div>
                <div className="space-y-1 max-w-[200px]">
                  <h3 className="text-base font-extrabold text-slate-800">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section id="testimonials" className="px-6 py-20 relative bg-[#FFFDF8]">
        
        {/* Floating background waves */}
        <div className="absolute top-0 left-0 w-full h-8 overflow-hidden pointer-events-none select-none">
          <svg viewBox="0 0 1440 30" fill="none" className="w-full h-full">
            <path d="M0 10 Q 360 30, 720 10 T 1440 10 L 1440 0 L 0 0 Z" fill="#FFE7D1" className="opacity-15" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7DAE]/10 text-[#FF7DAE] text-xs font-bold uppercase tracking-wider">
              ❤️ Loved by Aspirants
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              What Our Users Say
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">
              Real success stories from candidates using CareerVerse AI.
            </p>
          </div>

          {/* Testimonial Cards Layout - Carousel or Grid */}
          <div className="relative max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Curved Arrow pointer */}
            <svg className="absolute -left-16 -top-12 w-20 h-20 pointer-events-none overflow-visible z-0 hidden md:block" viewBox="0 0 80 80" fill="none">
              <path
                d="M 10 10 C 30 30, 10 60, 60 70"
                stroke="#FF7DAE"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 4"
                className="opacity-70"
              />
              <path d="M 50 72 L 63 70 L 58 58" stroke="#FF7DAE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Testimonial Card - High Contrast bg-white */}
            <div className="w-full bg-white rounded-[28px] border border-orange-200/50 p-8 shadow-[0_20px_50px_rgba(255,138,61,0.15)] space-y-6 relative transition-all duration-300 hover:shadow-[0_20px_50px_rgba(255,138,61,0.22)]">
              {/* Stars & Quote */}
              <div className="space-y-4">
                <div className="flex gap-0.5">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-700 italic leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </p>
              </div>

              {/* Profile details */}
              <div className="flex items-center gap-4">
                <img
                  className="w-12 h-12 rounded-full border-2 border-orange-100 object-cover shadow-sm"
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-400">
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
              </div>

              {/* Floating Accents */}
              <span className="absolute bottom-6 right-8 text-7xl font-serif text-[#FF7DAE]/15 select-none pointer-events-none">
                ”
              </span>
            </div>

            {/* Testimonial Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#FF8A3D] hover:border-orange-200 hover:shadow shadow-sm transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1.5">
                {testimonials.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeTestimonial ? "bg-[#FF8A3D] w-6" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#FF8A3D] hover:border-orange-200 hover:shadow shadow-sm transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 9. CTA Section */}
      <section className="px-6 py-12 bg-[#FFFDF8]">
        <div className="max-w-5xl mx-auto">
          {/* Beautiful Gradient box */}
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#FF8A3D] via-[#7B61FF] to-[#FF7DAE] p-8 md:p-12 overflow-hidden shadow-[0_24px_48px_-12px_rgba(255,138,61,0.4)] flex flex-col md:flex-row items-center justify-between gap-10">
            
            {/* Curved background SVGs ribbon */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20" viewBox="0 0 800 400" fill="none">
              <path d="M-50 200 C150 50, 400 350, 600 200 T850 100" stroke="white" strokeWidth="6" strokeLinecap="round" />
            </svg>

            {/* Left side text */}
            <div className="space-y-6 relative z-10 text-center md:text-left max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-orange-50 font-medium text-sm sm:text-base leading-relaxed">
                Join thousands of successful candidates improving their communication skills, technical answers, and resume matching with CareerVerse AI.
              </p>
              <button
                onClick={() => onAuth("register")}
                className="px-8 py-4.5 rounded-2xl bg-white text-slate-800 hover:text-[#FF8A3D] font-black shadow-lg transition-all hover:scale-105 active:scale-95 text-base inline-flex items-center gap-2 cursor-pointer"
              >
                Start Free Interview <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right side custom SVG / CSS Robot */}
            <div className="relative z-10 shrink-0 w-44 h-44 flex items-center justify-center">
              {/* Cute Waving SVG Robot */}
              <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 200 200" fill="none">
                {/* Floating motion effect */}
                <g className="anim-float-medium">
                  {/* Robot Head */}
                  <rect x="55" y="45" width="90" height="75" rx="24" fill="#FFFFFF" />
                  {/* Screen Background */}
                  <rect x="67" y="57" width="66" height="51" rx="14" fill="#1E293B" />
                  {/* Eyes (glowing blue) */}
                  <circle cx="88" cy="80" r="7" fill="#62C8FF" className="animate-pulse" />
                  <circle cx="112" cy="80" r="7" fill="#62C8FF" className="animate-pulse" />
                  {/* Waving Arm Left */}
                  <path
                    d="M 40 105 C 30 85, 20 60, 15 50"
                    stroke="#FFFFFF"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="origin-bottom-right"
                    style={{ transform: "rotate(-10deg)" }}
                  />
                  <circle cx="15" cy="50" r="7" fill="#FFC857" />
                  {/* Arm Right */}
                  <path d="M 148 105 C 160 115, 175 130, 185 140" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="185" cy="140" r="7" fill="#FFC857" />
                  {/* Antenna */}
                  <line x1="100" y1="45" x2="100" y2="25" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="100" cy="20" r="8" fill="#FFC857" className="animate-bounce" style={{ animationDuration: "2s" }} />
                  {/* Cheerful Mouth */}
                  <path d="M 94 96 Q 100 100, 106 96" stroke="#62C8FF" strokeWidth="3" strokeLinecap="round" />
                </g>
              </svg>
            </div>

          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer id="pricing" className="border-t border-orange-100 bg-[#FFFDF8] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-12 pb-12 border-b border-orange-100/40">
          
          {/* Logo & About */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#FFC857] flex items-center justify-center shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-slate-800">CareerVerse AI</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-sm">
              AI-powered mock interviews and resume scoring designed to help students and placement teams bridge skill gaps and land outstanding offers.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="hover:text-[#FF8A3D] transition-colors"><TwitterIcon className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#FF8A3D] transition-colors"><LinkedinIcon className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#FF8A3D] transition-colors"><GithubIcon className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#FF8A3D] transition-colors"><InstagramIcon className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2.5 space-y-3">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest">Platform</h5>
            <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-500">
              <li><a href="#features" className="hover:text-[#FF8A3D] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#FF8A3D] transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-[#FF8A3D] transition-colors">Pricing Options</a></li>
              <li><a href="#" className="hover:text-[#FF8A3D] transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2.5 space-y-3">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest">Company</h5>
            <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-500">
              <li><a href="#" className="hover:text-[#FF8A3D] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#FF8A3D] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#FF8A3D] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#FF8A3D] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest text-left">Stay Updated</h5>
            <p className="text-xs text-slate-500 font-medium">
              Get the latest interview prep advice and platform features.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Subscribed: ${emailInput}`);
                setEmailInput("");
              }}
              className="flex items-center gap-2 border border-orange-100 rounded-xl bg-white p-1"
            >
              <input
                type="email"
                required
                className="w-full px-3 py-1.5 text-xs outline-none bg-transparent"
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF8A3D] to-[#FFC857] flex items-center justify-center text-white cursor-pointer shadow hover:opacity-95"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-semibold text-slate-400 gap-4">
          <p>© 2026 CareerVerse AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#FF8A3D] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FF8A3D] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#FF8A3D] transition-colors">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

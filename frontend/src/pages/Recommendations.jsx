import React, { useState } from 'react';
import { readinessApi } from '../services/api';
import { RefreshCw, Sparkles, BookOpen, Download } from 'lucide-react';
import bg1 from '../assets/bg2.jpg';

export default function Recommendations({ user }) {
  const [studyGuide, setStudyGuide] = useState(null);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [days, setDays] = useState(7);

  const handleGenerateGuide = async () => {
    setGeneratingGuide(true);
    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await readinessApi.generateStudyGuide(token, days);
      setStudyGuide(res);
    } catch (err) {
      console.error("Failed to generate guide", err);
      alert("Failed to generate study guide. Please try again.");
    } finally {
      setGeneratingGuide(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const token = user?.token || localStorage.getItem('token');
      const blob = await readinessApi.downloadStudyGuidePdf(token, studyGuide);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Study_Plan_${studyGuide.days.length}_Days.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Study Guide Generation */}
      {!studyGuide && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl shadow-lg p-8 sm:p-12 text-center relative overflow-hidden border border-orange-100">
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-4 text-orange-950">
              ✨ Personalized Study Guide
            </h2>
          <p className="text-orange-900/80 font-medium max-w-2xl mx-auto mb-8">
            Based on your performance and recent ATS/job matching results, our AI can generate a targeted preparation plan just for you. How many days do you have?
          </p>
          
          <div className="max-w-md mx-auto mb-10 bg-white/50 p-6 rounded-2xl border border-orange-200/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-orange-950">Duration</span>
              <span className="px-3 py-1 bg-white text-orange-600 font-extrabold rounded-lg shadow-sm border border-orange-100">
                {days} Days
              </span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="30" 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs font-medium text-orange-800/60 mt-2">
              <span>3 Days</span>
              <span>30 Days</span>
            </div>
          </div>

          <button
            onClick={handleGenerateGuide}
            disabled={generatingGuide}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-orange-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 mx-auto"
          >
            {generatingGuide ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Generating Plan...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate My Study Guide</>
            )}
          </button>
        </div>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      </div>
      )}

      {/* Generated Guide Render */}
      {studyGuide && studyGuide.days && (
        <div className="mt-8 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
          <div
            className="p-8 sm:p-12 relative"
            style={{
              backgroundImage: `url(${bg1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay to ensure text readability if needed */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-indigo-100/50">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-indigo-700 drop-shadow-md" />
                  <h3 className="text-3xl font-extrabold text-slate-900 drop-shadow-sm">Your {studyGuide.days.length}-Day Preparation Plan</h3>
                </div>
                
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-bold rounded-xl shadow-sm border border-indigo-200 hover:bg-indigo-50 hover:shadow-md transition-all disabled:opacity-50"
                >
                  {downloadingPdf ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Generating PDF...</>
                  ) : (
                    <><Download className="w-5 h-5" /> Download PDF</>
                  )}
                </button>
              </div>

              <div className="relative max-w-4xl border-l-2 border-dashed border-indigo-700/30 ml-4 sm:ml-8 space-y-8 py-4">
                {studyGuide.days.map((day, i) => (
                  <div key={i} className="relative pl-8 sm:pl-12 group">

                    {/* Node */}
                    <div className="absolute top-4 -left-[21px] w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-4 border-indigo-200/50 flex items-center justify-center shadow-md z-10 group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-colors duration-300">
                      <span className="text-sm font-extrabold text-indigo-700">D{day.day}</span>
                    </div>

                    {/* Card - Glassmorphism */}
                    <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-5 sm:p-7 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-300 group-hover:-translate-y-1">
                      <h4 className="text-xl font-extrabold text-slate-900 mb-5 flex flex-wrap items-center gap-3 drop-shadow-sm">
                        <span className="px-3 py-1 bg-indigo-100/80 text-indigo-800 rounded-lg text-sm border border-indigo-200/50 shadow-sm">Day {day.day}</span>
                        {day.focus}
                      </h4>
                      <ul className="space-y-3">
                        {day.tasks.map((task, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-800 font-medium">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-sm"></div>
                            <span className="leading-relaxed drop-shadow-sm">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

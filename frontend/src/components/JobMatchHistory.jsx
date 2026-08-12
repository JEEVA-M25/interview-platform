import React, { useEffect, useState } from 'react';
import { aiApi } from '../services/api';
import PageHeader from './ui/PageHeader';
import { BriefcaseBusiness, Calendar, ExternalLink, RefreshCw, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';

export default function JobMatchHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedResumeId, setExpandedResumeId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user?.token || localStorage.getItem('token');
      const data = await aiApi.getJobMatchHistory(token);
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load Job Match history", err);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("Direct download failed, opening in new tab", error);
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="My Job Match History"
        description="Review your past resume vs. job description match analyses."
      />

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {history.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <BriefcaseBusiness className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No History Found</h3>
          <p className="text-slate-500 mt-2">You haven't run any job match analyses yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {item.resumeName || `${user?.fullName?.split(" ")[0] || "User"}'s Resume`}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">Match Score: {item.matchScore}%</h3>
                </div>
                {item.resumeUrl ? (
                  <button
                    onClick={() => setExpandedResumeId(expandedResumeId === item.id ? null : item.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    {expandedResumeId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedResumeId === item.id ? 'Hide Resume' : 'View Resume'}
                  </button>
                ) : (
                  <button disabled className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl cursor-not-allowed text-sm font-medium border border-slate-200">
                    <FileText className="w-4 h-4" />
                    Resume Unavailable
                  </button>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600">
                <p className="font-medium text-slate-800 mb-1">Summary</p>
                {item.summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-2">Matched Skills</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                    {item.matchedSkills?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-rose-700 mb-2">Missing Skills</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                    {item.missingSkills?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-2">Action Plan / Recommendations</h4>
                <ul className="list-decimal pl-5 space-y-1 text-sm text-slate-600">
                  {item.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              
              {/* PDF Inline Viewer */}
              {expandedResumeId === item.id && item.resumeUrl && (
                <div className="mt-6 border-t border-slate-100 pt-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Resume Preview
                    </h4>
                    <div className="flex gap-4">
                      <button onClick={() => setExpandedResumeId(null)} className="text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1.5"><ChevronUp className="w-4 h-4"/> Hide Resume</button>
                      <button onClick={() => handleDownload(item.resumeUrl, item.resumeName)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5"><Download className="w-4 h-4"/> Download</button>
                      <a href={item.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5"><ExternalLink className="w-4 h-4"/> Open in new tab</a>
                    </div>
                  </div>
                  <div className="w-full h-[600px] bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <iframe src={`${item.resumeUrl}#view=FitH`} className="w-full h-full border-0" title="Resume PDF" />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => setExpandedResumeId(null)} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
                      <ChevronUp className="w-4 h-4"/> Hide Resume
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

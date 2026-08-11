import React, { useEffect, useState } from 'react';
import { aiApi } from '../services/api';
import PageHeader from './ui/PageHeader';
import { FileText, Download, Calendar, ExternalLink, RefreshCw } from 'lucide-react';

export default function AtsHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user?.token || localStorage.getItem('token');
      const data = await aiApi.getAtsHistory(token);
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load ATS history", err);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
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
        title="My ATS History"
        description="Review all your past resume ATS analyses and scores."
      />

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {history.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No History Found</h3>
          <p className="text-slate-500 mt-2">You haven't run any ATS analyses yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">Score: {item.score}/100</h3>
                </div>
                {item.resumeUrl && (
                  <a
                    href={item.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Resume
                  </a>
                )}
              </div>
              <p className="text-slate-600 text-sm">{item.summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                    {item.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-rose-700 mb-2">Improvements</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                    {item.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Keywords Found</h4>
                <div className="flex flex-wrap gap-2">
                  {item.keywords?.map((k, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { historyApi } from '../services/api';
import { BriefcaseBusiness, Calendar, Search, Filter, Award, ChevronRight } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function InterviewHistory({ user, onNavigate }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = user?.token;
        if (!token) return;
        const data = await historyApi.getInterviews(token);
        setInterviews(data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [user]);

  const filteredInterviews = interviews.filter(i => 
    i.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 w-full">
      <PageHeader
        eyebrow="History"
        title="Interview History"
        description="Review your past mock interviews, track your scores, and access detailed reports."
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by role or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-semibold shadow-sm shadow-slate-200/50">
          Loading History...
        </div>
      ) : filteredInterviews.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Target Role</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInterviews.map((interview) => (
                  <tr 
                    key={interview.sessionId} 
                    className="hover:bg-orange-50/30 transition-colors group cursor-pointer"
                    onClick={() => onNavigate(`history/${interview.sessionId}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                          <BriefcaseBusiness className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900">{interview.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {interview.interviewDate ? new Date(interview.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                        {interview.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${interview.overallScore >= 80 ? 'text-emerald-500' : interview.overallScore >= 60 ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="font-bold text-slate-900">{interview.overallScore || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        interview.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                        interview.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-slate-400 group-hover:text-orange-500 transition-colors p-2">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <BriefcaseBusiness className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No interviews found</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            {searchTerm ? "No interviews match your search criteria." : "You haven't completed any mock interviews yet. Start your first session to receive detailed feedback and AI recommendations."}
          </p>
          <button 
            onClick={() => onNavigate('interview')} 
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-sm shadow-orange-200 hover:scale-[1.02] transition-all"
          >
            Start an Interview
          </button>
        </div>
      )}
    </div>
  );
}

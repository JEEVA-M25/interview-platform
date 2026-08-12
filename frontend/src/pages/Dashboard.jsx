import React, { useEffect, useState } from 'react';
import { dashboardApi, historyApi } from '../services/api';
import ProgressChart from '../components/ProgressChart';
import ScoreCard from '../components/ScoreCard';
import InterviewCard from '../components/InterviewCard';
import { Target, TrendingUp, Award, CheckCircle } from 'lucide-react';

export default function Dashboard({ user, onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [scores, setScores] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = user?.token;
        if (!token) return;
        const [sumRes, scoresRes, histRes] = await Promise.all([
          dashboardApi.getSummary(token),
          dashboardApi.getScores(token),
          historyApi.getInterviews(token)
        ]);
        
        setSummary(sumRes);
        setScores(scoresRes);
        setRecentInterviews(histRes.slice(0, 5)); // Get latest 5
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Your Progress</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard title="Total Interviews" value={summary?.totalInterviews || 0} icon={Target} />
        <ScoreCard title="Average Score" value={`${Math.round(summary?.averageScore || 0)}%`} icon={TrendingUp} />
        <ScoreCard title="Best Score" value={`${summary?.highestScore || 0}%`} icon={Award} />
        <ScoreCard title="Placement Readiness" value={summary?.placementReadiness || 'N/A'} icon={CheckCircle} />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Interview Scores Over Time</h2>
        <ProgressChart scores={scores} />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Interviews</h2>
        {recentInterviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentInterviews.map((interview) => (
              <InterviewCard 
                key={interview.sessionId} 
                interview={interview} 
                onClick={() => onNavigate(`history/${interview.sessionId}`)} 
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No interviews found. Start an interview to see history.</p>
        )}
      </div>
    </div>
  );
}

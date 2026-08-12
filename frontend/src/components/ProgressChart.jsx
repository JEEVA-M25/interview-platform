import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ProgressChart({ scores }) {
  if (!scores || scores.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-medium">No interview data available yet.</p>
      </div>
    );
  }

  const data = {
    labels: scores.map(s => s.date),
    datasets: [
      {
        label: 'Overall Score',
        data: scores.map(s => s.score),
        borderColor: '#6366f1', // Indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { weight: '500' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { weight: '500' } }
      }
    }
  };

  return (
    <div className="h-72 w-full rounded-xl bg-white border border-slate-200 shadow-sm p-5">
      <Line data={data} options={options} />
    </div>
  );
}

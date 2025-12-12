import { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import axios from '../../config/axiosConfig';
import './AnalyticsStyles.css';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/analytics`);

        if (response.data.success) {
          setAnalytics(response.data.analytics);
        } else {
          setError('Failed to load analytics');
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-error">Error: {error}</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">No analytics data available</div>;
  }

 
  const missedChatsData = (analytics?.missedChatsPerWeek?.length > 0)
    ? analytics.missedChatsPerWeek.map(item => ({
        week: item.week || item._id || 'Week',
        missed: item.missedChats || item.missed || item.count || 0
      }))
    : [
      { week: 'Week 1', missed: 13 },
      { week: 'Week 2', missed: 11 },
      { week: 'Week 3', missed: 8 },
      { week: 'Week 4', missed: 6 },
      { week: 'Week 5', missed: 10 },
      { week: 'Week 6', missed: 3 },
      { week: 'Week 7', missed: 7 },
      { week: 'Week 8', missed: 15 },
      { week: 'Week 9', missed: 18 },
      { week: 'Week 10', missed: 16 }
    ];

  const formatReplyTime = (milliseconds) => {
    if (!milliseconds) return '0 secs';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const missedChatsChartData = {
    labels: missedChatsData.map(d => d.week),
    datasets: [
      {
        label: 'Missed Chats',
        data: missedChatsData.map(d => d.missed),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#059669',
      },
    ],
  };

  const missedChatsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        borderColor: '#10b981',
        borderWidth: 2,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Chats: ${context.raw}`;
          },
          title: function () {
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          padding: 10,
          stepSize: 5,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          padding: 10,
        },
      },
    },
  };


  const resolvedChartData = {
    labels: ['Resolved', 'Pending'],
    datasets: [
      {
        data: [analytics.resolvedTicketsPercentage, 100 - analytics.resolvedTicketsPercentage],
        backgroundColor: ['#10b981', '#e5e7eb'],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const resolvedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        borderColor: '#10b981',
        borderWidth: 2,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}%`;
          },
          title: function () {
            return '';
          },
        },
      },
    },
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics</h1>
      </div>


      <div className="analytics-section">
        <div className="section-header">
          <h2>Missed Chats</h2>
          <span className="section-menu">⋯</span>
        </div>
        <div className="chart-container line-chart-container">
          <Line data={missedChatsChartData} options={missedChatsOptions} />
        </div>
      </div>

      <div className="analytics-section info-section">
        <div className="info-section-content">
          <div className="info-left">
            <h2>Average Reply time</h2>
            <p className="info-description">
              For highest customer satisfaction rates you should aim to reply to an incoming customer's message in 15 seconds or less. Quick responses will get you more conversations, help you earn customers trust and make more sales.
            </p>
          </div>
          <div className="info-right">
            <div className="metric-display">{formatReplyTime(analytics.averageReplyTime)}</div>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <div className="section-with-chart">
          <div className="section-left">
            <h2>Resolved Tickets</h2>
            <p className="info-description">
              A callback system on a website, as well as proactive invitations, help to attract even more customers. A separate round button for ordering a call with a small animation helps to motivate more customers to make calls.
            </p>
          </div>
          <div className="section-right">
            <div className="pie-chart-container">
              <Pie data={resolvedChartData} options={resolvedOptions} />
              <div className="pie-percentage">{analytics.resolvedTicketsPercentage}%</div>
            </div>
          </div>
        </div>
      </div>


      <div className="analytics-section info-section">
        <div className="info-section-content">
          <div className="info-left">
            <h2>Total Chats</h2>
            <p className="info-description">
              This metric Shows the total number of chats for all Channels for the selected the selected period
            </p>
          </div>
          <div className="info-right">
            <div className="metric-display metric-chats">{analytics.totalChats} Chats</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
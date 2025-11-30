// import { useEffect, useState } from 'react';
// import { Line, Pie } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from 'chart.js';
// import axios from '../../config/axiosConfig';
// import './AnalyticsStyles.css';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// const Analytics = () => {
//   const [analytics, setAnalytics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get('http://localhost:4000/api/admin/analytics');

//         if (response.data.success) {
//           setAnalytics(response.data.analytics);
//         } else {
//           setError('Failed to load analytics');
//         }
//       } catch (err) {
//         console.error('Analytics fetch error:', err);
//         setError(err.message || 'Failed to fetch analytics');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, []);

//   if (loading) {
//     return <div className="analytics-loading">Loading analytics...</div>;
//   }

//   if (error) {
//     return <div className="analytics-error">Error: {error}</div>;
//   }

//   if (!analytics) {
//     return <div className="analytics-error">No analytics data available</div>;
//   }

//   // ════════════════════════════════════════════════════════════════════════
//   // MISSED CHATS DATA - for Line Chart
//   // ════════════════════════════════════════════════════════════════════════

//   const missedChatsData = analytics.missedChatsPerWeek && analytics.missedChatsPerWeek.length > 0
//     ? analytics.missedChatsPerWeek
//     : [
//         { week: 'Week 1', missed: 13 },
//         { week: 'Week 2', missed: 11 },
//         { week: 'Week 3', missed: 8 },
//         { week: 'Week 4', missed: 6 },
//         { week: 'Week 5', missed: 10 },
//         { week: 'Week 6', missed: 3 },
//         { week: 'Week 7', missed: 7 },
//         { week: 'Week 8', missed: 15 },
//         { week: 'Week 9', missed: 18 },
//         { week: 'Week 10', missed: 16 }
//       ];

//   // ════════════════════════════════════════════════════════════════════════
//   // FORMAT AVERAGE REPLY TIME
//   // ════════════════════════════════════════════════════════════════════════

//   const formatReplyTime = (milliseconds) => {
//     if (!milliseconds) return '0 secs';
//     const seconds = Math.floor(milliseconds / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);

//     if (hours > 0) {
//       return `${hours}h ${minutes % 60}m`;
//     }
//     if (minutes > 0) {
//       return `${minutes}m ${seconds % 60}s`;
//     }
//     return `${seconds}s`;
//   };

//   // ════════════════════════════════════════════════════════════════════════
//   // CHART.JS DATA - MISSED CHATS LINE CHART
//   // ════════════════════════════════════════════════════════════════════════

//   const missedChatsChartData = {
//     labels: missedChatsData.map(d => d.week),
//     datasets: [
//       {
//         label: 'Missed Chats',
//         data: missedChatsData.map(d => d.missed),
//         borderColor: '#10b981', // Green like screenshot
//         backgroundColor: 'rgba(16, 185, 129, 0.1)',
//         borderWidth: 3,
//         fill: true,
//         tension: 0.4,
//         pointRadius: 6,
//         pointBackgroundColor: '#10b981',
//         pointBorderColor: '#fff',
//         pointBorderWidth: 2,
//         pointHoverRadius: 8,
//         pointHoverBackgroundColor: '#059669',
//       },
//     ],
//   };

//   const missedChatsOptions = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top',
//         labels: {
//           font: { size: 12, weight: '600' },
//           color: '#6b7280',
//           padding: 15,
//           usePointStyle: true,
//         },
//       },
//       tooltip: {
//         backgroundColor: 'rgba(0, 0, 0, 0.8)',
//         padding: 12,
//         titleFont: { size: 14, weight: '600' },
//         bodyFont: { size: 13 },
//         borderColor: '#10b981',
//         borderWidth: 2,
//         displayColors: true,
//         callbacks: {
//           label: function (context) {
//             return `${context.raw} chats`;
//           },
//         },
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: 'rgba(0, 0, 0, 0.05)',
//           drawBorder: false,
//         },
//         ticks: {
//           color: '#9ca3af',
//           font: { size: 12 },
//           padding: 10,
//         },
//       },
//       x: {
//         grid: {
//           display: false,
//         },
//         ticks: {
//           color: '#9ca3af',
//           font: { size: 12 },
//           padding: 10,
//         },
//       },
//     },
//   };

//   // ════════════════════════════════════════════════════════════════════════
//   // CHART.JS DATA - RESOLVED TICKETS PIE CHART
//   // ════════════════════════════════════════════════════════════════════════

//   const resolvedChartData = {
//     labels: ['Resolved', 'Pending'],
//     datasets: [
//       {
//         data: [analytics.resolvedTicketsPercentage, 100 - analytics.resolvedTicketsPercentage],
//         backgroundColor: ['#10b981', '#e5e7eb'],
//         borderColor: '#fff',
//         borderWidth: 3,
//         hoverOffset: 10,
//       },
//     ],
//   };

//   const resolvedOptions = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'bottom',
//         labels: {
//           font: { size: 12, weight: '600' },
//           color: '#6b7280',
//           padding: 20,
//           usePointStyle: true,
//         },
//       },
//       tooltip: {
//         backgroundColor: 'rgba(0, 0, 0, 0.8)',
//         padding: 12,
//         titleFont: { size: 14, weight: '600' },
//         bodyFont: { size: 13 },
//         borderColor: '#10b981',
//         borderWidth: 2,
//         callbacks: {
//           label: function (context) {
//             return `${context.label}: ${context.parsed}%`;
//           },
//         },
//       },
//     },
//   };

//   return (
//     <div className="analytics-container">
//       {/* ════════════════════════════════════════════════════════════════════ */}
//       {/* HEADER */}
//       {/* ════════════════════════════════════════════════════════════════════ */}

//       <div className="analytics-header">
//         <h1>Analytics</h1>
//       </div>

//       {/* ════════════════════════════════════════════════════════════════════ */}
//       {/* TOP METRICS ROW */}
//       {/* ════════════════════════════════════════════════════════════════════ */}

//       <div className="analytics-top-section">
//         {/* MISSED CHATS TITLE */}
//         <div className="missed-chats-title">
//           <h2>Missed Chats</h2>
//           <p>Track unanswered conversations</p>
//         </div>

//         {/* TOTAL CHATS CARD */}
//         <div className="metric-card total-chats">
//           <div className="metric-number">{analytics.totalChats}</div>
//           <div className="metric-label">Total Chats</div>
//           <p className="metric-desc">All-time conversations</p>
//         </div>

//         {/* AVG REPLY TIME CARD */}
//         <div className="metric-card avg-time">
//           <div className="metric-number">{formatReplyTime(analytics.averageReplyTime)}</div>
//           <div className="metric-label">Average Reply Time</div>
//           <p className="metric-desc">Quick responses</p>
//         </div>

//         {/* RESOLVED TICKETS CARD */}
//         <div className="metric-card resolved">
//           <div className="metric-number">{analytics.resolvedTicketsPercentage}%</div>
//           <div className="metric-label">Resolved Tickets</div>
//           <p className="metric-desc">Resolution rate</p>
//         </div>
//       </div>

//       {/* ════════════════════════════════════════════════════════════════════ */}
//       {/* MAIN CONTENT - CHARTS */}
//       {/* ════════════════════════════════════════════════════════════════════ */}

//       <div className="analytics-main">
//         {/* LEFT SIDE - LINE CHART */}
//         <div className="chart-section">
//           <div className="chart-card">
//             <Line data={missedChatsChartData} options={missedChatsOptions} />
//           </div>
//         </div>

//         {/* RIGHT SIDE - INFO CARDS */}
//         <div className="info-section">
//           {/* AVERAGE REPLY TIME INFO */}
//           <div className="info-card">
//             <h3>Average Reply time</h3>
//             <p className="info-desc">
//               For highest customer satisfaction rates you should aim to reply to an incoming customer's message in 15 seconds or less. Quick responses will get you more conversations, help you earn customers trust and make more sales.
//             </p>
//             <div className="info-metric">{formatReplyTime(analytics.averageReplyTime)}</div>
//           </div>

//           {/* RESOLVED TICKETS PIE CHART */}
//           <div className="pie-card">
//             <h3>Resolved Tickets</h3>
//             <div className="pie-chart-wrapper">
//               <Pie data={resolvedChartData} options={resolvedOptions} />
//               <div className="pie-percentage">{analytics.resolvedTicketsPercentage}%</div>
//             </div>
//           </div>

//           {/* TOTAL CHATS INFO */}
//           <div className="info-card">
//             <h3>Total Chats</h3>
//             <p className="info-desc">
//               A callback system on a website, as well as proactive invitations, help to attract even more customers. A separate round button for ordering a call with a small animation helps to motivate more customers to make calls.
//             </p>
//             <div className="info-metric">{analytics.totalChats} Chats</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Analytics;



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
} from 'chart.js';
import axios from '../../config/axiosConfig';
import './AnalyticsStyles.css';


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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

  // ════════════════════════════════════════════════════════════════════════
  // MISSED CHATS DATA - for Line Chart
  // ════════════════════════════════════════════════════════════════════════

  const missedChatsData = analytics.missedChatsPerWeek && analytics.missedChatsPerWeek.length > 0
    ? analytics.missedChatsPerWeek
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

  // ════════════════════════════════════════════════════════════════════════
  // FORMAT AVERAGE REPLY TIME
  // ════════════════════════════════════════════════════════════════════════

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

  // ════════════════════════════════════════════════════════════════════════
  // CHART.JS DATA - MISSED CHATS LINE CHART
  // ════════════════════════════════════════════════════════════════════════

  const missedChatsChartData = {
    labels: missedChatsData.map(d => d.week),
    datasets: [
      {
        label: 'Missed Chats',
        data: missedChatsData.map(d => d.missed),
        borderColor: '#10b981', // Green like screenshot
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

  // ════════════════════════════════════════════════════════════════════════
  // CHART.JS DATA - RESOLVED TICKETS PIE CHART
  // ════════════════════════════════════════════════════════════════════════

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
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <div className="analytics-header">
        <h1>Analytics</h1>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MISSED CHATS SECTION */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <div className="analytics-section">
        <div className="section-header">
          <h2>Missed Chats</h2>
          <span className="section-menu">⋯</span>
        </div>
        <div className="chart-container line-chart-container">
          <Line data={missedChatsChartData} options={missedChatsOptions} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* AVERAGE REPLY TIME SECTION */}
      {/* ════════════════════════════════════════════════════════════════════ */}

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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* RESOLVED TICKETS SECTION */}
      {/* ════════════════════════════════════════════════════════════════════ */}

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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TOTAL CHATS SECTION */}
      {/* ════════════════════════════════════════════════════════════════════ */}

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
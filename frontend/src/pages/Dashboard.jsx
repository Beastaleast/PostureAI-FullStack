import { useNavigate } from "react-router-dom";

import DashboardCard from "../components/dashboard/DashboardCard";
import SessionSummary from "../components/dashboard/SessionSummary";
import RecentSessions from "../components/dashboard/RecentSessions";
import useDashboardData from "../hooks/useDashboardData";
import { formatDuration } from "../utils/formatDuration";

import "../styles/dashboard.css";


function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    sessions,
    totalMonitoringSeconds,
    goodPostureSeconds,
    poorPostureSeconds,
    classifiedSeconds,
    postureScore,
    recentTrend,
  } = useDashboardData();

  const userName = user?.name?.split(" ")[0] || "there";
  const goodPercentage = classifiedSeconds
    ? Math.round((goodPostureSeconds / classifiedSeconds) * 100)
    : 0;
  const poorPercentage = classifiedSeconds
    ? Math.round((poorPostureSeconds / classifiedSeconds) * 100)
    : 0;

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <span className="eyebrow">POSTURE OVERVIEW</span>
          <h1>Good morning, {userName} 👋</h1>
          <p>Track your posture habits and build a healthier sitting routine.</p>
        </div>
        <button
          className="start-monitor-button"
          onClick={() => navigate("/live-monitor")}
        >
          <span>●</span> Start Monitoring
        </button>
      </section>

      <section className="dashboard-cards" aria-label="Posture statistics">
        <DashboardCard
          title="Posture Score"
          value={postureScore !== null ? `${postureScore}%` : "--"}
          subtitle={postureScore !== null ? "Overall good-posture ratio" : "Start a session to calculate"}
          icon="◈"
          accent="blue"
        />
        <DashboardCard
          title="Monitoring Time"
          value={formatDuration(totalMonitoringSeconds)}
          subtitle={`${sessions.length} recorded session${sessions.length === 1 ? "" : "s"}`}
          icon="◷"
          accent="purple"
        />
        <DashboardCard
          title="Good Posture"
          value={formatDuration(goodPostureSeconds)}
          subtitle={totalMonitoringSeconds ? `${goodPercentage}% of classified time` : "No data yet"}
          icon="✓"
          accent="green"
        />
        <DashboardCard
          title="Poor Posture"
          value={formatDuration(poorPostureSeconds)}
          subtitle={totalMonitoringSeconds ? `${poorPercentage}% of classified time` : "No data yet"}
          icon="!"
          accent="orange"
        />
      </section>

      <section className="dashboard-grid">
        <div className="trend-card dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">PERFORMANCE</span>
              <h2>Recent posture trend</h2>
            </div>
            <span className="trend-count">{recentTrend.length} sessions</span>
          </div>

          {recentTrend.length === 0 ? (
            <div className="dashboard-empty compact">
              <div className="empty-icon">◌</div>
              <h3>Your trend will appear here</h3>
              <p>Complete your first monitoring session to start building posture analytics.</p>
            </div>
          ) : (
            <div className="trend-chart">
              {recentTrend.map((item) => (
                <div className="trend-column" key={item.id}>
                  <span className="trend-value">{item.score}%</span>
                  <div className="trend-track">
                    <div
                      className={`trend-bar ${item.score >= 80 ? "good" : item.score >= 60 ? "average" : "poor"}`}
                      style={{ height: `${Math.max(item.score, 8)}%` }}
                    />
                  </div>
                  <span className="trend-label">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-action-card dashboard-panel">
          <span className="panel-kicker">QUICK START</span>
          <h2>Ready to improve your posture?</h2>
          <p>Start a live session and let PostureAI track your posture in real time.</p>
          <button className="secondary-monitor-button" onClick={() => navigate("/live-monitor")}>
            Open Live Monitor →
          </button>
          <div className="quick-action-meta">
            <span>● Camera-based</span>
            <span>● On-device pose analysis</span>
          </div>
        </div>
      </section>

      <SessionSummary
        sessions={sessions}
        totalMonitoringSeconds={totalMonitoringSeconds}
        goodPostureSeconds={goodPostureSeconds}
        poorPostureSeconds={poorPostureSeconds}
      />

      <RecentSessions sessions={sessions} />
    </div>
  );
}

export default Dashboard;

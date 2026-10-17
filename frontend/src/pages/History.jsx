import { useNavigate } from "react-router-dom";
import useDashboardData from "../hooks/useDashboardData";
import "../styles/dashboard.css";

function formatDuration(seconds) {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function History() {
  const navigate = useNavigate();
  const { sessions } = useDashboardData();

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <span className="eyebrow">ACTIVITY</span>
          <h1>Session History</h1>
          <p>Review your recorded posture monitoring sessions.</p>
        </div>
        <button className="start-monitor-button" onClick={() => navigate("/live-monitor")}>
          <span>●</span> New Session
        </button>
      </section>

      <section className="recent-sessions">
        <div className="section-header">
          <div>
            <h2>All Monitoring Sessions</h2>
            <p>{sessions.length} session{sessions.length === 1 ? "" : "s"} recorded</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-sessions">
            <div className="empty-sessions-icon">◌</div>
            <h3>No sessions yet</h3>
            <p>Start your first monitoring session to build your posture history.</p>
            <button className="start-monitor-button" onClick={() => navigate("/live-monitor")}>
              Start Monitoring
            </button>
          </div>
        ) : (
          <div className="sessions-table">
            <div className="table-header">
              <span>Date</span><span>Time</span><span>Duration</span><span>Score</span><span>Status</span>
            </div>
            {sessions.map((session) => {
              const duration = Number(session.durationSeconds) || 0;
              const good = Number(session.goodPostureSeconds) || 0;
              const score = duration ? Math.round((good / duration) * 100) : 0;
              const status = score >= 80 ? "Good" : score >= 60 ? "Average" : "Poor";
              const date = new Date(session.startTime);

              return (
                <div className="table-row" key={session.id}>
                  <span>{date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <span>{date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{formatDuration(duration)}</span>
                  <strong>{score}%</strong>
                  <span className={`session-status ${status === "Good" ? "status-good" : status === "Average" ? "status-average" : "status-poor"}`}>{status}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default History;

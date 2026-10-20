import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDashboardData from "../hooks/useDashboardData";
import { useAuth } from "../context/useAuth";
import sessionService from "../srevices/sessionService";
import { formatDuration } from "../utils/formatDuration";
import "../styles/dashboard.css";


function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions: dashboardSessions } = useDashboardData();
  const [sessions, setSessions] = useState(dashboardSessions);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteSession = (session) => {
    const date = new Date(session.startTime);
    const dateLabel = Number.isNaN(date.getTime())
      ? "this session"
      : `the session from ${date.toLocaleDateString()}`;
    const confirmed = window.confirm(`Delete ${dateLabel}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const deleted = sessionService.deleteSession(session.id, user?.id);
      if (!deleted) {
        setDeleteError("This session could not be found. Refresh the page and try again.");
        return;
      }
      setSessions((currentSessions) => currentSessions.filter((item) => String(item.id) !== String(session.id)));
      setDeleteError("");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete this session.");
    }
  };

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

        {deleteError && <p className="session-delete-error" role="alert">{deleteError}</p>}

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
          <div className="sessions-table session-history-table">
            <div className="table-header">
              <span>Date</span><span>Time</span><span>Duration</span><span>Score</span><span>Status</span><span>Action</span>
            </div>
            {sessions.map((session) => {
              const duration = Number(session.durationSeconds) || 0;
              const good = Number(session.goodPostureSeconds) || 0;
              const poor = Number(session.poorPostureSeconds) || 0;
              const classified = good + poor;
              const score = typeof session.postureScore === "number"
                ? session.postureScore
                : classified > 0
                  ? Math.round((good / classified) * 100)
                  : typeof session.poorPostureSeconds !== "number" && duration > 0
                    ? Math.round((good / duration) * 100)
                    : null;
              const status = score === null ? "No Data" : score >= 80 ? "Good" : score >= 60 ? "Average" : "Poor";
              const date = new Date(session.startTime);

              return (
                <div className="table-row" key={session.id}>
                  <span>{date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <span>{date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{formatDuration(duration)}</span>
                  <strong>{score === null ? "--" : `${score}%`}</strong>
                  <span className={`session-status ${status === "Good" ? "status-good" : status === "Average" ? "status-average" : status === "Poor" ? "status-poor" : "status-neutral"}`}>{status}</span>
                  <button
                    type="button"
                    className="session-delete-button"
                    onClick={() => handleDeleteSession(session)}
                    aria-label={`Delete session from ${date.toLocaleDateString()}`}
                    title="Delete session"
                  >
                    Delete
                  </button>
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

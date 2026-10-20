import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import { formatDuration } from "../../utils/formatDuration";


function formatDate(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSessionScore(session) {
  if (typeof session.postureScore === "number") return session.postureScore;
  const good = Number(session.goodPostureSeconds) || 0;
  const poor = Number(session.poorPostureSeconds) || 0;
  const classified = good + poor;
  if (classified > 0) return Math.round((good / classified) * 100);
  if (typeof session.goodPostureSeconds === "number" && Number(session.durationSeconds) > 0 && typeof session.poorPostureSeconds !== "number") {
    return Math.round((good / Number(session.durationSeconds)) * 100);
  }
  return null;
}

function getSessionStatus(score) {
  if (score === null) {
    return "No Data";
  }

  if (score >= 80) {
    return "Good";
  }

  if (score >= 60) {
    return "Average";
  }

  return "Poor";
}

function RecentSessions({ sessions = [] }) {
  const navigate = useNavigate();

  const recentSessions = [...sessions]
    .sort(
      (a, b) =>
        new Date(b.startTime) -
        new Date(a.startTime)
    )
    .slice(0, 5);

  return (
    <div className="recent-sessions">

      <div className="section-header">

        <div>
          <h2>Recent Sessions</h2>

          <p>
            Your latest posture monitoring sessions
          </p>
        </div>

        <button
          className="view-all-button"
          onClick={() => navigate("/history")}
        >
          View All
        </button>

      </div>


      {recentSessions.length === 0 ? (

        <div className="empty-sessions">

          <div className="empty-sessions-icon">
            📊
          </div>

          <h3>No monitoring sessions yet</h3>

          <p>
            Start a live monitoring session to
            begin collecting your posture data.
          </p>

          <button
            className="start-monitor-button"
            onClick={() =>
              navigate("/live-monitor")
            }
          >
            Start Monitoring
          </button>

        </div>

      ) : (

        <div className="sessions-table">

          <div className="table-header">
            <span>Date</span>
            <span>Time</span>
            <span>Duration</span>
            <span>Score</span>
            <span>Status</span>
          </div>


          {recentSessions.map((session) => {

            const score =
              getSessionScore(session);

            const status =
              getSessionStatus(score);

            return (
              <div
                className="table-row"
                key={session.id}
              >

                <span>
                  {formatDate(
                    session.startTime
                  )}
                </span>

                <span>
                  {formatTime(
                    session.startTime
                  )}
                </span>

                <span>
                  {formatDuration(
                    session.durationSeconds
                  )}
                </span>

                <strong>
                  {score !== null
                    ? `${score}%`
                    : "--"}
                </strong>

                <span
                  className={`session-status ${status === "Good"
                      ? "status-good"
                      : status === "Average"
                        ? "status-average"
                        : status === "Poor"
                          ? "status-poor"
                          : "status-neutral"
                    }`}
                >
                  {status}
                </span>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default RecentSessions;
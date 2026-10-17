import "../../styles/dashboard.css";

function formatDuration(seconds) {
  if (!seconds) {
    return "0m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function SessionSummary({
  sessions = [],
  totalMonitoringSeconds = 0,
  goodPostureSeconds = 0,
  poorPostureSeconds = 0,
}) {
  const hasData = sessions.length > 0;

  const postureScore =
    totalMonitoringSeconds > 0
      ? Math.round(
        (goodPostureSeconds /
          totalMonitoringSeconds) *
        100
      )
      : null;

  const goodPercentage =
    totalMonitoringSeconds > 0
      ? Math.round(
        (goodPostureSeconds /
          totalMonitoringSeconds) *
        100
      )
      : 0;

  const poorPercentage =
    totalMonitoringSeconds > 0
      ? Math.round(
        (poorPostureSeconds /
          totalMonitoringSeconds) *
        100
      )
      : 0;

  return (
    <div className="session-summary">

      <div className="section-header">
        <div>
          <h2>Today's Summary</h2>

          <p>
            Your posture performance today
          </p>
        </div>
      </div>


      <div className="summary-content">

        <div className="posture-score">

          <div className="score-circle">
            <span>
              {postureScore !== null
                ? `${postureScore}%`
                : "--"}
            </span>
          </div>

          <div>
            <h3>
              {hasData
                ? "Posture Performance"
                : "No Data Yet"}
            </h3>

            <p>
              {hasData
                ? "Your posture statistics are based on your recorded monitoring sessions."
                : "Start a monitoring session to begin collecting posture data."}
            </p>
          </div>

        </div>


        <div className="summary-stats">

          <div className="summary-stat">
            <span className="stat-label">
              Monitoring Time
            </span>

            <strong>
              {formatDuration(
                totalMonitoringSeconds
              )}
            </strong>
          </div>


          <div className="summary-stat">
            <span className="stat-label">
              Good Posture
            </span>

            <strong>
              {formatDuration(
                goodPostureSeconds
              )}
            </strong>

            {hasData && (
              <small>
                {goodPercentage}% of monitored time
              </small>
            )}
          </div>


          <div className="summary-stat">
            <span className="stat-label">
              Poor Posture
            </span>

            <strong>
              {formatDuration(
                poorPostureSeconds
              )}
            </strong>

            {hasData && (
              <small>
                {poorPercentage}% of monitored time
              </small>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default SessionSummary;
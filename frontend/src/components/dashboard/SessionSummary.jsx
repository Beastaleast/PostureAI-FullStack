import "../../styles/dashboard.css";
import { formatDuration } from "../../utils/formatDuration";


function SessionSummary({
  sessions = [],
  totalMonitoringSeconds = 0,
  goodPostureSeconds = 0,
  poorPostureSeconds = 0,
}) {
  const hasSessions = sessions.length > 0;
  const classifiedSeconds = goodPostureSeconds + poorPostureSeconds;
  const hasPostureData = classifiedSeconds > 0;

  const postureScore = hasPostureData
    ? Math.round((goodPostureSeconds / classifiedSeconds) * 100)
    : null;

  const goodPercentage = hasPostureData
    ? Math.round((goodPostureSeconds / classifiedSeconds) * 100)
    : 0;

  const poorPercentage = hasPostureData
    ? Math.round((poorPostureSeconds / classifiedSeconds) * 100)
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
              {hasPostureData
                ? "Posture Performance"
                : "No Posture Data Yet"}
            </h3>

            <p>
              {hasPostureData
                ? "Scores use time classified as good or poor; unclassified frames are excluded."
                : hasSessions
                  ? "Sessions are saved, but no clear posture classifications were recorded. Check the camera position and try again."
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

            {hasPostureData && (
              <small>
                {goodPercentage}% of classified time
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

            {hasPostureData && (
              <small>
                {poorPercentage}% of classified time
              </small>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default SessionSummary;
import "../../styles/monitor.css";

function PostureStatus({ posture = "WAITING", isMonitoring = false }) {
  const isGood = posture === "GOOD";
  const isWaiting = posture === "WAITING" || !isMonitoring;

  const title = isWaiting
    ? "WAITING FOR AI"
    : isGood
      ? "GOOD POSTURE"
      : "POOR POSTURE";

  const message = isWaiting
    ? "Start monitoring and the AI result will appear here."
    : isGood
      ? "Keep maintaining your current position."
      : "Please adjust your sitting position.";

  return (
    <div
      className={`posture-status-card ${
        isWaiting ? "posture-waiting" : isGood ? "posture-good" : "posture-bad"
      }`}
    >
      <div className="posture-status-icon">
        {isWaiting ? "…" : isGood ? "✓" : "!"}
      </div>
      <div className="posture-status-content">
        <span className="posture-status-label">Current Posture</span>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default PostureStatus;

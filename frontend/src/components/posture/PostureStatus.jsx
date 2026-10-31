import "../../styles/monitor.css";

function PostureStatus({ posture = "WAITING", isMonitoring = false, message = "" }) {
  const isGood = posture === "GOOD";
  const isWaiting = posture === "WAITING";
  const title = isWaiting
    ? (isMonitoring ? "WAITING FOR BODY POSITION" : "READY FOR POSTURE CHECK")
    : isGood
      ? "GOOD POSTURE"
      : "POOR POSTURE — ADJUST";
 const defaultMessage = isWaiting
  ? "Bring your shoulders, neck, back, hips, and at least one knee into view."
  : isGood
    ? "Your shoulder, neck, back, and hip alignment currently looks within the selected ranges."
    : "One or more posture checks is outside the target range. Adjust your sitting position and watch the feedback.";

  return (
    <div className={`posture-status-card ${isWaiting ? "posture-waiting" : isGood ? "posture-good" : "posture-bad"}`} aria-live="polite">
      <div className="posture-status-icon">{isWaiting ? "…" : isGood ? "✓" : "!"}</div>
      <div className="posture-status-content">
        <span className="posture-status-label">Current Alignment</span>
        <h2>{title}</h2>
        <p>{message || defaultMessage}</p>
      </div>
    </div>
  );
}

export default PostureStatus;

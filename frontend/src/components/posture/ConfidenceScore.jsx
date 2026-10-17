import "../../styles/monitor.css";

function ConfidenceScore({ confidence = 0 }) {
  const normalized = Math.max(0, Math.min(100, Number(confidence) * 100));
  const displayValue = Math.round(normalized);

  return (
    <div className="confidence-card">
      <div className="confidence-header">
        <div>
          <h3>AI Confidence</h3>
          <p>How certain the current prediction is</p>
        </div>
        <strong>{displayValue}%</strong>
      </div>
      <div className="confidence-bar" aria-label={`AI confidence ${displayValue}%`}>
        <div className="confidence-progress" style={{ width: `${displayValue}%` }} />
      </div>
      <div className="confidence-footer">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

export default ConfidenceScore;

import "../../styles/monitor.css";

function ConfidenceScore({ confidence = 0 }) {
  const normalized = Math.max(0, Math.min(100, Number(confidence) * 100));
  const displayValue = Math.round(normalized);

  return (
    <div className="confidence-card">
      <div className="confidence-header">
        <div>
          <h3>Landmark Visibility</h3>
          <p>How clearly the key body points are detected</p>
        </div>
        <strong>{displayValue}%</strong>
      </div>
      <div className="confidence-bar" role="progressbar" aria-label="Key landmark visibility" aria-valuemin={0} aria-valuemax={100} aria-valuenow={displayValue}>
        <div className="confidence-progress" style={{ width: `${displayValue}%` }} />
      </div>
      <div className="confidence-footer"><span>Low visibility</span><span>Clear landmarks</span></div>
    </div>
  );
}

export default ConfidenceScore;

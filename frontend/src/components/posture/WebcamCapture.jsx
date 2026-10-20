import { useCallback, useEffect, useRef } from "react";
import useWebcam from "../../hooks/useWebcam";
import usePoseDetection from "../../hooks/usePoseDetection";
import "../../styles/monitor.css";

function WebcamCapture({ onCameraStatusChange, onPostureUpdate, onDetectionStatusChange }) {
  const overlayRef = useRef(null);
  const {
    videoRef,
    isCameraActive,
    cameraError,
    startCamera,
    stopCamera,
  } = useWebcam();
  const { status: detectorStatus, error: detectorError, result, poseConnections, relevantLandmarkIndices } =
    usePoseDetection(videoRef, isCameraActive);

  useEffect(() => {
    onCameraStatusChange?.(isCameraActive);
  }, [isCameraActive, onCameraStatusChange]);

  useEffect(() => {
    onDetectionStatusChange?.(detectorStatus);
  }, [detectorStatus, onDetectionStatusChange]);

  useEffect(() => {
    if (!result) return;
    onPostureUpdate?.({
      posture: result.posture,
      confidence: result.confidence,
      message: result.message,
      metrics: result.metrics,
    });
  }, [result, onPostureUpdate]);

  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const landmarks = result?.landmarks || [];
    const width = video.videoWidth || 0;
    const height = video.videoHeight || 0;
    if (!width || !height) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, width, height);
    if (landmarks.length === 0) return;

    const isGood = result?.posture === "GOOD";
    const isPoor = result?.posture === "POOR";
    context.strokeStyle = isGood ? "rgba(52, 211, 153, 0.96)" : isPoor ? "rgba(248, 70, 83, 0.96)" : "rgba(129, 140, 248, 0.92)";
    context.fillStyle = isGood ? "rgba(52, 211, 153, 0.98)" : isPoor ? "rgba(248, 70, 83, 0.98)" : "rgba(129, 140, 248, 0.98)";
    context.lineWidth = Math.max(2, width / 420);

    poseConnections.forEach(([startIndex, endIndex]) => {
      const start = landmarks[startIndex];
      const end = landmarks[endIndex];
      if (!start || !end) return;
      if ((start.visibility ?? 0) < 0.35 || (end.visibility ?? 0) < 0.35) return;
      context.beginPath();
      context.moveTo(start.x * width, start.y * height);
      context.lineTo(end.x * width, end.y * height);
      context.stroke();
    });

    relevantLandmarkIndices.forEach((landmarkIndex) => {
      const point = landmarks[landmarkIndex];
      if (!point || (point.visibility ?? 0) < 0.35) return;
      context.beginPath();
      context.arc(point.x * width, point.y * height, Math.max(2.5, width / 160), 0, Math.PI * 2);
      context.fill();
    });
  }, [poseConnections, relevantLandmarkIndices, result, videoRef]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  return (
    <div className="webcam-container">
      <div className="webcam-header">
        <div>
          <h2>Live Camera &amp; Alignment</h2>
          <p>Keep your neck, both shoulders, back, hips, knees, and feet visible. A front-side camera angle works best.</p>
        </div>
        {isCameraActive && (
          <div className="camera-status">
            <span className="status-dot" /> Camera Active
          </div>
        )}
      </div>

      <div className="webcam-view">
        {!isCameraActive && (
          <div className="camera-placeholder">
            <div className="camera-icon">◉</div>
            <h3>Camera is not started</h3>
            <p>Your camera frames stay in this browser while posture landmarks are estimated.</p>
            <button className="camera-button" onClick={startCamera}>Start Camera</button>
          </div>
        )}
        <video
          ref={videoRef}
          className={`webcam-video ${isCameraActive ? "visible" : ""}`}
          autoPlay
          playsInline
          muted
        />
        {isCameraActive && <canvas ref={overlayRef} className="pose-overlay" aria-hidden="true" />}
        {isCameraActive && detectorStatus === "loading" && (
          <div className="pose-overlay-message">Loading posture model…</div>
        )}
      </div>

      {cameraError && <div className="camera-error" role="alert">{cameraError}</div>}
      {detectorError && <div className="camera-error" role="alert">{detectorError}</div>}
      {isCameraActive && !detectorError && (
        <p className={`detector-note ${detectorStatus === "ready" ? "detector-ready" : ""}`}>
          <span className="status-dot" />
          {detectorStatus === "ready" ? "On-device posture checks active" : "Preparing posture checks…"}
          {result?.posture === "GOOD" && " · Good posture"}
          {result?.posture === "POOR" && " · Poor posture"}
          {result?.metrics && ` · Back lean ${result.metrics.backLeanDegrees}°`}
        </p>
      )}

      {isCameraActive && (
        <button className="stop-camera-button" onClick={stopCamera}>Stop Camera</button>
      )}
    </div>
  );
}

export default WebcamCapture;

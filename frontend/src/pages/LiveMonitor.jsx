import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import WebcamCapture from "../components/posture/WebcamCapture";
import PostureStatus from "../components/posture/PostureStatus";
import ConfidenceScore from "../components/posture/ConfidenceScore";
import { useAuth } from "../context/useAuth";
import sessionService from "../srevices/sessionService";
import "../styles/monitor.css";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function LiveMonitor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sessionRef = useRef(null);
  const postureTrackingRef = useRef({ lastPosture: "WAITING", lastTimestamp: null });

  const [cameraActive, setCameraActive] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("idle");
  const [monitoring, setMonitoring] = useState(false);
  const [postureResult, setPostureResult] = useState({
    posture: "WAITING",
    confidence: 0,
    message: "Start your camera to load on-device posture detection.",
  });
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [goodPostureSeconds, setGoodPostureSeconds] = useState(0);
  const [poorPostureSeconds, setPoorPostureSeconds] = useState(0);
  const [saveError, setSaveError] = useState("");

  // Accumulate milliseconds between actual detection updates. Accumulating whole
  // seconds per frame loses time because frames arrive more frequently than once per second.
  const accruePostureTime = useCallback((now) => {
    const session = sessionRef.current;
    const tracking = postureTrackingRef.current;
    if (!session || tracking.lastTimestamp === null) {
      tracking.lastTimestamp = now;
      return;
    }

    // Cap gaps to avoid counting a stale prediction if the browser tab pauses.
    const elapsedMs = Math.max(0, Math.min(now - tracking.lastTimestamp, 1200));
    if (tracking.lastPosture === "GOOD") session.goodPostureMilliseconds += elapsedMs;
    if (tracking.lastPosture === "POOR") session.poorPostureMilliseconds += elapsedMs;
    tracking.lastTimestamp = now;
  }, []);

  const handlePostureUpdate = useCallback((result) => {
    setPostureResult(result);
    if (!sessionRef.current) return;

    const now = Date.now();
    accruePostureTime(now);
    postureTrackingRef.current.lastPosture =
      result.posture === "GOOD" || result.posture === "POOR" ? result.posture : "WAITING";
    postureTrackingRef.current.lastTimestamp = now;
  }, [accruePostureTime]);

  const stopMonitoring = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    accruePostureTime(endTime.getTime());

    const durationSeconds = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000));
    const goodSeconds = Math.min(Math.floor(session.goodPostureMilliseconds / 1000), durationSeconds);
    const poorSeconds = Math.min(Math.floor(session.poorPostureMilliseconds / 1000), durationSeconds);
    const classifiedPostureSeconds = goodSeconds + poorSeconds;
    const completedSession = {
      id: session.id,
      userId: user?.id ?? null,
      startTime: session.startTime,
      endTime: endTime.toISOString(),
      durationSeconds,
      goodPostureSeconds: goodSeconds,
      poorPostureSeconds: poorSeconds,
      classifiedPostureSeconds,
      postureScore: classifiedPostureSeconds > 0 ? Math.round((goodSeconds / classifiedPostureSeconds) * 100) : null,
    };

    try {
      if (durationSeconds > 0) sessionService.saveSession(completedSession);
      setSaveError("");
    } catch (saveException) {
      console.error("Failed to save session:", saveException);
      setSaveError("The session could not be saved in this browser. Check available storage and try again.");
    }

    sessionRef.current = null;
    postureTrackingRef.current = { lastPosture: "WAITING", lastTimestamp: null };
    setSessionSeconds(durationSeconds);
    setGoodPostureSeconds(goodSeconds);
    setPoorPostureSeconds(poorSeconds);
    setMonitoring(false);
  }, [accruePostureTime, user?.id]);

  const handleDetectionStatusChange = useCallback((status) => {
    setDetectionStatus(status);
  }, []);

  const handleCameraStatusChange = useCallback((status) => {
    setCameraActive(status);
    if (!status) {
      setDetectionStatus("idle");
      setPostureResult({
        posture: "WAITING",
        confidence: 0,
        message: "Start your camera to load on-device posture detection.",
      });
      if (sessionRef.current) stopMonitoring();
    }
  }, [stopMonitoring]);

  const handleMonitoring = () => {
    if (monitoring) {
      stopMonitoring();
      return;
    }
    if (!cameraActive) {
      setSaveError("Start your camera before starting a monitoring session.");
      return;
    }
    if (detectionStatus !== "ready") {
      setSaveError("Wait for the on-device posture model to finish loading before starting a session.");
      return;
    }
    setSaveError("");

    const now = new Date();
    sessionRef.current = {
      id: createSessionId(),
      startTime: now.toISOString(),
      goodPostureMilliseconds: 0,
      poorPostureMilliseconds: 0,
    };
    postureTrackingRef.current = {
      lastPosture: "WAITING",
      lastTimestamp: Date.now(),
    };
    setSessionSeconds(0);
    setGoodPostureSeconds(0);
    setPoorPostureSeconds(0);
    setMonitoring(true);
  };

  useEffect(() => {
    if (!monitoring) return undefined;

    const intervalId = window.setInterval(() => {
      const session = sessionRef.current;
      if (!session) return;

      const now = Date.now();
      const durationSeconds = Math.max(0, Math.floor((now - new Date(session.startTime).getTime()) / 1000));
      const tracking = postureTrackingRef.current;
      const elapsedMs = tracking.lastTimestamp === null
        ? 0
        : Math.max(0, Math.min(now - tracking.lastTimestamp, 1200));
      const goodMs = session.goodPostureMilliseconds + (tracking.lastPosture === "GOOD" ? elapsedMs : 0);
      const poorMs = session.poorPostureMilliseconds + (tracking.lastPosture === "POOR" ? elapsedMs : 0);

      setSessionSeconds(durationSeconds);
      setGoodPostureSeconds(Math.min(Math.floor(goodMs / 1000), durationSeconds));
      setPoorPostureSeconds(Math.min(Math.floor(poorMs / 1000), durationSeconds));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [monitoring]);

  const posture = postureResult?.posture || "WAITING";
  const confidence = postureResult?.confidence || 0;

  return (
    <div className="monitor-page">
      <section className="monitor-header">
        <div>
          <span className="eyebrow">ON-DEVICE ANALYSIS</span>
          <h1>Live Posture Monitor</h1>
          <p>Checks shoulder level, neck alignment, back lean, and seated-leg position. This is a posture-awareness aid, not a medical assessment.</p>
        </div>
        <button className="back-dashboard-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </section>

      {saveError && <div className="websocket-error" role="alert">⚠ {saveError}</div>}

      <div className="monitor-layout">
        <div>
          <WebcamCapture
            onCameraStatusChange={handleCameraStatusChange}
            onPostureUpdate={handlePostureUpdate}
            onDetectionStatusChange={handleDetectionStatusChange}
          />

          <div className="monitor-controls">
            <div className="monitoring-info">
              <span className={`monitoring-indicator ${monitoring ? "active" : ""}`} />
              <div>
                <strong>{monitoring ? "Monitoring Active" : "Ready to monitor"}</strong>
                <span>{cameraActive ? "Camera available · frames processed in browser" : "Camera required"}</span>
              </div>
            </div>
            <button
              className={`monitor-button ${monitoring ? "stop-monitoring" : "start-monitoring"}`}
              onClick={handleMonitoring}
              disabled={!monitoring && (!cameraActive || detectionStatus !== "ready")}
              title={!monitoring && detectionStatus !== "ready" ? "Start the camera and wait for the pose model to load" : undefined}
            >
              {monitoring ? "Stop & Save Session" : "Start Monitoring"}
            </button>
          </div>
        </div>

        <aside className="monitor-results">
          <div className="results-header">
            <div>
              <span className="panel-kicker">LIVE POSTURE CHECK</span>
              <h2>Shoulders, Neck &amp; Back</h2>
            </div>
            <span className={`ai-status ${cameraActive ? "ai-active" : "ai-inactive"}`}>
              {cameraActive ? "Camera ready" : "Waiting"}
            </span>
          </div>

          <PostureStatus
            posture={posture}
            isMonitoring={monitoring}
            message={monitoring ? postureResult?.message : ""}
          />
          <ConfidenceScore confidence={confidence} />

          {postureResult?.metrics && (
            <div className="alignment-metrics">
              <div><span>Shoulder tilt</span><strong>{postureResult.metrics.shoulderTiltDegrees === null ? "N/A" : `${postureResult.metrics.shoulderTiltDegrees}°`}</strong></div>
              <div><span>Neck forward offset</span><strong>{postureResult.metrics.neckForwardRatio}</strong></div>
              <div><span>Back lean</span><strong>{postureResult.metrics.backLeanDegrees}°</strong></div>
              <div><span>Hip angle</span><strong>{postureResult.metrics.hipAngleDegrees === null ? "N/A" : `${postureResult.metrics.hipAngleDegrees}°`}</strong></div>
            </div>
          )}

          <div className="posture-tips">
            <h3>What is checked</h3>
              <ul>
                <li>Shoulder level and neck-to-shoulder alignment.</li>

                <li>Back inclination and hip angle for sitting-posture assessment.</li>

                <li>Keep both shoulders, neck, back, hips, and at least one knee visible.</li>

                <li>Feet do not need to be visible. Avoid strong backlighting.</li>
              </ul>
          </div>
        </aside>
      </div>

      <section className="monitor-info-card">
        <div className="info-item">
          <span className="info-icon">◷</span>
          <div><span>Session Time</span><strong>{formatTime(sessionSeconds)}</strong></div>
        </div>
        <div className="info-item">
          <span className="info-icon">✓</span>
          <div><span>Good Alignment</span><strong>{formatTime(goodPostureSeconds)}</strong></div>
        </div>
        <div className="info-item">
          <span className="info-icon">!</span>
          <div><span>Poor Alignment</span><strong>{formatTime(poorPostureSeconds)}</strong></div>
        </div>
        <div className="info-item">
          <span className="info-icon">●</span>
          <div><span>Detection</span><strong>{cameraActive ? "Available" : "Waiting"}</strong></div>
        </div>
      </section>
    </div>
  );
}

export default LiveMonitor;

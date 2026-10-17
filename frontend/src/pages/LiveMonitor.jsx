import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import WebcamCapture from "../components/posture/WebcamCapture";
import PostureStatus from "../components/posture/PostureStatus";
import ConfidenceScore from "../components/posture/ConfidenceScore";
import useWebSocket from "../hooks/useWebSocket";
import { useAuth } from "../context/AuthContext";
import sessionService from "../srevices/sessionService";

import "../styles/monitor.css";

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function LiveMonitor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sessionRef = useRef(null);
  const postureTrackingRef = useRef({ lastPosture: null, lastTimestamp: null });

  const [cameraActive, setCameraActive] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [goodPostureSeconds, setGoodPostureSeconds] = useState(0);
  const [poorPostureSeconds, setPoorPostureSeconds] = useState(0);
  const [saveError, setSaveError] = useState("");

  const {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    startSession,
    endSession,
  } = useWebSocket();

  const posture =
    lastMessage?.type === "POSTURE_RESULT" && lastMessage.posture
      ? String(lastMessage.posture).toUpperCase()
      : "WAITING";

  const confidence =
    lastMessage?.type === "POSTURE_RESULT" &&
    typeof lastMessage.confidence === "number"
      ? lastMessage.confidence
      : 0;

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (!monitoring || !sessionRef.current || lastMessage?.type !== "POSTURE_RESULT") {
      return;
    }

    const currentPosture = String(lastMessage.posture || "").toUpperCase();
    if (!currentPosture) return;

    const now = Date.now();
    const tracking = postureTrackingRef.current;

    if (tracking.lastPosture && tracking.lastTimestamp) {
      const elapsedSeconds = Math.max(0, Math.floor((now - tracking.lastTimestamp) / 1000));

      if (tracking.lastPosture === "GOOD") {
        sessionRef.current.goodPostureSeconds += elapsedSeconds;
      } else if (["POOR", "BAD", "AVERAGE"].includes(tracking.lastPosture)) {
        sessionRef.current.poorPostureSeconds += elapsedSeconds;
      }
    }

    tracking.lastPosture = currentPosture;
    tracking.lastTimestamp = now;
  }, [lastMessage, monitoring]);

  useEffect(() => {
    if (!monitoring) return undefined;

    const interval = setInterval(() => {
      const session = sessionRef.current;
      if (!session) return;

      const now = Date.now();
      const totalSeconds = Math.max(0, Math.floor((now - new Date(session.startTime).getTime()) / 1000));
      let goodSeconds = session.goodPostureSeconds;
      let poorSeconds = session.poorPostureSeconds;

      const tracking = postureTrackingRef.current;
      if (tracking.lastPosture && tracking.lastTimestamp) {
        const currentElapsed = Math.max(0, Math.floor((now - tracking.lastTimestamp) / 1000));
        if (tracking.lastPosture === "GOOD") goodSeconds += currentElapsed;
        if (["POOR", "BAD", "AVERAGE"].includes(tracking.lastPosture)) poorSeconds += currentElapsed;
      }

      setSessionSeconds(totalSeconds);
      setGoodPostureSeconds(goodSeconds);
      setPoorPostureSeconds(poorSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [monitoring]);

  const stopMonitoring = () => {
    const session = sessionRef.current;
    if (!session) return;

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const tracking = postureTrackingRef.current;

    if (tracking.lastPosture && tracking.lastTimestamp) {
      const finalElapsed = Math.max(0, Math.floor((endTime.getTime() - tracking.lastTimestamp) / 1000));
      if (tracking.lastPosture === "GOOD") session.goodPostureSeconds += finalElapsed;
      if (["POOR", "BAD", "AVERAGE"].includes(tracking.lastPosture)) session.poorPostureSeconds += finalElapsed;
    }

    const durationSeconds = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000));

    const completedSession = {
      id: session.id,
      userId: user?.id || null,
      startTime: session.startTime,
      endTime: endTime.toISOString(),
      durationSeconds,
      goodPostureSeconds: Math.min(session.goodPostureSeconds, durationSeconds),
      poorPostureSeconds: Math.min(session.poorPostureSeconds, durationSeconds),
    };

    try {
      sessionService.saveSession(completedSession);
      setSaveError("");
    } catch (saveException) {
      console.error("Failed to save session:", saveException);
      setSaveError("The session could not be saved locally.");
    }

    endSession(session.id);
    sessionRef.current = null;
    postureTrackingRef.current = { lastPosture: null, lastTimestamp: null };
    setSessionSeconds(0);
    setGoodPostureSeconds(0);
    setPoorPostureSeconds(0);
    setMonitoring(false);
  };

  const handleCameraStatusChange = (status) => {
    setCameraActive(status);
    if (!status && sessionRef.current) stopMonitoring();
  };

  const handleMonitoring = () => {
    if (!cameraActive) {
      setSaveError("Start your camera before starting a monitoring session.");
      return;
    }

    if (!isConnected) {
      setSaveError("AI server is not connected. Start your Spring Boot backend first.");
      return;
    }

    setSaveError("");

    if (monitoring) {
      stopMonitoring();
      return;
    }

    const sessionId = crypto.randomUUID();
    sessionRef.current = {
      id: sessionId,
      startTime: new Date().toISOString(),
      goodPostureSeconds: 0,
      poorPostureSeconds: 0,
    };

    postureTrackingRef.current = { lastPosture: null, lastTimestamp: null };
    setSessionSeconds(0);
    setGoodPostureSeconds(0);
    setPoorPostureSeconds(0);
    startSession(sessionId);
    setMonitoring(true);
  };

  return (
    <div className="monitor-page">
      <section className="monitor-header">
        <div>
          <span className="eyebrow">REAL-TIME ANALYSIS</span>
          <h1>Live Posture Monitor</h1>
          <p>Use your camera to receive real-time posture feedback from the AI service.</p>
        </div>
        <button className="back-dashboard-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </section>

      <section className={`connection-status-card ${isConnected ? "connection-online" : "connection-offline"}`}>
        <div className="connection-status-left">
          <span className={`connection-dot ${isConnected ? "connected" : "disconnected"}`} />
          <div>
            <strong>{isConnected ? "AI Server Connected" : "AI Server Offline"}</strong>
            <p>{isConnected ? "The posture service is ready to receive results." : "Start Spring Boot and reconnect to enable AI analysis."}</p>
          </div>
        </div>
        {!isConnected && <button className="reconnect-button" onClick={connect}>Reconnect</button>}
      </section>

      {(error || saveError) && (
        <div className="websocket-error" role="alert">
          ⚠ {error || saveError}
        </div>
      )}

      <div className="monitor-layout">
        <div>
          <WebcamCapture onCameraStatusChange={handleCameraStatusChange} />

          <div className="monitor-controls">
            <div className="monitoring-info">
              <span className={`monitoring-indicator ${monitoring ? "active" : ""}`} />
              <div>
                <strong>{monitoring ? "Monitoring Active" : "Ready to monitor"}</strong>
                <span>{cameraActive ? "Camera available" : "Camera required"}</span>
              </div>
            </div>
            <button
              className={`monitor-button ${monitoring ? "stop-monitoring" : "start-monitoring"}`}
              onClick={handleMonitoring}
            >
              {monitoring ? "Stop Monitoring" : "Start Monitoring"}
            </button>
          </div>
        </div>

        <aside className="monitor-results">
          <div className="results-header">
            <div>
              <span className="panel-kicker">AI ENGINE</span>
              <h2>Posture Analysis</h2>
            </div>
            <span className={`ai-status ${isConnected ? "ai-active" : "ai-inactive"}`}>
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>

          <PostureStatus posture={posture} isMonitoring={monitoring} />
          <ConfidenceScore confidence={confidence} />

          <div className="posture-tips">
            <h3>Healthy posture checklist</h3>
            <ul>
              <li>Keep your back comfortably straight.</li>
              <li>Relax your shoulders instead of raising them.</li>
              <li>Keep both feet supported on the floor.</li>
              <li>Keep your monitor close to eye level.</li>
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
          <div><span>Good Posture</span><strong>{formatTime(goodPostureSeconds)}</strong></div>
        </div>
        <div className="info-item">
          <span className="info-icon">!</span>
          <div><span>Poor Posture</span><strong>{formatTime(poorPostureSeconds)}</strong></div>
        </div>
        <div className="info-item">
          <span className="info-icon">●</span>
          <div><span>Detection</span><strong>{monitoring ? "Running" : "Waiting"}</strong></div>
        </div>
      </section>
    </div>
  );
}

export default LiveMonitor;

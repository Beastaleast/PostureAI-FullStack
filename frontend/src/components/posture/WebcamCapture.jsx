import { useEffect } from "react";
import useWebcam from "../../hooks/useWebcam";
import "../../styles/monitor.css";

function WebcamCapture({ onCameraStatusChange }) {
  const {
    videoRef,
    isCameraActive,
    cameraError,
    startCamera,
    stopCamera,
  } = useWebcam();

  useEffect(() => {
    if (onCameraStatusChange) {
      onCameraStatusChange(isCameraActive);
    }
  }, [isCameraActive, onCameraStatusChange]);

  return (
    <div className="webcam-container">

      <div className="webcam-header">
        <div>
          <h2>Live Camera</h2>

          <p>
            Position yourself clearly in front of the camera.
          </p>
        </div>

        {isCameraActive && (
          <div className="camera-status">
            <span className="status-dot"></span>
            Camera Active
          </div>
        )}
      </div>

      <div className="webcam-view">

        {!isCameraActive && (
          <div className="camera-placeholder">

            <div className="camera-icon">
              📹
            </div>

            <h3>Camera is not started</h3>

            <p>
              Start your camera to begin posture monitoring.
            </p>

            <button
              className="camera-button"
              onClick={startCamera}
            >
              Start Camera
            </button>

          </div>
        )}

        <video
          ref={videoRef}
          className={`webcam-video ${
            isCameraActive ? "visible" : ""
          }`}
          autoPlay
          playsInline
          muted
        />

      </div>

      {cameraError && (
        <div className="camera-error">
          ⚠️ {cameraError}
        </div>
      )}

      {isCameraActive && (
        <button
          className="stop-camera-button"
          onClick={stopCamera}
        >
          Stop Camera
        </button>
      )}

    </div>
  );
}

export default WebcamCapture;
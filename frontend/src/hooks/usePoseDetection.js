import { useEffect, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

const MEDIAPIPE_VERSION = "1.1.1";
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// Show only landmarks used for shoulder, neck, back, and seated-leg alignment.
const POSE_CONNECTIONS = [
  [7, 11], [8, 12], [11, 12], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];
const RELEVANT_LANDMARK_INDICES = [7, 8, 11, 12, 23, 24, 25, 26, 27, 28];

function visibilityOf(point) {
  const value = Number(point?.visibility ?? point?.presence ?? 0);
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function jointAngle(a, vertex, c) {
  const ax = a.x - vertex.x;
  const ay = a.y - vertex.y;
  const cx = c.x - vertex.x;
  const cy = c.y - vertex.y;
  const denominator = Math.hypot(ax, ay) * Math.hypot(cx, cy);
  if (!denominator) return null;
  const cosine = Math.max(-1, Math.min(1, (ax * cx + ay * cy) / denominator));
  return (Math.acos(cosine) * 180) / Math.PI;
}

function visibleSide(landmarks) {
  const sides = [
    { name: "left", ear: landmarks[7], shoulder: landmarks[11], hip: landmarks[23], knee: landmarks[25], ankle: landmarks[27] },
    { name: "right", ear: landmarks[8], shoulder: landmarks[12], hip: landmarks[24], knee: landmarks[26], ankle: landmarks[28] },
  ];
  return sides
    .map((side) => ({
      ...side,
      visibility: [side.ear, side.shoulder, side.hip, side.knee, side.ankle]
        .reduce((total, point) => total + visibilityOf(point), 0) / 5,
    }))
    .sort((a, b) => b.visibility - a.visibility)[0];
}

function waitingResult(message, landmarks = [], confidence = 0) {
  return { posture: "WAITING", confidence, message, landmarks };
}

/**
 * A small screen-space posture-awareness heuristic, not a medical assessment.
 * It deliberately does not calculate face orientation or facial angles. It uses
 * ear-to-shoulder displacement only as a rough neck-forward proxy.
 */
function classifyPose(landmarks, recentLabels) {
  if (!landmarks || landmarks.length < 29) {
    recentLabels.length = 0;
    return waitingResult("Move into view so your shoulders, neck, back, hips, knees, and ankles can be seen.", landmarks || []);
  }

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const shouldersVisible = visibilityOf(leftShoulder) >= 0.35 && visibilityOf(rightShoulder) >= 0.35;
  const hipsVisible = visibilityOf(leftHip) >= 0.3 && visibilityOf(rightHip) >= 0.3;

  if (!shouldersVisible || !hipsVisible) {
    recentLabels.length = 0;
    const visible = [leftShoulder, rightShoulder, leftHip, rightHip]
      .reduce((total, point) => total + visibilityOf(point), 0) / 4;
    return waitingResult("Adjust the camera so both shoulders and both hips are visible.", landmarks, visible);
  }

  const side = visibleSide(landmarks);
  if (
    visibilityOf(side.ear) < 0.32 ||
    visibilityOf(side.shoulder) < 0.35 ||
    visibilityOf(side.hip) < 0.3 ||
    visibilityOf(side.knee) < 0.28 ||
    visibilityOf(side.ankle) < 0.25
  ) {
    recentLabels.length = 0;
    return waitingResult("Move the camera back to include your neck area, back, hips, knees, and feet.", landmarks, side.visibility);
  }

  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);
  const torsoHeight = Math.hypot(hipCenter.x - shoulderCenter.x, hipCenter.y - shoulderCenter.y);
  if (torsoHeight < 0.08) {
    recentLabels.length = 0;
    return waitingResult("Sit far enough from the camera for your shoulders and hips to be distinct.", landmarks, side.visibility);
  }

  // Shoulder level: compare vertical difference against shoulder span.
  const shoulderSpan = Math.abs(rightShoulder.x - leftShoulder.x);
  if (shoulderSpan < 0.035) {
    recentLabels.length = 0;
    return waitingResult("Turn your upper body slightly toward the camera so both shoulders are distinguishable.", landmarks, side.visibility);
  }
  const shoulderTiltDegrees = Math.atan2(
    Math.abs(rightShoulder.y - leftShoulder.y),
    shoulderSpan,
  ) * (180 / Math.PI);

  // Back lean: angle of the shoulder-to-hip line relative to vertical.
  const backLeanDegrees = Math.abs(
    Math.atan2(hipCenter.x - shoulderCenter.x, Math.abs(hipCenter.y - shoulderCenter.y)) * (180 / Math.PI),
  );

  // Neck-forward proxy uses only horizontal ear/shoulder displacement, not a face angle.
  const neckForwardRatio = Math.abs(side.ear.x - side.shoulder.x) / torsoHeight;
  const hipAngleDegrees = jointAngle(side.shoulder, side.hip, side.knee);
  const kneeAngleDegrees = jointAngle(side.hip, side.knee, side.ankle);
  const hipIsSeated = hipAngleDegrees !== null && hipAngleDegrees >= 55 && hipAngleDegrees <= 135;
  const kneeIsSeated = kneeAngleDegrees !== null && kneeAngleDegrees >= 65 && kneeAngleDegrees <= 135;
  const sittingDetected = hipIsSeated && kneeIsSeated;

  const issues = [];
  if (shoulderTiltDegrees !== null && shoulderTiltDegrees > 12) issues.push("level your shoulders");
  if (neckForwardRatio > 0.28) issues.push("bring your neck into line with your shoulders");
  if (backLeanDegrees > 20) issues.push("keep your back more upright");
  if (!sittingDetected) issues.push("keep your hips and knees comfortably bent with feet supported");

  const candidate = issues.length ? "POOR" : "GOOD";
  recentLabels.push(candidate);
  if (recentLabels.length > 5) recentLabels.shift();
  const poorVotes = recentLabels.filter((label) => label === "POOR").length;
  const posture = poorVotes > recentLabels.length / 2 ? "POOR" : "GOOD";

  const confidence = [
    visibilityOf(leftShoulder), visibilityOf(rightShoulder),
    visibilityOf(leftHip), visibilityOf(rightHip), visibilityOf(side.ear),
    visibilityOf(side.knee), visibilityOf(side.ankle),
  ].reduce((total, value) => total + value, 0) / 7;

  return {
    posture,
    confidence,
    message: posture === "GOOD"
      ? "Your visible shoulder, neck, back, and seated-leg alignment looks steady."
      : `Posture needs adjustment: ${issues.length ? issues.join(", ") : "hold a balanced seated position"}.`,
    metrics: {
      shoulderTiltDegrees: shoulderTiltDegrees === null ? null : Math.round(shoulderTiltDegrees * 10) / 10,
      neckForwardRatio: Math.round(neckForwardRatio * 100) / 100,
      backLeanDegrees: Math.round(backLeanDegrees * 10) / 10,
      hipAngleDegrees: hipAngleDegrees === null ? null : Math.round(hipAngleDegrees * 10) / 10,
      kneeAngleDegrees: kneeAngleDegrees === null ? null : Math.round(kneeAngleDegrees * 10) / 10,
      sittingDetected,
    },
    landmarks,
  };
}

export default function usePoseDetection(videoRef, enabled) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    let animationFrameId = null;
    let landmarker = null;
    let lastVideoTime = -1;
    let lastInferenceAt = 0;
    const recentLabels = [];

    const runDetection = () => {
      if (cancelled) return;
      animationFrameId = requestAnimationFrame(runDetection);

      const video = videoRef.current;
      if (
        !landmarker || !video ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 || video.currentTime === lastVideoTime
      ) return;

      const now = performance.now();
      if (now - lastInferenceAt < 120) return;
      lastInferenceAt = now;
      lastVideoTime = video.currentTime;

      try {
        const detection = landmarker.detectForVideo(video, now);
        const landmarks = detection.landmarks?.[0] || [];
        setResult(classifyPose(landmarks, recentLabels));
      } catch (detectionError) {
        console.error("Pose detection frame failed:", detectionError);
        setResult(waitingResult("Pose detection had a problem. Keep your upper body and legs visible."));
      }
    };

    async function initializeDetector() {
      setStatus("loading");
      setError("");
      setResult(waitingResult("Loading the on-device pose model…"));

      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const createdLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.55,
          minPosePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
        if (cancelled) {
          createdLandmarker.close();
          return;
        }
        landmarker = createdLandmarker;
        setStatus("ready");
        runDetection();
      } catch (initializationError) {
        console.error("Unable to load the pose model:", initializationError);
        if (cancelled) return;
        setStatus("error");
        setError("The posture model could not load. Check your internet connection and refresh the page to retry.");
        setResult(waitingResult("Posture detection is unavailable until the model loads."));
      }
    }

    initializeDetector();
    return () => {
      cancelled = true;
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (landmarker) landmarker.close();
    };
  }, [enabled, videoRef]);

  return { status, error, result, poseConnections: POSE_CONNECTIONS, relevantLandmarkIndices: RELEVANT_LANDMARK_INDICES };
}

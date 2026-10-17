import { useCallback, useEffect, useRef, useState } from "react";

function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch (error) {
      console.error("Webcam error:", error);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError(
          "No camera was found on this device."
        );
      } else if (error.name === "NotReadableError") {
        setCameraError(
          "The camera is already being used by another application."
        );
      } else {
        setCameraError(
          error.message || "Unable to access the camera."
        );
      }

      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;

    if (!video || !isCameraActive) {
      return null;
    }

    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return null;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas;
  }, [isCameraActive]);

  const captureFrameAsBase64 = useCallback(() => {
    const canvas = captureFrame();

    if (!canvas) {
      return null;
    }

    return canvas.toDataURL("image/jpeg", 0.8);
  }, [captureFrame]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return {
    videoRef,
    isCameraActive,
    cameraError,
    startCamera,
    stopCamera,
    captureFrame,
    captureFrameAsBase64,
  };
}

export default useWebcam;
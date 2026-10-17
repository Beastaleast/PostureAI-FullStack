import { useCallback, useEffect, useRef, useState } from "react";

function useWebSocket() {
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState("");

  const connect = useCallback(() => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      return;
    }

    const socketUrl =
      import.meta.env.VITE_WEBSOCKET_URL ||
      "ws://localhost:8080/ws/posture";

    try {
      const socket = new WebSocket(socketUrl);

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");

        setIsConnected(true);
        setError("");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          setLastMessage(data);
        } catch (err) {
          console.error(
            "Invalid WebSocket message:",
            err
          );
        }
      };

      socket.onerror = (event) => {
        console.error(
          "WebSocket error:",
          event
        );

        setError(
          "Unable to connect to the posture server."
        );

        setIsConnected(false);
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");

        setIsConnected(false);
      };
    } catch (err) {
      console.error(
        "WebSocket connection failed:",
        err
      );

      setError(
        "Unable to establish WebSocket connection."
      );

      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    const socket = socketRef.current;

    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      console.warn(
        "WebSocket is not connected."
      );

      return false;
    }

    socket.send(JSON.stringify(message));

    return true;
  }, []);

  const sendFrame = useCallback(
    (image) => {
      return sendMessage({
        type: "POSTURE_FRAME",
        image,
      });
    },
    [sendMessage]
  );

  const startSession = useCallback(
    (sessionId) => {
      return sendMessage({
        type: "START_SESSION",
        sessionId,
      });
    },
    [sendMessage]
  );

  const endSession = useCallback(
    (sessionId) => {
      return sendMessage({
        type: "END_SESSION",
        sessionId,
      });
    },
    [sendMessage]
  );

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    sendFrame,
    startSession,
    endSession,
  };
}

export default useWebSocket;
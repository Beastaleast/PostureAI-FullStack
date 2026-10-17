let socket = null;

const socketService = {
  connect: (onMessage, onOpen, onError, onClose) => {
    const socketUrl =
      import.meta.env.VITE_WEBSOCKET_URL ||
      "ws://localhost:8080/ws/posture";

    socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");

      if (onOpen) {
        onOpen();
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error(
          "Invalid WebSocket message:",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);

      if (onError) {
        onError(error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");

      if (onClose) {
        onClose();
      }
    };
  },

  sendFrame: (image) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn(
        "WebSocket is not connected."
      );

      return false;
    }

    socket.send(
      JSON.stringify({
        type: "POSTURE_FRAME",
        image,
      })
    );

    return true;
  },

  sendStartSession: (sessionId) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "START_SESSION",
        sessionId,
      })
    );

    return true;
  },

  sendEndSession: (sessionId) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "END_SESSION",
        sessionId,
      })
    );

    return true;
  },

  disconnect: () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  },

  isConnected: () => {
    return (
      socket &&
      socket.readyState === WebSocket.OPEN
    );
  },
};

export default socketService;
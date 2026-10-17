import api from "./api";

const postureService = {
  analyzePosture: async (image) => {
    const response = await api.post(
      "/posture/analyze",
      {
        image,
      }
    );

    return response.data;
  },

  startSession: async () => {
    const response = await api.post(
      "/posture/sessions/start"
    );

    return response.data;
  },

  endSession: async (sessionId) => {
    const response = await api.post(
      `/posture/sessions/${sessionId}/end`
    );

    return response.data;
  },

  getHistory: async () => {
    const response = await api.get(
      "/posture/history"
    );

    return response.data;
  },
};

export default postureService;
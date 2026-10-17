const SESSION_STORAGE_KEY = "postureSessions";

function readSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "[]");
  } catch (error) {
    console.error("Failed to read posture sessions:", error);
    return [];
  }
}

const dashboardService = {
  getDashboardData(user) {
    const sessions = readSessions();

    const userSessions = user
      ? sessions.filter((session) => session.userId === user.id)
      : [];

    return {
      user,
      sessions: userSessions,
    };
  },
};

export default dashboardService;

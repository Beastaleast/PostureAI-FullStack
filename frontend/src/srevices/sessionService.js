const SESSION_STORAGE_KEY = "postureSessions";

const sessionService = {
  getSessions() {
    try {
      return JSON.parse(
        localStorage.getItem(SESSION_STORAGE_KEY) || "[]"
      );
    } catch (error) {
      console.error("Unable to read posture sessions:", error);
      return [];
    }
  },

  saveSession(session) {
    const sessions = this.getSessions();

    sessions.push(session);

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(sessions)
    );

    return session;
  },

  clearSessions() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },
};

export default sessionService;
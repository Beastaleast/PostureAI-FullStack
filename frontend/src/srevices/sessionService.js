const SESSION_STORAGE_KEY = "postureSessions";

const sessionService = {
  getSessions() {
    try {
      const value = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "[]");
      if (!Array.isArray(value)) return [];

      // Backfill duration for older localStorage records or records saved as 0m.
      return value.map((session) => {
        const start = new Date(session?.startTime ?? session?.startedAt ?? session?.date ?? NaN).getTime();
        const end = new Date(session?.endTime ?? session?.endedAt ?? NaN).getTime();
        const hasTimeRange = Number.isFinite(start) && Number.isFinite(end) && end >= start;
        const derivedDuration = hasTimeRange ? Math.floor((end - start) / 1000) : 0;
        const savedDuration = Number(session?.durationSeconds);
        const hasSavedDuration = session?.durationSeconds !== null && session?.durationSeconds !== "" && Number.isFinite(savedDuration);

        if (hasSavedDuration && savedDuration > 0) {
          return { ...session, durationSeconds: Math.floor(savedDuration) };
        }

        const explicitDuration = Number(session?.duration);
        if (session?.duration !== undefined && session?.duration !== null && Number.isFinite(explicitDuration) && explicitDuration > 0) {
          return { ...session, durationSeconds: Math.floor(explicitDuration) };
        }

        // If a stale record says 0 seconds but has a valid start/end range, prefer the actual range.
        return { ...session, durationSeconds: derivedDuration || (hasSavedDuration ? Math.max(0, Math.floor(savedDuration)) : 0) };
      });
    } catch (error) {
      console.error("Unable to read posture sessions:", error);
      return [];
    }
  },

  saveSession(session) {
    if (!session?.id) {
      throw new Error("A session ID is required before saving a session.");
    }

    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex((item) => item.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    return session;
  },

  getSessionsForUser(userId) {
    return this.getSessions().filter((session) => String(session.userId) === String(userId));
  },

  deleteSession(sessionId, userId) {
    if (sessionId === undefined || sessionId === null) {
      throw new Error("A session ID is required to delete a session.");
    }

    let storedSessions;
    try {
      storedSessions = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "[]");
    } catch (error) {
      console.error("Unable to read posture sessions before deletion:", error);
      throw new Error("Saved sessions could not be read. Please try again.", { cause: error });
    }

    if (!Array.isArray(storedSessions)) {
      throw new Error("Saved session data is invalid.");
    }

    const target = storedSessions.find((session) =>
      String(session?.id) === String(sessionId) &&
      (userId === undefined || String(session?.userId) === String(userId))
    );

    if (!target) {
      return false;
    }

    const remainingSessions = storedSessions.filter((session) =>
      !(String(session?.id) === String(sessionId) &&
        (userId === undefined || String(session?.userId) === String(userId)))
    );

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(remainingSessions));
    return true;
  },

  clearSessions() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },
};

export default sessionService;

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

  deleteSession(sessionId) {
    const sessions = this.getSessions();
    const nextSessions = sessions.filter((session) => String(session.id) !== String(sessionId));
    if (nextSessions.length === sessions.length) return false;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSessions));
    window.dispatchEvent(new CustomEvent("posture-sessions-updated"));
    return true;
  },

  clearSessions() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("posture-sessions-updated"));
  },
};

export default sessionService;

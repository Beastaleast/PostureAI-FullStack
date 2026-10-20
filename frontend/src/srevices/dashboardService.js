import sessionService from "./sessionService";

const dashboardService = {
  getDashboardData(user) {
    const sessions = sessionService.getSessions();
    const userSessions = user
      ? sessions.filter((session) => String(session.userId) === String(user.id))
      : [];

    return { user, sessions: userSessions };
  },
};

export default dashboardService;

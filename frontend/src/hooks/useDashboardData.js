import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import dashboardService from "../srevices/dashboardService";

function useDashboardData() {
  const { user } = useAuth();
  const [, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    window.addEventListener("posture-sessions-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("posture-sessions-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  // Recompute the small localStorage-backed summary whenever the hook renders.
  // The refresh state setter above intentionally triggers that render after session changes.
  const data = dashboardService.getDashboardData(user);

  const sessions = [...(data.sessions || [])].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  );

  const totals = sessions.reduce(
    (accumulator, session) => {
      const duration = Number(session.durationSeconds) || 0;
      const good = Number(session.goodPostureSeconds) || 0;
      const poor = Number(session.poorPostureSeconds) || 0;

      accumulator.total += duration;
      accumulator.good += good;
      accumulator.poor += poor;
      return accumulator;
    },
    { total: 0, good: 0, poor: 0 }
  );

  const classifiedSeconds = totals.good + totals.poor;
  const postureScore =
    classifiedSeconds > 0 ? Math.round((totals.good / classifiedSeconds) * 100) : null;

  const recentTrend = sessions.slice(0, 7).reverse().map((session) => {
    const duration = Number(session.durationSeconds) || 0;
    const good = Number(session.goodPostureSeconds) || 0;
    const score = duration > 0 ? Math.round((good / duration) * 100) : 0;

    return {
      id: session.id,
      label: new Date(session.startTime).toLocaleDateString(undefined, {
        weekday: "short",
      }),
      score,
    };
  });

  return {
    user: data.user,
    sessions,
    totalMonitoringSeconds: totals.total,
    goodPostureSeconds: totals.good,
    poorPostureSeconds: totals.poor,
    classifiedSeconds,
    postureScore,
    recentTrend,
    refresh,
  };
}

export default useDashboardData;

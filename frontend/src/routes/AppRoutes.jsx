import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import LiveMonitor from "../pages/LiveMonitor";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Profile from "../pages/Profile";
import History from "../pages/History";

const pageTitles = {
  "/": "Sign In", "/login": "Sign In", "/register": "Create Account",
  "/dashboard": "Dashboard", "/live-monitor": "Live Monitor",
  "/profile": "My Profile", "/history": "Session History",
};

function RouteFeedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.successMessage;

  useEffect(() => {
    const title = pageTitles[location.pathname] || "Page Not Found";
    document.title = `${title} | PostureAI`;
  }, [location.pathname]);

  useEffect(() => {
    if (!message) return undefined;

    const timeout = window.setTimeout(() => {
      // Clear the one-time success message without maintaining duplicate React state.
      navigate(location.pathname, { replace: true, state: null });
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [location.key, location.pathname, message, navigate]);

  return message ? <div className="app-toast" role="status" aria-live="polite"><span aria-hidden="true">✓</span>{message}</div> : null;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return visible ? <button className="back-to-top" type="button" aria-label="Back to top" title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button> : null;
}

function NotFound() {
  return <main className="not-found-page"><div className="not-found-card"><span className="not-found-code">404</span><h1>Page not found</h1><p>This page may have moved, or the address may be incorrect.</p><a className="not-found-home" href="/login">Back to PostureAI</a></div></main>;
}

function AppRoutes() {
  return <>
    <RouteFeedback />
    <BackToTop />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-monitor" element={<LiveMonitor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>;
}
export default AppRoutes;

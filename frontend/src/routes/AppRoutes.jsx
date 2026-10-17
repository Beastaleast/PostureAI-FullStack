import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import LiveMonitor from "../pages/LiveMonitor";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Profile from "../pages/Profile";
import History from "../pages/History";

function AppRoutes() {
  return (
    <Routes>



      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />




      <Route element={<ProtectedRoute />}>

        <Route element={<MainLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/live-monitor"
            element={<LiveMonitor />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/history"
            element={<History />}
          />

        </Route>

      </Route>




      <Route
        path="/"
        element={<Login />}
      />

    </Routes>
  );
}

export default AppRoutes;
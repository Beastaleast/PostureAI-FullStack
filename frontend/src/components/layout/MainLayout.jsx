import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import "../../styles/layout.css";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };

  return (
    <div className="app-layout">

      <Navbar />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <main
        className={`main-content ${
          sidebarOpen
            ? "main-content-sidebar-open"
            : "main-content-sidebar-closed"
        }`}
      >
        <Outlet />
      </main>

    </div>
  );
}

export default MainLayout;
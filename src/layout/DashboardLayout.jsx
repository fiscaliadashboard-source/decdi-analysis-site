import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SidebarMenu from "../components/SidebarMenu";

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirige al login si no hay token
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Menú lateral */}
      <SidebarMenu />

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

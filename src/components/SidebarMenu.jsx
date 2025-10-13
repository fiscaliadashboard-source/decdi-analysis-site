import { Link, useNavigate } from "react-router-dom";
import { LogOut, BarChart2, User } from "lucide-react";

export default function SidebarMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-4 text-center border-b font-bold text-lg text-blue-700">
        DEC-DI Panel
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 p-2 rounded hover:bg-blue-100"
            >
              <BarChart2 size={18} /> <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-2 p-2 rounded hover:bg-blue-100"
            >
              <User size={18} /> <span>Perfil</span>
            </Link>
          </li>
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 p-3 border-t text-red-600 hover:bg-red-50"
      >
        <LogOut size={18} /> <span>Salir</span>
      </button>
    </aside>
  );
}

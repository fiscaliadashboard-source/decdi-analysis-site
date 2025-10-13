import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <aside className="w-64 bg-blue-700 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-blue-600">
        Panel DEC-DI
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/dashboard"
          className="block px-3 py-2 rounded hover:bg-blue-600 transition"
        >
          🏠 Dashboard
        </Link>
        <Link
          to="/profile"
          className="block px-3 py-2 rounded hover:bg-blue-600 transition"
        >
          👤 Perfil
        </Link>
      </nav>
      <button
        onClick={handleLogout}
        className="m-4 mt-auto bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white font-semibold transition"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}

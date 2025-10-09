import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VALID_USER, VALID_PASS } from "../config";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === VALID_USER && pass === VALID_PASS) {
      localStorage.setItem("auth", "true");
      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-80"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Iniciar Sesión
        </h1>
        <input
          type="text"
          placeholder="Usuario"
          className="w-full mb-3 p-2 border rounded"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-3 p-2 border rounded"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
import { useEffect, useState } from "react";
import { BACKEND_URL, API_KEY } from "../config";

export default function Dashboard() {
  const [data, setData] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/data/salida_analisis-boyaca.csv`, {
      headers: { "X-API-KEY": API_KEY },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.text();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard DECDI</h1>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <pre className="text-xs bg-gray-100 p-3 rounded">{data.slice(0, 500)}...</pre>
      )}
    </div>
  );
}
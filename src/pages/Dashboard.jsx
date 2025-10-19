import { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import Plotly from "plotly.js-dist";
import * as d3 from "d3";
import OverlayLoader from "../components/OverlayLoader";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [csvSeleccionado, setCsvSeleccionado] = useState("salida_analisis-boyaca.csv");
  const [filtroFenomeno, setFiltroFenomeno] = useState("Todos");
  const [filtroUmbral, setFiltroUmbral] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [resumenTexto, setResumenTexto] = useState("");

  const UMBRAL = 14235000;
  const BASE_URL = "https://decdi-backend-service.onrender.com/api/data/";

  const fenomenoMap = {
    A: "Sabotaje",
    B: "Inversión Simulada",
    C: "Suplantación Financiera",
    NA: "No Clasificado",
  };

  function parseNumber(valor) {
    if (!valor) return 0;
    return parseFloat(valor.toString().replace(/\./g, "").replace(/,/g, ".")) || 0;
  }

  async function cargarCSV(nombreArchivo) {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL + nombreArchivo);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const textoCSV = await res.text();
      const csv = d3.csvParse(textoCSV);

      const parsed = csv.map((d) => ({
        fenomeno: d.FENOMENO || "SIN_FENOMENO",
        fenomenoLetra: d.FENOMENO_LETRA || "NA",
        umbral: d.SUPERA_UMBRAL_SMLV ? d.SUPERA_UMBRAL_SMLV.toLowerCase() : "false",
        cuantia: parseNumber(d.CUANTIA_MAXIMA),
      }));

      setData(parsed);
    } catch (err) {
      console.error("❌ Error cargando CSV:", err);
      alert("No se pudo cargar el archivo: " + nombreArchivo);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarCSV(csvSeleccionado);
  }, [csvSeleccionado]);

  useEffect(() => {
    if (data.length > 0) actualizarGraficos();
  }, [data, filtroFenomeno, filtroUmbral]);

  function actualizarGraficos() {
    let filtrados = data.filter(
      (d) =>
        (filtroFenomeno === "Todos" || d.fenomeno === filtroFenomeno) &&
        (filtroUmbral === "Todos" || d.umbral === filtroUmbral)
    );

    const total = data.length;
    const totalFiltrados = filtrados.length;
    const porcentaje = ((totalFiltrados / total) * 100).toFixed(1);
    
    setResumenTexto(`Casos filtrados: ${totalFiltrados} (${porcentaje}%) de ${total}`);
    

    const conteoFenomeno = {};
    filtrados.forEach((d) => {
      const nombre = fenomenoMap[d.fenomenoLetra] || d.fenomenoLetra;
      conteoFenomeno[nombre] = (conteoFenomeno[nombre] || 0) + 1;
    });

    const conteoUmbral = {};
    filtrados.forEach((d) => {
      conteoUmbral[d.umbral] = (conteoUmbral[d.umbral] || 0) + 1;
    });

    const promedioFenomeno = {};
    filtrados.forEach((d) => {
      const nombre = fenomenoMap[d.fenomenoLetra] || d.fenomenoLetra;
      if (!promedioFenomeno[nombre]) promedioFenomeno[nombre] = { suma: 0, count: 0 };
      promedioFenomeno[nombre].suma += d.cuantia;
      promedioFenomeno[nombre].count += 1;
    });

    const x = Object.keys(promedioFenomeno);
    const yPromedio = x.map((k) => promedioFenomeno[k].suma / promedioFenomeno[k].count);

  Plotly.purge("graficoBarras");
  Plotly.purge("graficoAnillo");
  Plotly.purge("graficoPromedio");  
  
  const layoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)', // fondo transparente
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 60, r: 60, t: 60, b: 60 },
  };  

  Plotly.react("graficoBarras", [
    {
      x: Object.keys(conteoFenomeno),
      y: Object.values(conteoFenomeno),
      type: "bar",
      marker: { color: "#3498db" },
      text: Object.values(conteoFenomeno),
      textposition: "outside",
    },
  ], layoutBase, { title: "Casos por Fenómeno" });

  Plotly.react("graficoAnillo", [
    {
      labels: Object.keys(conteoUmbral),
      values: Object.values(conteoUmbral),
      type: "pie",
      hole: 0.5,
      marker: { colors: ["#2ecc71", "#e74c3c"] },
    },
  ],layoutBase, { title: "Distribución por SUPERA UMBRAL 10 SMLV" });

  Plotly.react("graficoPromedio", [
    {
      x: x,
      y: yPromedio,
      type: "bar",
      name: "Promedio de Cuantías",
      marker: { color: "#9b59b6" },
      text: yPromedio.map((v) => `$${v.toLocaleString("es-CO")}`),
      textposition: "outside",
    },
    {
      x: x,
      y: Array(x.length).fill(UMBRAL),
      type: "scatter",
      mode: "lines",
      name: "Umbral 10 SMLV ($14.235.000)",
      line: { color: "red", dash: "dash" },
    },
  ],layoutBase, {
    title: "Promedio de Cuantías por Fenómeno",
    yaxis: { title: "Cuantía Promedio ($)", rangemode: "tozero" },
  });

  }

  return (
    <Layout>
      <div className="relative">
        {/* Overlay de carga */}
        {loading && <OverlayLoader mensaje="Cargando datos..." />}

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📊 Dashboard de Casos
          </h2>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <select
              value={csvSeleccionado}
              onChange={(e) => setCsvSeleccionado(e.target.value)}
              className="border rounded-md p-2 bg-white shadow-sm"
            >
              <option value="salida_analisis-boyaca.csv">Boyacá</option>
              <option value="salida_analisis-tolima.csv">Tolima</option>
              <option value="salida_analisis-putumayo.csv">Putumayo</option>
              <option value="salida_analisis-medellin.csv">Medellín</option>
              <option value="salida_analisis-huila.csv">Huila</option>
              <option value="salida_analisis-magdalena-medio.csv">Magdalena-Medio</option>
              <option value="salida_analisis-nariño.csv">Nariño</option>
              <option value="salida_analisis-valledupar.csv">Valledupar</option>
              <option value="salida_analisis-cauca.csv">Cauca</option>
              <option value="salida_analisis-magdalena.csv">Magdalena</option>
            </select>

            <select
              value={filtroFenomeno}
              onChange={(e) => setFiltroFenomeno(e.target.value)}
              className="border rounded-md p-2 bg-white shadow-sm"
            >
              <option value="Todos">Todos los fenómenos</option>
              {Array.from(new Set(data.map((d) => d.fenomeno))).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <select
              value={filtroUmbral}
              onChange={(e) => setFiltroUmbral(e.target.value)}
              className="border rounded-md p-2 bg-white shadow-sm"
            >
              <option value="Todos">Todos los umbrales</option>
              <option value="true">SI</option>
              <option value="false">NO</option>
            </select>
          </div>

          <div className="text-center mb-4 font-semibold text-gray-700">
            {resumenTexto}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div id="graficoBarras" className="bg-white rounded-2xl shadow-md p-4 h-[420px] overflow-hidden border border-gray-200"></div>
            <div id="graficoAnillo" className="bg-white rounded-2xl shadow-md p-4 h-[420px] overflow-hidden border border-gray-200"></div>
            <div id="graficoPromedio" className="bg-white rounded-2xl shadow-md p-4 h-[460px] lg:col-span-2 overflow-hidden border border-gray-200"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

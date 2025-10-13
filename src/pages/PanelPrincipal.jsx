import { useEffect } from "react";

export default function PanelPrincipal() {
  useEffect(() => {
    // Cargar Plotly y D3 si no existen
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });

    async function init() {
      await loadScript("https://cdn.plot.ly/plotly-latest.min.js");
      await loadScript("https://d3js.org/d3.v5.min.js");

      // Código JS original del dashboard
      const UMBRAL = 14235000;
      const BASE_URL = "https://decdi-backend-service.onrender.com/api/data/";
      const fenomenoMap = {
        A: "Sabotaje",
        B: "Inversión Simulada",
        C: "Suplantación Financiera",
        NA: "No Clasificado",
      };

      let data = [];

      function parseNumber(valor) {
        if (!valor) return 0;
        return (
          parseFloat(valor.toString().replace(/\./g, "").replace(/,/g, ".")) || 0
        );
      }

      async function cargarCSV(nombreArchivo) {
        const url = BASE_URL + nombreArchivo;
        try {
          const respuesta = await fetch(url);
          if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
          const textoCSV = await respuesta.text();
          const csv = window.d3.csvParse(textoCSV);
          data = csv.map((d) => ({
            fenomeno: d.FENOMENO || "SIN_FENOMENO",
            fenomenoLetra: d.FENOMENO_LETRA || "NA",
            umbral: d.SUPERA_UMBRAL_SMLV
              ? d.SUPERA_UMBRAL_SMLV.toLowerCase()
              : "false",
            cuantia: parseNumber(d.CUANTIA_MAXIMA),
          }));
          const selectFenomeno = document.getElementById("filtroFenomeno");
          selectFenomeno.innerHTML = '<option value="Todos">Todos</option>';
          const fenomenosUnicos = Array.from(
            new Set(data.map((d) => d.fenomeno))
          );
          fenomenosUnicos.forEach((f) => {
            const opt = document.createElement("option");
            opt.value = f;
            opt.textContent = f;
            selectFenomeno.appendChild(opt);
          });
          actualizarGraficos();
        } catch (err) {
          console.error("❌ Error cargando CSV:", err);
          alert("No se pudo cargar el archivo: " + nombreArchivo);
        }
      }

      function actualizarGraficos() {
        const filtroFenomeno = document.getElementById("filtroFenomeno").value;
        const filtroUmbral = document.getElementById("filtroUmbral").value;

        let filtrados = data.filter(
          (d) =>
            (filtroFenomeno === "Todos" || d.fenomeno === filtroFenomeno) &&
            (filtroUmbral === "Todos" || d.umbral === filtroUmbral)
        );

        const total = data.length;
        const totalFiltrados = filtrados.length;
        const porcentaje = ((totalFiltrados / total) * 100).toFixed(1);
        document.getElementById("resumen").innerText = `Casos filtrados: ${totalFiltrados} (${porcentaje}%) de ${total}`;

        const conteoFenomeno = {};
        filtrados.forEach((d) => {
          const nombre = fenomenoMap[d.fenomenoLetra] || d.fenomenoLetra;
          conteoFenomeno[nombre] = (conteoFenomeno[nombre] || 0) + 1;
        });

        const conteoUmbral = {};
        filtrados.forEach((d) => {
          conteoUmbral[d.umbral] = (conteoUmbral[d.umbral] || 0) + 1;
        });

        window.Plotly.newPlot("graficoBarras", [
          {
            x: Object.keys(conteoFenomeno),
            y: Object.values(conteoFenomeno),
            type: "bar",
            marker: { color: "#3498db" },
            text: Object.values(conteoFenomeno),
            textposition: "outside",
          },
        ]);

        window.Plotly.newPlot("graficoAnillo", [
          {
            labels: Object.keys(conteoUmbral),
            values: Object.values(conteoUmbral),
            type: "pie",
            hole: 0.5,
            marker: { colors: ["#2ecc71", "#e74c3c"] },
          },
        ]);

        const promedioFenomeno = {};
        filtrados.forEach((d) => {
          const nombre = fenomenoMap[d.fenomenoLetra] || d.fenomenoLetra;
          if (!promedioFenomeno[nombre])
            promedioFenomeno[nombre] = { suma: 0, count: 0 };
          promedioFenomeno[nombre].suma += d.cuantia;
          promedioFenomeno[nombre].count += 1;
        });

        const x = Object.keys(promedioFenomeno);
        const yPromedio = x.map(
          (k) => promedioFenomeno[k].suma / promedioFenomeno[k].count
        );

        window.Plotly.newPlot("graficoPromedio", [
          {
            x,
            y: yPromedio,
            type: "bar",
            name: "Promedio de Cuantías",
            marker: { color: "#9b59b6" },
            text: yPromedio.map((v) => `$${v.toLocaleString("es-CO")}`),
            textposition: "outside",
          },
          {
            x,
            y: Array(x.length).fill(UMBRAL),
            type: "scatter",
            mode: "lines",
            name: "Umbral 10 SMLV ($14.235.000)",
            line: { color: "red", dash: "dash" },
          },
        ]);
      }

      document
        .getElementById("filtroFenomeno")
        .addEventListener("change", actualizarGraficos);
      document
        .getElementById("filtroUmbral")
        .addEventListener("change", actualizarGraficos);
      document
        .getElementById("selectorCSV")
        .addEventListener("change", (e) => cargarCSV(e.target.value));

      cargarCSV(document.getElementById("selectorCSV").value);
    }

    init();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-4">📊 Dashboard de Casos</h2>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <label>
          Seleccionar CSV:
          <select id="selectorCSV" className="ml-2 p-1 border rounded">
            <option value="salida_analisis-boyaca.csv">Boyacá</option>
            <option value="salida_analisis-tolima.csv">Tolima</option>
            <option value="salida_analisis-putumayo.csv">Putumayo</option>
            <option value="salida_analisis-medellin.csv">Medellín</option>
          </select>
        </label>

        <label>
          Fenómeno:
          <select id="filtroFenomeno" className="ml-2 p-1 border rounded">
            <option value="Todos">Todos</option>
          </select>
        </label>

        <label>
          SUPERA UMBRAL:
          <select id="filtroUmbral" className="ml-2 p-1 border rounded">
            <option value="Todos">Todos</option>
            <option value="true">SI</option>
            <option value="false">NO</option>
          </select>
        </label>
      </div>

      <div id="resumen" className="text-center font-bold mb-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div id="graficoBarras" className="bg-white rounded-lg p-4 shadow"></div>
        <div id="graficoAnillo" className="bg-white rounded-lg p-4 shadow"></div>
        <div id="graficoPromedio" className="bg-white rounded-lg p-4 shadow md:col-span-2"></div>
      </div>
    </div>
  );
}

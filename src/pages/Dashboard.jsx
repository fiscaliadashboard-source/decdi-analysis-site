import Layout from "../layout/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">📊 Métrica 1</div>
        <div className="bg-white p-6 rounded-xl shadow">📈 Métrica 2</div>
        <div className="bg-white p-6 rounded-xl shadow">💼 Métrica 3</div>
      </div>
    </Layout>
  );
}

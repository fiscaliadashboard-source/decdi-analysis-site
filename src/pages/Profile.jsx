import Layout from "../layout/Layout";

export default function Profile() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil del usuario</h2>
      <div className="bg-white p-6 rounded-xl shadow">
        <p>Información básica del usuario.</p>
      </div>
    </Layout>
  );
}

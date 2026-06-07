import Sidebar from '../components/Sidebar';
export default function Categories() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Categorias 🗂️</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Em breve</p>
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Esta seção está em desenvolvimento.</div>
      </main>
    </div>
  );
}

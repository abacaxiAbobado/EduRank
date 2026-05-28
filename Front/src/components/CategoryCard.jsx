export default function CategoryCard({ icon, title, count, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 22, cursor: 'pointer',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{count} itens</div>
    </div>
  );
}

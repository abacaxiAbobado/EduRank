export default function Footer() {
  return (
    <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
      EduRank © {new Date().getFullYear()} — Aprenda. Responda. Evolua.
    </footer>
  );
}

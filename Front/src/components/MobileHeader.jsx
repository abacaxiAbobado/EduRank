export default function MobileHeader({ onOpen }) {
  return (
    <header className="mobile-header">
      <button onClick={onOpen} className="hamburger-btn">
        <span /><span /><span />
      </button>
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem',
        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>EduRank</div>
      <div style={{ width: 36 }} />
    </header>
  );
}

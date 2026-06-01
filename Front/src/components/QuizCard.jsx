export default function QuizCard({ quiz, onStart }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 22,
      transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
    >
      <span style={{
        display: 'inline-block', fontSize: '0.72rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.8px',
        padding: '3px 10px', borderRadius: 99, marginBottom: 12,
        background: 'rgba(247,194,106,0.15)', color: 'var(--accent2)',
      }}>Quiz</span>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
        {quiz.titulo}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
        {quiz.descricao || ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          Por {quiz.autor?.name || '?'} · {quiz._count?.questoes || 0} questões
        </span>
        <button onClick={() => onStart(quiz)} style={{
          padding: '7px 16px', borderRadius: 8, border: 'none',
          background: 'var(--accent)', color: '#fff',
          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
        }}>Iniciar →</button>
      </div>
    </div>
  );
}

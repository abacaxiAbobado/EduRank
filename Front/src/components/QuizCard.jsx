export default function QuizCard({ quiz, onStart, onEdit, canEdit }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 22, transition: 'border-color 0.2s, transform 0.2s',
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
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
        {quiz.titulo}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>
        {quiz.descricao || ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          {quiz.autor ? `Por ${quiz.autor.name}` : 'EduRank'} · {quiz._count?.questoes || 0} questões
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {canEdit && (
            <button onClick={() => onEdit(quiz)} style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--muted)',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            }}>Editar</button>
          )}
          <button onClick={() => onStart(quiz)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}>Iniciar →</button>
        </div>
      </div>
    </div>
  );
}

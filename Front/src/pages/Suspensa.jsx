import { useSearchParams, Link } from 'react-router-dom';

export default function Suspensa() {
  const [params] = useSearchParams();
  const motivo = params.get('motivo') || 'Sem motivo informado.';
  const ate = params.get('ate');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🚫</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 8 }}>
          Conta suspensa
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 28 }}>
          Sua conta foi suspensa por um administrador.
        </p>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--danger-border)',
          borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'left',
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
              Motivo
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 500 }}>
              {motivo}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
              Duração
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, color: ate ? 'var(--accent2)' : 'var(--danger)' }}>
              {ate
                ? `Até ${new Date(ate).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}`
                : 'Suspensão permanente'}
            </div>
          </div>
        </div>

        <Link to="/login" style={{
          display: 'block', padding: 13,
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 10, color: 'var(--muted)',
          fontSize: '0.9rem', fontWeight: 600,
          transition: 'all 0.15s',
        }}>
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}

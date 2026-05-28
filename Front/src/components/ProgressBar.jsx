export default function ProgressBar({ value = 0 }) {
  return (
    <div style={{ background: 'var(--border)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 99, width: `${value}%`,
        background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
      }} />
    </div>
  );
}

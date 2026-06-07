export default function Avatar({ user, size = 40 }) {
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.name}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
          border: '2px solid var(--border)',
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-heading)', fontWeight: 700,
      color: '#fff', fontSize: size * 0.38,
    }}>
      {initial}
    </div>
  );
}

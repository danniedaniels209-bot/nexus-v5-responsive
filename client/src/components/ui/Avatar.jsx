const COLORS = [
  ['rgba(139,92,246,0.2)', '#A78BFA'],
  ['rgba(34,211,238,0.2)', '#67E8F9'],
  ['rgba(16,185,129,0.2)', '#34D399'],
  ['rgba(245,158,11,0.2)', '#FCD34D'],
  ['rgba(239,68,68,0.2)',  '#FCA5A5'],
  ['rgba(236,72,153,0.2)', '#F9A8D4'],
];

function getColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function Avatar({ user, size = 36, style = {} }) {
  const username = user?.username || user?.name || '?';
  const initials = username.slice(0, 2).toUpperCase();
  const [bg, color] = getColor(username);

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={username}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: bg,
      border: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
      fontSize: size * 0.35,
      color,
      flexShrink: 0,
      userSelect: 'none',
      ...style,
    }}>
      {initials}
    </div>
  );
}

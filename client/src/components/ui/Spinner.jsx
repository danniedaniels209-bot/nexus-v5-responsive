export function Spinner({ size = 20, color = 'var(--purple)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(139,92,246,0.15)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export function PageSpinner() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16,
    }}>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid rgba(139,92,246,0.1)',
          borderTopColor: 'var(--purple)',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute', inset: 8,
          border: '2px solid rgba(34,211,238,0.1)',
          borderTopColor: 'var(--cyan)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite reverse',
        }} />
        {/* Core dot */}
        <div style={{
          position: 'absolute', inset: 18,
          background: 'var(--purple)',
          borderRadius: '50%',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-3)', letterSpacing: '0.05em' }}>Loading…</span>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  );
}

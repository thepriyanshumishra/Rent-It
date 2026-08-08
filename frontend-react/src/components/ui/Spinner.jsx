export default function Spinner({ size = 'md', color = 'accent' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };
  const colors = {
    accent: 'border-[var(--accent)] border-t-transparent',
    white:  'border-white border-t-transparent',
    muted:  'border-[var(--border-strong)] border-t-transparent',
  };
  return (
    <div
      className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

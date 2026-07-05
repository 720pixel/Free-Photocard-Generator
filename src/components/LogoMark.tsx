// The Free Photocard Generator brand mark: a photocard with a person, sparkle
// and heart in the blue→pink gradient. Kept in sync with /src/app/icon.svg.
export default function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const id = "lm"; // gradient id; single instance on a page is fine for the header
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true" role="img">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9aa6f2" />
          <stop offset="0.5" stopColor="#c79be0" />
          <stop offset="1" stopColor="#f4a6c8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="#0e1020" />
      <rect x="14" y="16" width="30" height="38" rx="6" fill={`url(#${id})`} opacity="0.45" transform="rotate(-9 29 35)" />
      <g transform="rotate(-3 33 33)">
        <rect x="20" y="12" width="30" height="40" rx="7" fill="#ffffff" />
        <rect x="23.5" y="15.5" width="23" height="27" rx="4" fill={`url(#${id})`} />
        <circle cx="35" cy="24.5" r="4.6" fill="#14183a" />
        <path d="M26.5 39 a8.5 8.5 0 0 1 17 0 Z" fill="#14183a" />
        <path d="M41 45.5c-1.6-1.3-3-2.2-3-3.6a1.5 1.5 0 0 1 2.9-.5 1.5 1.5 0 0 1 2.9.5c0 1.4-1.4 2.3-3 3.6z" fill="#f4a6c8" />
      </g>
      <path d="M49 15 l1.7 4.3 4.3 1.7 -4.3 1.7 -1.7 4.3 -1.7 -4.3 -4.3 -1.7 4.3 -1.7 z" fill="#e9ecff" />
    </svg>
  );
}

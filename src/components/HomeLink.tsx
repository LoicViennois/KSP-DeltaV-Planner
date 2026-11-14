// Link back to loicviennois.com, the hub of all my projects. The mark is the
// home page's logo (a gravity-assist flyby), copied from its favicon so every
// app points home with the same icon.
const homeUrl = 'https://www.loicviennois.com/';

export function HomeLink({ className }: { className?: string }) {
  return (
    <a
      href={homeUrl}
      aria-label="More projects by Loïc Viennois"
      title="More projects by Loïc Viennois"
      className={className}
    >
      <svg viewBox="0 0 32 32" aria-hidden className="size-6">
        <rect width="32" height="32" rx="7" fill="#171a2b" />
        <circle cx="15.66" cy="20.3" r="4.8" fill="#a3adff" />
        <g
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M9.92 2L6.95 20.77A7.2 7.2 0 0 0 8.59 26.58"
            stroke="#e9ebf5"
          />
          <path
            d="M8.59 26.58A7.2 7.2 0 0 0 14.06 29.1L25.06 29.1"
            stroke="#a3adff"
            strokeDasharray="0.01 2.7"
          />
        </g>
      </svg>
    </a>
  );
}

// Link back to loicviennois.com, the hub of all my projects. The mark is the
// home page's logo (a gravity-assist flyby): the flown leg follows the other
// header icons, the planet and the planned leg take this app's accent colour.
const homeUrl = 'https://www.loicviennois.com/';

export function HomeLink({ className }: { className?: string }) {
  return (
    <a
      href={homeUrl}
      aria-label="More projects by Loïc Viennois"
      title="More projects by Loïc Viennois"
      className={className}
    >
      <svg viewBox="3 1.5 26 29" aria-hidden className="size-6">
        <circle cx="15.66" cy="20.3" r="4.8" className="fill-thrust-text" />
        <g
          fill="none"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M9.92 2L6.95 20.77A7.2 7.2 0 0 0 8.59 26.58"
            stroke="currentColor"
          />
          <path
            d="M8.59 26.58A7.2 7.2 0 0 0 14.06 29.1L25.06 29.1"
            strokeDasharray="0.01 4"
            className="stroke-thrust-text"
          />
        </g>
      </svg>
    </a>
  );
}

export function ArgosMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="argos"
    >
      <path
        fill="currentColor"
        d="M32 4.5 56.25 18.5v27L32 59.5 7.75 45.5v-27L32 4.5z"
      />
      <path
        fill="none"
        stroke="#fafafa"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 33c6-12 28-12 34 0-6 12-28 12-34 0z"
      />
      <circle cx="32" cy="33" r="3.15" fill="#0d9488" />
    </svg>
  )
}

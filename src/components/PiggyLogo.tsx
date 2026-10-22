export default function PiggyLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Salvadanaio"
    >
      <circle cx="41" cy="9" r="5.5" fill="#9FD8C0" stroke="#2E7D62" strokeWidth="1.6" />
      <ellipse cx="31" cy="39" rx="22" ry="15.5" fill="#E8622A" />
      <path d="M18 27 l5.5 -8 l4.5 9 z" fill="#B8461A" />
      <rect x="25" y="23" width="15" height="3" rx="1.5" fill="#2B2420" transform="rotate(-9 32 24)" />
      <ellipse cx="51" cy="41" rx="7.5" ry="6" fill="#B8461A" />
      <circle cx="49.5" cy="41" r="1.3" fill="#2B2420" />
      <circle cx="53.5" cy="41" r="1.3" fill="#2B2420" />
      <circle cx="33" cy="35" r="2" fill="#2B2420" />
      <rect x="19" y="50" width="5" height="8.5" rx="2.5" fill="#B8461A" />
      <rect x="39" y="50" width="5" height="8.5" rx="2.5" fill="#B8461A" />
      <path d="M10 37 q-5 -1 -3 -6" fill="none" stroke="#B8461A" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

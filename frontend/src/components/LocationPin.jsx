export default function LocationPin({ size = 28, color = "#7c3aed" }) {
  const s = size;
  const h = s * 1.5;
  return (
    <svg width={s * 1.3} height={h} viewBox="0 0 26 40" className="drop-shadow-xl">
      <defs>
        <filter id="pin-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
        </filter>
      </defs>
      <path
        d="M13 2C7.5 2 3 6.5 3 12c0 7 10 26 10 26s10-19 10-26C23 6.5 18.5 2 13 2zm0 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
        filter="url(#pin-shadow)"
      />
      <circle cx="13" cy="12" r="3.5" fill="white" />
    </svg>
  );
}

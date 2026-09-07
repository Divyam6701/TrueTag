"use client";

/**
 * A stylised "product on a scanning pedestal" illustration, echoing the
 * dark studio / holographic-panel aesthetic used throughout the app.
 * Pure SVG so it never depends on external image assets.
 */
export function ProductRig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 420"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pedestalTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22262c" />
          <stop offset="100%" stopColor="#101215" />
        </linearGradient>
        <linearGradient id="pouchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f2ec" />
          <stop offset="100%" stopColor="#cfccc3" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4fa6d8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4fa6d8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="240" cy="230" rx="200" ry="140" fill="url(#glow)" />

      {/* Pedestal */}
      <ellipse cx="240" cy="360" rx="150" ry="18" fill="#000" opacity="0.5" />
      <path d="M60 330 L420 330 L390 360 L90 360 Z" fill="url(#pedestalTop)" stroke="#2a2d33" />
      <ellipse cx="240" cy="330" rx="180" ry="14" fill="none" stroke="#3a3e45" strokeWidth="1" />
      <ellipse cx="240" cy="330" rx="130" ry="10" fill="none" stroke="#3a3e45" strokeWidth="1" />

      {/* Reflection */}
      <ellipse cx="240" cy="345" rx="60" ry="8" fill="#4fa6d8" opacity="0.15" />

      {/* Product (generic pouch) */}
      <g>
        <path
          d="M195 150 Q240 130 285 150 L292 320 Q240 335 188 320 Z"
          fill="url(#pouchGrad)"
          stroke="#a9a69c"
          strokeWidth="1"
        />
        <path d="M195 150 Q240 165 285 150 L285 165 Q240 180 195 165 Z" fill="#e3e0d6" opacity="0.6" />
        <rect x="205" y="255" width="70" height="22" rx="4" fill="#171a1e" opacity="0.85" />
        <text x="240" y="270" textAnchor="middle" fontSize="8" fill="#f4f2ec" fontFamily="monospace" letterSpacing="1">
          SAMPLE ITEM
        </text>
      </g>
    </svg>
  );
}

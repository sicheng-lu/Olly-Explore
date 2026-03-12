interface ThinkingRobotProps {
  size?: number;
}

export function ThinkingRobot({ size = 48 }: ThinkingRobotProps) {
  // The SVG is designed on a 48x48 viewBox; the size prop scales it.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-robot-float"
      aria-label="Thinking robot"
      role="img"
    >
      {/* Antenna line */}
      <line x1="24" y1="10" x2="24" y2="4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {/* Antenna pulsing circle */}
      <circle cx="24" cy="3" r="3" fill="#38bdf8" className="animate-robot-antenna-pulse" />

      {/* Body */}
      <rect x="12" y="10" width="24" height="22" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />

      {/* Left eye */}
      <circle cx="19" cy="20" r="3" fill="#e2e8f0" className="animate-robot-blink" />
      {/* Right eye */}
      <circle cx="29" cy="20" r="3" fill="#e2e8f0" className="animate-robot-blink" />

      {/* Mouth */}
      <rect x="19" y="26" width="10" height="2" rx="1" fill="#94a3b8" />

      {/* Left leg */}
      <rect x="16" y="32" width="4" height="6" rx="2" fill="#475569" />
      {/* Right leg */}
      <rect x="28" y="32" width="4" height="6" rx="2" fill="#475569" />

      {/* Left arm */}
      <rect x="8" y="14" width="4" height="10" rx="2" fill="#475569" />
      {/* Right arm */}
      <rect x="36" y="14" width="4" height="10" rx="2" fill="#475569" />
    </svg>
  );
}

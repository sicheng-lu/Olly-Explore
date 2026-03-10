import { useOllyState } from '@/contexts/OllyStateContext';

interface OllyIconProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  logoSrc?: string;
}

const SIZE_MAP = {
  small: 24,
  medium: 32,
  large: 48,
} as const;

export function OllyIcon({ size = 'medium', className = '', logoSrc = '/image/Logo.svg' }: OllyIconProps) {
  const { state } = useOllyState();

  const px = SIZE_MAP[size];
  const isAnimating = state === 'thinking' || state === 'investigating';
  const colorClass = state === 'investigating' ? 'text-oui-danger' : 'text-oui-primary';
  const isCustomLogo = logoSrc !== '/image/Logo.svg';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: px, height: px, overflow: isCustomLogo ? 'visible' : undefined }}
      data-testid="olly-icon"
      data-state={state}
    >
      {/* OpenSearch logo */}
      {isCustomLogo ? (
        <img
          src={logoSrc}
          alt="OpenSearch"
          width={px}
          height={px}
        />
      ) : (
        <img
          src={logoSrc}
          alt="OpenSearch"
          width={px}
          height={px}
          className={colorClass}
          style={{
            WebkitMaskImage: `url(${logoSrc})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(${logoSrc})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
      )}

      {/* Circling animation arc — visible in thinking/investigating states */}
      {isAnimating && (
        <div
          className="absolute inset-0 animate-olly-circle"
          data-testid="olly-icon-animation"
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={colorClass}
            width={px}
            height={px}
          >
            {/* Small arc that rotates around the icon */}
            <path
              d="M56 44a28 28 0 0 0 4-12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

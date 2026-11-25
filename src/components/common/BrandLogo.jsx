import React from 'react';

/**
 * Professional Brand Logo Component for Online Examination System
 * Features a modern, scalable SVG emblem combining an academic examination shield,
 * structured question checklist, and verified assessment badge.
 *
 * @param {string} [size='md'] - 'sm' (28px), 'md' (36px), 'lg' (48px), 'xl' (60px)
 * @param {string} [variant='dark'] - 'dark' (for dark navbars/sidebars), 'light' (for white surfaces)
 * @param {boolean} [showText=true] - Whether to display "EduExamPro" typography beside the emblem
 * @param {string} [subtitle] - Optional subtitle (e.g. "Examination Portal")
 */
export function BrandLogo({
  size = 'md',
  variant = 'dark',
  showText = false,
  subtitle = null,
  style = {}
}) {
  const pixelSizes = {
    xs: 24,
    sm: 30,
    md: 38,
    lg: 48,
    xl: 60
  };

  const dim = pixelSizes[size] || 38;
  const isDarkBg = variant === 'dark';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim >= 38 ? '0.75rem' : '0.5rem',
        textDecoration: 'none',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Precision Geometric SVG Emblem */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(6, 182, 212, 0.25))' }}
      >
        <defs>
          <linearGradient id="shieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="checkGrad" x1="18" y1="20" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>

        {/* Outer Academic Shield Frame */}
        <path
          d="M24 3L8 9V21.5C8 31.8 14.8 41.3 24 45C33.2 41.3 40 31.8 40 21.5V9L24 3Z"
          fill="url(#shieldGrad)"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Document / Examination Blueprint Grid */}
        <rect
          x="15"
          y="13"
          width="18"
          height="22"
          rx="2.5"
          fill="#0f172a"
          fillOpacity="0.45"
          stroke="url(#accentGrad)"
          strokeWidth="1.2"
        />

        {/* Test Paper Prompt Lines */}
        <line x1="19" y1="18" x2="29" y2="18" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="19" y1="22" x2="26" y2="22" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />

        {/* Verified Score / Assessment Checkmark Badge */}
        <circle cx="28" cy="29" r="6.5" fill="url(#accentGrad)" />
        <path
          d="M25 29L27 31L31 27"
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: dim >= 48 ? '1.5rem' : dim >= 38 ? '1.2rem' : '1rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: isDarkBg ? '#ffffff' : '#0f172a'
            }}
          >
            EduExam<span style={{ color: '#06b6d4' }}>Pro</span>
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: '0.72rem',
                color: isDarkBg ? '#94a3b8' : '#64748b',
                marginTop: '0.15rem',
                fontWeight: 500
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default BrandLogo;

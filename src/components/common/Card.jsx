import React from 'react';

/**
 * Reusable Card Component
 * Supports clean academic cards, stat cards with metrics, and container boxes.
 */
export function Card({
  title,
  subtitle,
  icon = null,
  action = null,
  badge = null,
  metric = null,
  metricLabel = null,
  trend = null,
  footer = null,
  children,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`card-box ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {(title || action || icon || badge) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: children || metric !== null ? '0.85rem' : 0,
            gap: '0.65rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
            {icon && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--cyan-light)',
                  color: 'var(--cyan-700)',
                  fontSize: '1.1rem',
                  flexShrink: 0
                }}
              >
                {icon}
              </span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              {title && (
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--navy-900)',
                    lineHeight: 1.25,
                    margin: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {(badge || action) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              {badge && <span style={{ flexShrink: 0 }}>{badge}</span>}
              {action && <div style={{ flexShrink: 0 }}>{action}</div>}
            </div>
          )}
        </div>
      )}

      {metric !== null && (
        <div style={{ marginBottom: children ? '0.75rem' : 0 }}>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--navy-900)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {metric}
          </div>
          {metricLabel && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {metricLabel}
            </div>
          )}
        </div>
      )}

      {children && <div style={{ flex: 1 }}>{children}</div>}

      {footer && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;


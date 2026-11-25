import React from 'react';

/**
 * Reusable Button Component
 * Supports modern academic styling with navy blue, subtle cyan, and secondary neutral variants.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = '',
  title = '',
  style = {}
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
    lineHeight: 1.25,
    outline: 'none',
    userSelect: 'none'
  };

  const sizeStyles = {
    sm: { padding: '0.35rem 0.65rem', fontSize: '0.8rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--navy-primary)',
      color: '#ffffff',
      borderColor: 'var(--navy-primary)',
      boxShadow: 'var(--shadow-xs)'
    },
    cyan: {
      backgroundColor: 'var(--cyan-600)',
      color: '#ffffff',
      borderColor: 'var(--cyan-600)',
      boxShadow: 'var(--shadow-xs)'
    },
    secondary: {
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--navy-800)',
      borderColor: 'var(--border-light)',
      boxShadow: 'var(--shadow-xs)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--navy-primary)',
      borderColor: 'var(--navy-primary)'
    },
    'outline-light': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      color: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.45)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)'
    },
    danger: {
      backgroundColor: 'var(--status-danger)',
      color: '#ffffff',
      borderColor: 'var(--status-danger)'
    },
    success: {
      backgroundColor: '#059669',
      color: '#ffffff',
      borderColor: '#059669',
      boxShadow: 'var(--shadow-xs)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--navy-700)',
      borderColor: 'transparent'
    }
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`btn-custom ${className}`}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style
      }}
    >
      {icon && <span style={{ display: 'inline-flex', fontSize: '1.1em' }}>{icon}</span>}
      {children}
    </button>
  );
}

export default Button;


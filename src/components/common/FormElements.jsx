import React from 'react';

/**
 * Reusable Form Elements: Input, Select, Textarea, and Badge
 * Adheres to the Navy Blue and Subtle Cyan academic theme.
 */

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  disabled = false,
  required = false,
  error = '',
  hint = '',
  prefix = null,
  name = '',
  className = '',
  style = {}
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', ...style }}>
      {label && (
        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-800)' }}>
          {label} {required && <span style={{ color: 'var(--status-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {prefix}
          </span>
        )}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-input ${className}`}
          style={{
            width: '100%',
            padding: prefix ? '0.5rem 0.75rem 0.5rem 2.2rem' : '0.5rem 0.75rem',
            fontSize: '0.875rem',
            color: 'var(--text-main)',
            backgroundColor: disabled ? 'var(--bg-body)' : 'var(--bg-surface)',
            border: error ? '1px solid var(--status-danger)' : '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        />
      </div>
      {hint && !error && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>}
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>{error}</span>}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  error = '',
  hint = '',
  name = '',
  className = '',
  style = {}
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', ...style }}>
      {label && (
        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-800)' }}>
          {label} {required && <span style={{ color: 'var(--status-danger)' }}>*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`form-select ${className}`}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          color: 'var(--text-main)',
          backgroundColor: disabled ? 'var(--bg-body)' : 'var(--bg-surface)',
          border: error ? '1px solid var(--status-danger)' : '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>}
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>{error}</span>}
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  disabled = false,
  required = false,
  error = '',
  hint = '',
  name = '',
  className = '',
  style = {}
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', ...style }}>
      {label && (
        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-800)' }}>
          {label} {required && <span style={{ color: 'var(--status-danger)' }}>*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`form-textarea ${className}`}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          color: 'var(--text-main)',
          backgroundColor: disabled ? 'var(--bg-body)' : 'var(--bg-surface)',
          border: error ? '1px solid var(--status-danger)' : '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
      />
      {hint && !error && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>}
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>{error}</span>}
    </div>
  );
}

export function Badge({
  children,
  variant = 'cyan', // 'cyan', 'navy', 'success', 'warning', 'danger', 'neutral'
  size = 'sm',
  className = ''
}) {
  const badgeStyles = {
    cyan: {
      backgroundColor: 'var(--cyan-light)',
      color: 'var(--cyan-700)',
      border: '1px solid var(--cyan-border)'
    },
    navy: {
      backgroundColor: 'var(--navy-light)',
      color: 'var(--navy-primary)',
      border: '1px solid #bfdbfe'
    },
    success: {
      backgroundColor: 'var(--status-success-bg)',
      color: 'var(--status-success)',
      border: '1px solid #bbf7d0'
    },
    warning: {
      backgroundColor: 'var(--status-warning-bg)',
      color: 'var(--status-warning)',
      border: '1px solid #fef08a'
    },
    danger: {
      backgroundColor: 'var(--status-danger-bg)',
      color: 'var(--status-danger)',
      border: '1px solid #fecaca'
    },
    neutral: {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0'
    }
  };

  const sizeStyles = {
    sm: { padding: '0.15rem 0.5rem', fontSize: '0.725rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.8rem' }
  };

  return (
    <span
      className={`badge-item ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        borderRadius: '9999px',
        fontWeight: 600,
        textTransform: 'none',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        userSelect: 'none',
        ...badgeStyles[variant],
        ...sizeStyles[size]
      }}
    >
      {children}
    </span>
  );
}

export default {
  Input,
  Select,
  Textarea,
  Badge
};


import React, { useState, useEffect } from 'react';
import { Button } from '../components/common/Button.jsx';
import { Input, Badge } from '../components/common/FormElements.jsx';
import { setAdminSession } from '../utils/storage.js';
import { verifyAdminCredentials, DEMO_ADMIN } from '../data/demonstrationCredentials.js';
import { hashPassword } from '../utils/crypto.js';
import { BrandLogo } from '../components/common/BrandLogo.jsx';

/**
 * Admin Login View Component
 *
 * Requirements:
 * 1. Dedicated Administrator Login View.
 * 2. Form starts completely empty; requires manual entry of username and password.
 * 3. Validation and clear error alerts on failed authentication.
 * 4. Demonstration Account: Prof. R. Srinivasan (admin). Verified against demonstrationCredentials.js.
 * 5. Password visibility toggle (show/hide).
 * 6. Back to Portal Selection option.
 * 7. Remember Me functionality with SHA-256 cryptographic persistence in LocalStorage.
 */
export function AdminLoginView({ onLoginSuccess, onBackToPortal }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRememberedSaved, setIsRememberedSaved] = useState(false);
  const [savedPasswordHash, setSavedPasswordHash] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load remembered credentials on initial mount (SHA-256 hash only, never plaintext password)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('oes_remembered_admin');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.username && parsed.passwordHash) {
          setUsername(parsed.username);
          setRememberMe(true);
          setIsRememberedSaved(true);
          setSavedPasswordHash(parsed.passwordHash);
        }
      }
    } catch (e) {
      console.warn('Could not parse remembered admin credentials', e);
    }
  }, []);

  const handleUsernameChange = (val) => {
    setUsername(val);
    if (errors.username) setErrors({ ...errors, username: '' });
    if (isRememberedSaved) {
      setIsRememberedSaved(false);
      setSavedPasswordHash('');
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (errors.password) setErrors({ ...errors, password: '' });
    if (isRememberedSaved) {
      setIsRememberedSaved(false);
      setSavedPasswordHash('');
    }
  };

  const handleClearRemembered = () => {
    try {
      localStorage.removeItem('oes_remembered_admin');
    } catch (e) {
      console.error(e);
    }
    setUsername('');
    setPassword('');
    setRememberMe(false);
    setIsRememberedSaved(false);
    setSavedPasswordHash('');
    setAuthError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const newErrors = {};

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      newErrors.username = 'Administrator username is required.';
    }
    if (!cleanPass && !isRememberedSaved) {
      newErrors.password = 'Administrator password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      let sessionPayload = null;

      // Case A: Submitting with remembered credentials (no new plaintext password entered)
      if (isRememberedSaved && savedPasswordHash && !cleanPass) {
        const expectedHash = await hashPassword(DEMO_ADMIN.password);
        const isUserMatch =
          cleanUser.toLowerCase() === DEMO_ADMIN.username.toLowerCase() ||
          cleanUser.toLowerCase() === DEMO_ADMIN.email.toLowerCase();

        if (isUserMatch && savedPasswordHash === expectedHash) {
          sessionPayload = {
            username: DEMO_ADMIN.username,
            name: DEMO_ADMIN.name,
            role: 'admin',
            department: DEMO_ADMIN.department,
            designation: DEMO_ADMIN.designation,
            academicYear: DEMO_ADMIN.academicYear,
            email: DEMO_ADMIN.email,
            loginTimestamp: new Date().toISOString()
          };
        }
      } else {
        // Case B: Standard manual login with entered password
        sessionPayload = verifyAdminCredentials(cleanUser, cleanPass);
      }

      if (sessionPayload) {
        // Handle Remember Me persistence
        if (rememberMe) {
          const hashToSave = cleanPass ? await hashPassword(cleanPass) : savedPasswordHash;
          if (hashToSave) {
            localStorage.setItem(
              'oes_remembered_admin',
              JSON.stringify({
                username: cleanUser,
                passwordHash: hashToSave,
                rememberMe: true,
                savedAt: new Date().toISOString()
              })
            );
          }
        } else {
          localStorage.removeItem('oes_remembered_admin');
        }

        // Persist admin session in Session Storage
        setAdminSession(sessionPayload);
        setIsLoading(false);

        if (onLoginSuccess) {
          onLoginSuccess(sessionPayload);
        }
      } else {
        setIsLoading(false);
        setAuthError(
          'Invalid administrator credentials. Access restricted to authorized faculty and examination cell personnel.'
        );
      }
    } catch (err) {
      console.error('Admin authentication error:', err);
      setIsLoading(false);
      setAuthError('An authentication error occurred. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-body)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
            <BrandLogo size="md" variant="dark" />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--navy-900)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            EduExam<span style={{ color: 'var(--cyan-600)' }}>Pro</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Faculty & Examination Cell Portal
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Badge variant="navy">FACULTY ACCESS</Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin Control Centre</span>
            </div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--navy-900)',
                letterSpacing: '-0.01em'
              }}
            >
              Administrator Login
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Sign in with your faculty administrator credentials to manage examination operations.
            </p>
          </div>

          {/* Authentication Error Banner */}
          {authError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-danger)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Administrator Username"
              required
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              error={errors.username}
              prefix="👤"
              autoFocus
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                  Password <span style={{ color: 'var(--status-danger)' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--navy-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? '🙈 Hide' : '👁️ Show'}
                </button>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isRememberedSaved ? '•••••••••••• (Saved Password)' : 'Enter administrator password...'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-surface)',
                    border: errors.password ? '1px solid var(--status-danger)' : '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    fontFamily: showPassword ? 'inherit' : 'sans-serif'
                  }}
                />
              </div>
              {errors.password && (
                <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)', marginTop: '0.25rem', display: 'block' }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remembered Credentials Hint & Clear Option */}
            {isRememberedSaved && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f1f5f9',
                  padding: '0.4rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  color: 'var(--navy-800)'
                }}
              >
                <span>🔒 <strong>Remembered Login:</strong> Secure SHA-256 credentials loaded.</span>
                <button
                  type="button"
                  onClick={handleClearRemembered}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--status-danger)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                  title="Forget saved credentials"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Remember Me Checkbox Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.825rem',
                  color: 'var(--navy-800)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: 500
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRememberMe(checked);
                    if (!checked) {
                      try {
                        localStorage.removeItem('oes_remembered_admin');
                      } catch (err) {
                        console.error(err);
                      }
                      if (isRememberedSaved) {
                        setIsRememberedSaved(false);
                        setSavedPasswordHash('');
                      }
                    }
                  }}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--navy-primary)',
                    cursor: 'pointer'
                  }}
                />
                <span>Remember Me</span>
              </label>

              {isRememberedSaved && (
                <button
                  type="button"
                  onClick={handleClearRemembered}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forget Saved Login
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="navy"
              size="lg"
              fullWidth
              disabled={isLoading}
              icon={isLoading ? '⏳' : '🛡️'}
              style={{ marginTop: '0.5rem' }}
            >
              {isLoading ? 'Verifying Faculty Session...' : 'Sign In as Administrator'}
            </Button>
          </form>

          {/* Back to Portal Selection */}
          {onBackToPortal && (
            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onBackToPortal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--navy-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Back to Portal Selection
              </button>
            </div>
          )}

          {/* Academic Transparency Notice */}
          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              textAlign: 'center'
            }}
          >
            🔒 <strong>Session Separation:</strong> Faculty administrator sessions are stored in Browser Session Storage (<code style={{ fontSize: '0.7rem' }}>sessionStorage</code>) and isolated from candidate examination accounts.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginView;

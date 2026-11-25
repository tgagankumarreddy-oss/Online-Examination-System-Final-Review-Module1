import React from 'react';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/FormElements.jsx';
import { BrandLogo } from '../common/BrandLogo.jsx';

/**
 * Sidebar Component
 * Displays university branding, role-based navigation menu, student session info, and role switching controls.
 */
export function Sidebar({
  activeRole,
  onRoleChange,
  activeNav,
  onNavChange,
  isMobileOpen = false,
  onCloseMobile,
  adminSession = null,
  onAdminLogout = null,
  studentSession = null,
  onStudentLogout = null
}) {
  const adminNavItems = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'admin_students', label: 'Student Management', icon: '👥' },
    { id: 'admin_questions', label: 'Question Bank', icon: '📚' },
    { id: 'admin_exams', label: 'Exam Management', icon: '⚙️' },
    { id: 'admin_results', label: 'Results & Analytics', icon: '🏆' }
  ];

  const studentNavItems = [
    { id: 'student_dashboard', label: 'Student Dashboard', icon: '🎓' },
    { id: 'student_available_exams', label: 'Available Exams', icon: '📝' },
    { id: 'student_history', label: 'Exam History', icon: '⏳' },
    { id: 'student_results', label: 'Results', icon: '🏆' }
  ];

  const currentNavItems = activeRole === 'admin' ? adminNavItems : studentNavItems;

  return (
    <aside
      className={`app-sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}
      style={{
        width: '260px',
        backgroundColor: 'var(--navy-900)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--navy-800)',
        flexShrink: 0,
        minHeight: '100vh',
        transition: 'all 0.2s ease',
        zIndex: 100
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--navy-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, overflow: 'hidden' }}>
          <BrandLogo size="sm" variant="dark" showText={false} />
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <h1
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                margin: 0,
                whiteSpace: 'nowrap'
              }}
            >
              EduExam<span style={{ color: 'var(--cyan-400)' }}>Pro</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.15rem', margin: 0, whiteSpace: 'nowrap' }}>
              B.Tech CSE Examination
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              color: 'var(--text-light)',
              border: 'none',
              cursor: 'pointer',
              display: 'none'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Role Indicator Banner */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          borderBottom: '1px solid var(--navy-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          ACTIVE PORTAL
        </span>
        <Badge variant={activeRole === 'admin' ? 'navy' : 'cyan'}>
          {activeRole === 'admin' ? 'ADMIN' : studentSession ? 'STUDENT' : 'GUEST'}
        </Badge>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {currentNavItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--navy-800)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-light)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-light)';
                  }
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '15%',
                      bottom: '15%',
                      width: '3px',
                      backgroundColor: 'var(--cyan-500)',
                      borderRadius: '0 2px 2px 0',
                      boxShadow: '0 0 8px var(--cyan-500)'
                    }}
                  />
                )}
                <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Profile & Session Controls at bottom */}
      <div
        style={{
          padding: '1.25rem 1rem',
          borderTop: '1px solid var(--navy-800)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--navy-800)',
              border: '1px solid var(--navy-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}
          >
            {activeRole === 'admin' ? '👨‍🏫' : '👨‍🎓'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {activeRole === 'admin'
                ? (adminSession?.name || 'Prof. R. Srinivasan')
                : studentSession
                ? studentSession.name
                : 'Guest Candidate'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
              {activeRole === 'admin'
                ? 'Dept of CSE • Chief Examiner'
                : studentSession
                ? `Reg: ${studentSession.registrationNumber}`
                : 'Not Logged In'}
            </div>
          </div>
        </div>

        {/* Admin Logout button */}
        {activeRole === 'admin' && onAdminLogout && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            icon="🚪"
            onClick={onAdminLogout}
            style={{ color: '#ffffff', borderColor: 'var(--navy-700)' }}
            title="Log out of administrator session"
          >
            Sign Out (Admin)
          </Button>
        )}

        {/* Student Logout button if in student mode & logged in */}
        {activeRole === 'student' && studentSession && onStudentLogout && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            icon="🚪"
            onClick={onStudentLogout}
            style={{ color: '#ffffff', borderColor: 'var(--navy-700)' }}
            title="Log out of candidate session"
          >
            Sign Out (Student)
          </Button>
        )}

        <Button
          variant={activeRole === 'admin' ? 'cyan' : 'secondary'}
          size="sm"
          fullWidth
          icon="🔄"
          onClick={() => {
            const nextRole = activeRole === 'admin' ? 'student' : 'admin';
            onRoleChange(nextRole);
          }}
          title="Toggle view between Admin and Student perspective"
        >
          {activeRole === 'admin' ? 'Switch to Student View' : 'Switch to Admin View'}
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;

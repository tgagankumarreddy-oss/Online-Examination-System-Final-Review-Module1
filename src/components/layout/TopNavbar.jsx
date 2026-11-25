import React from 'react';
import { Badge } from '../common/FormElements.jsx';
import { Button } from '../common/Button.jsx';

/**
 * Top Navigation Bar Component
 * Displays contextual breadcrumbs, quick system health telemetry, session info, and profile status.
 */
export function TopNavbar({
  activeRole,
  activeNav,
  onRoleToggle,
  onToggleMobileSidebar,
  adminSession = null,
  onAdminLogout = null,
  studentSession = null,
  onStudentLogout = null
}) {
  const getNavTitle = () => {
    switch (activeNav) {
      case 'admin_dashboard':
        return { section: 'Admin Portal', title: 'Dashboard & Analytics' };
      case 'admin_students':
        return { section: 'Admin Portal', title: 'Student Management & Enrollment' };
      case 'admin_questions':
        return { section: 'Admin Portal', title: 'Question Bank Management' };
      case 'admin_exams':
        return { section: 'Admin Portal', title: 'Exam Configuration & Schedule' };
      case 'admin_results':
        return { section: 'Admin Portal', title: 'Institutional Results & Analytics' };
      case 'student_login':
        return { section: 'Student Portal', title: 'Candidate Portal Login' };
      case 'student_dashboard':
        return { section: 'Student Portal', title: 'Candidate Dashboard' };
      case 'student_available_exams':
        return { section: 'Student Portal', title: 'Available Examinations' };
      case 'student_history':
        return { section: 'Student Portal', title: 'Exam Attempt History' };
      case 'student_results':
        return { section: 'Student Portal', title: 'Results & Performance Analytics' };
      default:
        return { section: 'Online Examination System', title: 'Dashboard' };
    }
  };

  const navMeta = getNavTitle();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-hamburger-btn"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '0.25rem',
            color: 'var(--navy-800)',
            display: 'none'
          }}
          title="Toggle Navigation"
        >
          ☰
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{navMeta.section}</span>
            <span>/</span>
            <span style={{ color: 'var(--cyan-700)', fontWeight: 600 }}>{navMeta.title}</span>
          </div>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--navy-900)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em'
            }}
          >
            {navMeta.title}
          </h2>
        </div>
      </div>

      {/* Right: Telemetry & User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* System Health Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-success)',
              boxShadow: '0 0 6px var(--status-success)'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Storage Ready
          </span>
        </div>

        {/* Role Pill */}
        <Badge variant={activeRole === 'admin' ? 'navy' : 'cyan'}>
          {activeRole === 'admin'
            ? (adminSession ? `Admin: ${adminSession.name || 'Prof. R. Srinivasan'}` : 'Administrator')
            : studentSession
            ? `Candidate: ${studentSession.registrationNumber}`
            : 'Candidate Login'}
        </Badge>

        {/* Admin Logout button in Navbar */}
        {activeRole === 'admin' && onAdminLogout && (
          <Button
            variant="outline"
            size="sm"
            icon="🚪"
            onClick={onAdminLogout}
            title="Log out of administrator session"
          >
            Sign Out
          </Button>
        )}

        {/* Student Logout button in Navbar if logged in */}
        {activeRole === 'student' && studentSession && onStudentLogout && (
          <Button
            variant="outline"
            size="sm"
            icon="🚪"
            onClick={onStudentLogout}
            title="Log out of student session"
          >
            Sign Out
          </Button>
        )}

        {/* Quick Role Switcher Pill */}
        <Button
          variant="secondary"
          size="sm"
          icon="⚡"
          onClick={onRoleToggle}
          title="Quick switch portal mode"
        >
          Switch to {activeRole === 'admin' ? 'Student' : 'Admin'}
        </Button>
      </div>
    </header>
  );
}

export default TopNavbar;

import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { TopNavbar } from './TopNavbar.jsx';

/**
 * Application Layout Component
 * Houses the responsive modern academic layout with Navy Blue sidebar and top navigation.
 */
export function AppLayout({
  activeRole,
  onRoleChange,
  activeNav,
  onNavChange,
  adminSession = null,
  onAdminLogout = null,
  studentSession = null,
  onStudentLogout = null,
  children
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleRoleToggle = () => {
    const nextRole = activeRole === 'admin' ? 'student' : 'admin';
    onRoleChange(nextRole);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-body)',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Sidebar */}
      <Sidebar
        activeRole={activeRole}
        onRoleChange={onRoleChange}
        activeNav={activeNav}
        onNavChange={onNavChange}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        adminSession={adminSession}
        onAdminLogout={onAdminLogout}
        studentSession={studentSession}
        onStudentLogout={onStudentLogout}
      />

      {/* Main Content Viewport */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh'
        }}
      >
        {/* Top Navbar */}
        <TopNavbar
          activeRole={activeRole}
          activeNav={activeNav}
          onRoleToggle={handleRoleToggle}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          adminSession={adminSession}
          onAdminLogout={onAdminLogout}
          studentSession={studentSession}
          onStudentLogout={onStudentLogout}
        />

        {/* Dynamic Page Container */}
        <main
          style={{
            flex: 1,
            padding: '1.75rem',
            maxWidth: '1380px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {children}
        </main>

        {/* Global Academic Footer */}
        <footer
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-surface)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <strong>Online Examination System</strong> © 2026. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
            <span>Academic Year 2026–2027</span>
            <span>•</span>
            <span style={{ color: 'var(--cyan-700)', fontWeight: 600 }}>Institutional Assessment Cell</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;

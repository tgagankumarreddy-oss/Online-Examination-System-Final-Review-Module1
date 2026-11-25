import React from 'react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/FormElements.jsx';
import { BrandLogo } from '../common/BrandLogo.jsx';

/**
 * Login Portal Entry View
 *
 * Implements Prompt 16 Requirement:
 * When the application opens without active credentials, provides two distinct options:
 * 1. Administrator Login
 * 2. Student Login
 */
export function LoginPortalEntryView({ onSelectAdmin, onSelectStudent }) {
  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--bg-body)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto' }}>
        {/* Brand & Academic Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <BrandLogo size="lg" variant="dark" />
          </div>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--navy-900)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            EduExam<span style={{ color: 'var(--cyan-600)' }}>Pro</span>
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.4rem',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--navy-100)',
              color: 'var(--navy-800)',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            <span>Department of Computer Science & Engineering</span>
            <span>•</span>
            <span>Academic Year 2026–2027</span>
          </div>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              marginTop: '0.75rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.5
            }}
          >
            Welcome to the Online Examination System. Please choose your portal below to proceed with authentication.
          </p>
        </div>

        {/* Dual Portal Selection Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {/* 1. ADMINISTRATOR PORTAL CARD */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--navy-100)',
                    color: 'var(--navy-900)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem'
                  }}
                >
                  👨‍🏫
                </div>
                <Badge variant="navy">FACULTY & EXAM CELL</Badge>
              </div>

              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--navy-900)',
                  letterSpacing: '-0.01em',
                  marginBottom: '0.5rem'
                }}
              >
                Administrator Login
              </h2>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '1.5rem'
                }}
              >
                Author examination questionnaires, configure scheduling parameters, manage question bank repositories, and review cohort performance analytics.
              </p>
            </div>

            <Button
              variant="navy"
              size="lg"
              fullWidth
              icon="🛡️"
              onClick={onSelectAdmin}
            >
              Enter Administrator Portal →
            </Button>
          </div>

          {/* 2. STUDENT PORTAL CARD */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--cyan-border)',
              boxShadow: 'var(--shadow-md)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--cyan-light)',
                    color: 'var(--cyan-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem'
                  }}
                >
                  👨‍🎓
                </div>
                <Badge variant="cyan">CANDIDATE ACCESS</Badge>
              </div>

              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--navy-900)',
                  letterSpacing: '-0.01em',
                  marginBottom: '0.5rem'
                }}
              >
                Student Login
              </h2>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '1.5rem'
                }}
              >
                Access enrolled assessments, attempt secure timed examinations with proctoring safeguards, and review instant evaluated transcripts.
              </p>
            </div>

            <Button
              variant="cyan"
              size="lg"
              fullWidth
              icon="🎓"
              onClick={onSelectStudent}
            >
              Enter Student Portal →
            </Button>
          </div>
        </div>

        {/* Academic Architecture Notice */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '1rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}
        >
          🔒 <strong>Frontend-Only Academic Capstone:</strong> All authentication sessions, questions, examinations, and evaluated records are persisted client-side in Browser LocalStorage without external databases or Node.js servers, strictly meeting capstone constraints.
        </div>
      </div>
    </div>
  );
}

export default LoginPortalEntryView;

import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Badge } from '../components/common/FormElements.jsx';
import {
  getStoredQuestions,
  getStoredExams,
  getStoredResults,
  getCurrentUser
} from '../utils/storage.js';

/**
 * Admin Dashboard View Component
 *
 * Sections:
 * 1. Dashboard Header: Heading, welcome message, clear academic description.
 * 2. Summary Cards: Total Questions, Total Examinations, Total Subjects, Total Examination Attempts (actual data).
 * 3. Quick Actions: Manage Questions, Add Questions, Create Examination, Manage Examinations.
 * 4. Recent Activity: Real examination configurations & verified submission audit from LocalStorage.
 * 5. Admin Navigation: Seamless navigation triggers to Question Bank and Exam Management.
 */
export function AdminDashboardView({ onNavigate }) {
  const [data, setData] = useState({
    questions: [],
    exams: [],
    results: [],
    currentUser: null
  });

  // Load real project data from LocalStorage
  useEffect(() => {
    const questions = getStoredQuestions();
    const exams = getStoredExams();
    const results = getStoredResults();
    const currentUser = getCurrentUser();

    setData({
      questions,
      exams,
      results,
      currentUser
    });
  }, []);

  // Compute actual project metrics (no invented values)
  const totalQuestions = data.questions.length;
  const totalExams = data.exams.length;
  const activeExamsCount = data.exams.filter((e) => e.status === 'Active').length;

  // Extract distinct subjects from actual question repository
  const uniqueSubjects = Array.from(
    new Set(data.questions.map((q) => q.subjectCode || q.course).filter(Boolean))
  );
  const totalSubjects = uniqueSubjects.length;

  // Total verified examination submissions
  const totalAttempts = data.results.length;

  // Format recent examination activity from actual records
  const examActivityColumns = [
    {
      key: 'code',
      label: 'Course Code',
      width: '120px',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{val}</span>
    },
    {
      key: 'title',
      label: 'Examination Name & Scope',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Category: {row.category}
          </div>
        </div>
      )
    },
    {
      key: 'durationMinutes',
      label: 'Duration',
      width: '110px',
      render: (val) => <span>⏱️ {val} mins</span>
    },
    {
      key: 'totalMarks',
      label: 'Total Marks',
      width: '100px',
      render: (val) => <span>{val} Marks</span>
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (val) => (
        <Badge variant={val === 'Active' ? 'success' : 'warning'}>
          {val}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Navigation',
      width: '120px',
      align: 'right',
      render: () => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate('admin_exams')}
          title="Open Exam Management"
        >
          View Exam
        </Button>
      )
    }
  ];

  // Submission activity columns from actual student results
  const attemptActivityColumns = [
    {
      key: 'studentRoll',
      label: 'Roll No',
      width: '110px',
      render: (val) => <span style={{ fontWeight: 700 }}>{val}</span>
    },
    {
      key: 'studentName',
      label: 'Candidate Name'
    },
    {
      key: 'examCode',
      label: 'Exam',
      width: '100px',
      render: (val) => <Badge variant="neutral">{val}</Badge>
    },
    {
      key: 'marksScored',
      label: 'Score Obtained',
      width: '130px',
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
          {val} / {row.totalMarks} ({row.percentage}%)
        </span>
      )
    },
    {
      key: 'passed',
      label: 'Result',
      width: '100px',
      render: (val) => (
        <Badge variant={val ? 'success' : 'danger'}>
          {val ? 'PASSED' : 'FAILED'}
        </Badge>
      )
    },
    {
      key: 'submittedAt',
      label: 'Submission Timestamp',
      render: (val) => (val ? new Date(val).toLocaleString() : 'N/A')
    }
  ];

  const adminName = data.currentUser?.name || 'Prof. R. Srinivasan';
  const adminDept = data.currentUser?.department || 'Department of Computer Science & Engineering';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Dashboard Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 60%, var(--navy-primary) 100%)',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Badge variant="cyan">ADMINISTRATOR CONTROL CENTRE</Badge>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Academic Year 2026–2027 • B.Tech CSE
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '0.35rem'
            }}
          >
            Welcome, {adminName}
          </h1>

          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: 'var(--cyan-border)',
              marginBottom: '0.35rem'
            }}
          >
            {adminDept}
          </div>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#cbd5e1',
              lineHeight: 1.5
            }}
          >
            Institutional administration interface for configuring computerized examinations,
            curating computer science question repositories, and monitoring candidate submission
            telemetry. All data persists client-side via LocalStorage.
          </p>
        </div>

        {/* Quick status pill */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.5rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success)',
                boxShadow: '0 0 8px var(--status-success)'
              }}
            />
            <span>System State: <strong>Online & Storage Ready</strong></span>
          </div>
        </div>
      </section>

      {/* 2. Summary Cards */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Total Questions Card */}
          <Card
            title="Total Questions"
            metric={totalQuestions}
            metricLabel="MCQ Items in Repository"
            icon="📚"
            badge={<Badge variant="cyan">{totalQuestions} Loaded</Badge>}
            footer={`Questions covering ${totalSubjects} curriculum subjects`}
          />

          {/* Total Examinations Card */}
          <Card
            title="Total Examinations"
            metric={totalExams}
            metricLabel="Registered Assessments"
            icon="📋"
            badge={<Badge variant="success">{activeExamsCount} Active</Badge>}
            footer="Configured Computer Science tests"
          />

          {/* Total Subjects Card */}
          <Card
            title="Total Subjects"
            metric={totalSubjects}
            metricLabel="Distinct Course Modules"
            icon="📖"
            badge={<Badge variant="navy">Core CSE</Badge>}
            footer={uniqueSubjects.join(' • ') || 'No subjects registered'}
          />

          {/* Total Examination Attempts Card */}
          <Card
            title="Total Examination Attempts"
            metric={totalAttempts}
            metricLabel="Candidate Test Submissions"
            icon="👥"
            badge={<Badge variant={totalAttempts > 0 ? 'success' : 'neutral'}>{totalAttempts} Logged</Badge>}
            footer="Evaluated via client evaluation engine"
          />
        </div>
      </section>

      {/* 3. Quick Actions Section */}
      <section>
        <div style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)' }}>
            Administrative Quick Actions
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Instant navigation shortcuts to core question authoring and examination management workflows.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Action 1: Manage Questions */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--navy-light)',
                  color: 'var(--navy-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}
              >
                📚
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Manage Questions
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Search, filter, and inspect the complete repository of examination questions.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              icon="🔍"
              onClick={() => onNavigate('admin_questions')}
            >
              Open Question Bank
            </Button>
          </div>

          {/* Action 2: Add Questions */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--cyan-light)',
                  color: 'var(--cyan-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}
              >
                ➕
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Add Questions
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Author and insert new multiple-choice questions into the curriculum bank.
                </p>
              </div>
            </div>
            <Button
              variant="cyan"
              size="sm"
              fullWidth
              icon="➕"
              onClick={() => onNavigate('admin_questions')}
            >
              Go to Question Authoring
            </Button>
          </div>

          {/* Action 3: Create Examination */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}
              >
                📝
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Create Examination
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Schedule new timed tests with custom mark rules and negative scoring.
                </p>
              </div>
            </div>
            <Button
              variant="cyan"
              size="sm"
              fullWidth
              icon="📝"
              onClick={() => onNavigate('admin_exams')}
            >
              Configure New Exam
            </Button>
          </div>

          {/* Action 4: Manage Examinations */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#f1f5f9',
                  color: 'var(--navy-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}
              >
                ⚙️
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Manage Examinations
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Toggle live availability, adjust passing criteria, and review test status.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon="⚙️"
              onClick={() => onNavigate('admin_exams')}
            >
              Open Exam Management
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Recent Activity: Actual Project Records */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Actual Configured Examinations */}
        <Card
          title="Recent Examination Configurations"
          subtitle="Actual curriculum assessments currently registered in the database"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('admin_exams')}
            >
              View Full Exam Registry
            </Button>
          }
        >
          <Table
            columns={examActivityColumns}
            data={data.exams}
            emptyMessage="No examinations configured in LocalStorage."
          />
        </Card>

        {/* Actual Candidate Submission Activity if available */}
        {data.results.length > 0 && (
          <Card
            title="Recent Candidate Submissions"
            subtitle="Actual evaluated examination attempts recorded in LocalStorage"
            action={
              <Button
                variant="cyan"
                size="sm"
                icon="📊"
                onClick={() => onNavigate('admin_results')}
              >
                View Results & Analytics Console
              </Button>
            }
          >
            <Table
              columns={attemptActivityColumns}
              data={data.results}
              emptyMessage="No examination attempts submitted yet."
            />
          </Card>
        )}
      </section>
    </div>
  );
}

export default AdminDashboardView;

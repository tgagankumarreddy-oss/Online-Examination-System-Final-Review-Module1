import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Input, Select, Badge } from '../components/common/FormElements.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { getStoredResults, getStoredExams, deleteExamResult } from '../utils/storage.js';
import { evaluateExamAttempt } from '../utils/evaluation.js';

function formatElapsed(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins === 0) return `${rem}s`;
  return `${mins}m ${rem}s`;
}

/**
 * Admin Results & Institutional Analytics View Component
 *
 * Implements Prompt 15 Requirements:
 * 1. Institutional Performance Overview: Total submissions, pass rate, average score, high/low score.
 * 2. Multi-Criteria Live Search & Filtering: By examination, student name/roll, pass/fail status, and submission mode.
 * 3. Academic Grade Distribution Visualization: Distinction, First Class, Second Class, Pass, and Fail breakdowns.
 * 4. Comprehensive Results Table: Full candidate attempt records with telemetry.
 * 5. Full Scorecard Inspection Modal: Question-by-question review, student choice vs correct keys, security logs.
 * 6. Deletion Safeguard: Remove individual erroneous test submissions with confirmation.
 */
export function AdminResultsAnalyticsView({ onNavigate }) {
  const [resultsList, setResultsList] = useState(() => getStoredResults());
  const [examsList, setExamsList] = useState(() => getStoredExams());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedModeFilter, setSelectedModeFilter] = useState('ALL');

  // Inspector Modal State
  const [inspectedResult, setInspectedResult] = useState(null);
  const [inspectorFilter, setInspectorFilter] = useState('ALL');

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Feedback Notification Toast
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  useEffect(() => {
    setResultsList(getStoredResults());
    setExamsList(getStoredExams());
  }, []);

  // Format and ensure all results are evaluated
  const evaluatedResults = useMemo(() => {
    return resultsList.map((res) => {
      if (Array.isArray(res.questionEvaluations) && res.questionEvaluations.length > 0) {
        return res;
      }
      return evaluateExamAttempt(res);
    });
  }, [resultsList]);

  // Exam dropdown filter options
  const examFilterOptions = useMemo(() => {
    const uniqueExams = new Map();
    examsList.forEach((e) => {
      uniqueExams.set(e.id || e.code, `${e.code}: ${e.title}`);
    });
    // Also include any exam IDs in results not in current examsList
    evaluatedResults.forEach((r) => {
      if (r.examId && !uniqueExams.has(r.examId)) {
        uniqueExams.set(r.examId, `${r.examCode || 'CS'}: ${r.examTitle}`);
      }
    });

    return [
      { value: 'ALL', label: 'All Examinations' },
      ...Array.from(uniqueExams.entries()).map(([id, label]) => ({
        value: id,
        label
      }))
    ];
  }, [examsList, evaluatedResults]);

  // Filtered Results List
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return evaluatedResults.filter((r) => {
      const matchesSearch =
        q === '' ||
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.studentRoll && r.studentRoll.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.examTitle && r.examTitle.toLowerCase().includes(q)) ||
        (r.examCode && r.examCode.toLowerCase().includes(q));

      const matchesExam =
        selectedExamFilter === 'ALL' ||
        r.examId === selectedExamFilter ||
        r.examCode === selectedExamFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'PASSED' && r.passed) ||
        (selectedStatusFilter === 'FAILED' && !r.passed);

      const matchesMode =
        selectedModeFilter === 'ALL' ||
        r.submissionType === selectedModeFilter;

      return matchesSearch && matchesExam && matchesStatus && matchesMode;
    });
  }, [evaluatedResults, searchQuery, selectedExamFilter, selectedStatusFilter, selectedModeFilter]);

  // Institutional Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredResults.length;
    if (total === 0) {
      return { total: 0, passCount: 0, failCount: 0, passRate: 0, avgScore: 0, avgPct: 0, highPct: 0, lowPct: 0 };
    }

    const passCount = filteredResults.filter((r) => r.passed).length;
    const failCount = total - passCount;
    const passRate = Number(((passCount / total) * 100).toFixed(1));

    const totalPct = filteredResults.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
    const avgPct = Number((totalPct / total).toFixed(1));

    const totalScore = filteredResults.reduce((acc, r) => acc + (Number(r.marksScored) || 0), 0);
    const avgScore = Number((totalScore / total).toFixed(1));

    const percentages = filteredResults.map((r) => Number(r.percentage) || 0);
    const highPct = Math.max(...percentages);
    const lowPct = Math.min(...percentages);

    return { total, passCount, failCount, passRate, avgScore, avgPct, highPct, lowPct };
  }, [filteredResults]);

  // Grade Distribution
  const gradeDistribution = useMemo(() => {
    const counts = { O: 0, A_PLUS: 0, A: 0, B_PLUS: 0, B: 0, C: 0, F: 0 };
    filteredResults.forEach((r) => {
      const pct = Number(r.percentage) || 0;
      if (pct >= 90) counts.O++;
      else if (pct >= 80) counts.A_PLUS++;
      else if (pct >= 70) counts.A++;
      else if (pct >= 60) counts.B_PLUS++;
      else if (pct >= 50) counts.B++;
      else if (pct >= 40) counts.C++;
      else counts.F++;
    });
    return counts;
  }, [filteredResults]);

  // Handle Delete Confirmation
  const confirmDeleteResult = () => {
    if (!deleteTarget) return;
    deleteExamResult(deleteTarget.id);
    const updated = resultsList.filter((r) => r.id !== deleteTarget.id);
    setResultsList(updated);
    setDeleteTarget(null);
    if (inspectedResult?.id === deleteTarget.id) {
      setInspectedResult(null);
    }
    showFeedback(`Result "${deleteTarget.id}" was successfully deleted from system records.`, 'warning');
  };

  // Inspect Modal Question Filter
  const inspectedQuestionList = useMemo(() => {
    if (!inspectedResult || !Array.isArray(inspectedResult.questionEvaluations)) return [];
    const list = inspectedResult.questionEvaluations;
    switch (inspectorFilter) {
      case 'CORRECT':
        return list.filter((q) => q.status === 'correct');
      case 'INCORRECT':
        return list.filter((q) => q.status === 'incorrect');
      case 'UNATTEMPTED':
        return list.filter((q) => q.status === 'unattempted');
      default:
        return list;
    }
  }, [inspectedResult, inspectorFilter]);

  // Table Columns
  const columns = [
    {
      key: 'id',
      label: 'Attempt ID',
      width: '100px',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'var(--navy-900)' }}>
          {val}
        </span>
      )
    },
    {
      key: 'studentName',
      label: 'Candidate Details',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Roll: <strong>{row.studentRoll}</strong> • ID: {row.studentId}
          </div>
        </div>
      )
    },
    {
      key: 'examTitle',
      label: 'Examination',
      render: (val, row) => (
        <div>
          <Badge variant="cyan">{row.examCode}</Badge>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy-900)', marginTop: '0.2rem' }}>
            {val}
          </div>
        </div>
      )
    },
    {
      key: 'marksScored',
      label: 'Score Obtained',
      width: '130px',
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
          {val} / {row.totalMarks}
        </span>
      )
    },
    {
      key: 'percentage',
      label: 'Percentage',
      width: '120px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--cyan-700)' }}>{val}%</span>
          {row.grade && (
            <Badge variant="cyan" style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem' }}>
              {row.grade}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'passed',
      label: 'Status',
      width: '110px',
      render: (val) => (
        <Badge variant={val ? 'success' : 'danger'}>
          {val ? 'PASSED' : 'FAILED'}
        </Badge>
      )
    },
    {
      key: 'submissionType',
      label: 'Mode & Violations',
      width: '140px',
      render: (val, row) => (
        <div style={{ fontSize: '0.75rem' }}>
          <div>
            {val === 'auto_timer' ? (
              <Badge variant="warning">Auto (Timer)</Badge>
            ) : val === 'auto_security' ? (
              <Badge variant="danger">Auto (Security)</Badge>
            ) : (
              <Badge variant="secondary">Manual</Badge>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Warnings: <strong>{row.warningCount ?? row.blurViolations ?? 0}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'submittedAt',
      label: 'Submitted At',
      width: '160px',
      render: (val, row) => (
        <div style={{ fontSize: '0.8rem', color: 'var(--navy-800)' }}>
          <div>{new Date(val).toLocaleDateString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ⏱️ {formatElapsed(row.timeTakenSeconds)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <Button
            variant="cyan"
            size="sm"
            icon="🔎"
            onClick={() => {
              setInspectedResult(row);
              setInspectorFilter('ALL');
            }}
            title="Inspect full candidate scorecard and answers"
          >
            Inspect
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            title="Delete attempt record"
            style={{ color: '#ef4444' }}
          >
            🗑️
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Toast Alert */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: feedback.type === 'warning' ? '#fef2f2' : '#ecfdf5',
            color: feedback.type === 'warning' ? '#b91c1c' : '#047857',
            border: `1px solid ${feedback.type === 'warning' ? '#fca5a5' : '#a7f3d0'}`,
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Badge variant="cyan">ADMIN EVALUATION CONSOLE</Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Module 3: Results & Analytics</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
            Institutional Examination Results & Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Live evaluation transcripts, pass/fail grading audits, question-wise answer inspections, and cohort analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            icon="🖨️"
            onClick={() => window.print()}
            title="Print Class Summary Report"
          >
            Print Report
          </Button>
          {onNavigate && (
            <Button
              variant="secondary"
              size="sm"
              icon="📊"
              onClick={() => onNavigate('admin_dashboard')}
            >
              Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card
          title="Total Attempts"
          metric={summaryMetrics.total}
          metricLabel="Verified Submissions"
        />
        <Card
          title="Cohort Pass Rate"
          metric={`${summaryMetrics.passRate}%`}
          metricLabel={`${summaryMetrics.passCount} Passed • ${summaryMetrics.failCount} Failed`}
        />
        <Card
          title="Class Average"
          metric={`${summaryMetrics.avgPct}%`}
          metricLabel={`Avg Marks: ${summaryMetrics.avgScore}`}
        />
        <Card
          title="Score Range"
          metric={`${summaryMetrics.highPct}%`}
          metricLabel={`Highest: ${summaryMetrics.highPct}% • Lowest: ${summaryMetrics.lowPct}%`}
        />
      </div>

      {/* Grade Distribution Bar Strip */}
      <Card
        title="Institutional Grade Classification Breakdown"
        subtitle="Distribution of evaluated attempts across standard academic classifications"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>O (Outstanding ≥90%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46' }}>{gradeDistribution.O}</div>
          </div>
          <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>A+ (Excellent 80-89%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534' }}>{gradeDistribution.A_PLUS}</div>
          </div>
          <div style={{ backgroundColor: '#f0f9ff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>A (Very Good 70-79%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#075985' }}>{gradeDistribution.A}</div>
          </div>
          <div style={{ backgroundColor: '#ecfeff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a5f3fc' }}>
            <div style={{ fontSize: '0.75rem', color: '#0e7490', fontWeight: 700 }}>B+ (Good 60-69%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#155e75' }}>{gradeDistribution.B_PLUS}</div>
          </div>
          <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>Pass (C/B 40-59%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e' }}>{gradeDistribution.B + gradeDistribution.C}</div>
          </div>
          <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700 }}>Needs Re-eval (&lt;40%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b' }}>{gradeDistribution.F}</div>
          </div>
        </div>
      </Card>

      {/* Filter and Search Controls */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <Input
            label="Search Candidate or Attempt"
            placeholder="Search by Name, Roll No, Attempt ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix="🔍"
          />

          <Select
            label="Filter by Examination"
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            options={examFilterOptions}
          />

          <Select
            label="Evaluation Status"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Evaluations' },
              { value: 'PASSED', label: 'Passed / Qualified' },
              { value: 'FAILED', label: 'Failed / Needs Re-eval' }
            ]}
          />

          <Select
            label="Submission Mode"
            value={selectedModeFilter}
            onChange={(e) => setSelectedModeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Submission Modes' },
              { value: 'manual', label: 'Manual Submission' },
              { value: 'auto_timer', label: 'Auto (Timer Expiry)' },
              { value: 'auto_security', label: 'Auto (Security Threshold)' }
            ]}
          />
        </div>
      </Card>

      {/* Results Table */}
      <Card
        title="Candidate Examination Submissions Roster"
        subtitle={`Showing ${filteredResults.length} of ${evaluatedResults.length} evaluated attempt(s)`}
      >
        <Table
          columns={columns}
          data={filteredResults}
          emptyMessage="No student examination attempts match the specified search or filter criteria."
        />
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* SCORECARD INSPECTION MODAL                                    */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(inspectedResult)}
        onClose={() => setInspectedResult(null)}
        title={inspectedResult ? `Scorecard Audit • ${inspectedResult.studentName} (${inspectedResult.studentRoll})` : 'Audit Scorecard'}
        subtitle={inspectedResult ? `${inspectedResult.examCode}: ${inspectedResult.examTitle} • Attempt: ${inspectedResult.id}` : ''}
        maxWidth="840px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              icon="🖨️"
              onClick={() => window.print()}
            >
              Print Transcript
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setInspectedResult(null)}
            >
              Close Audit Inspector
            </Button>
          </div>
        }
      >
        {inspectedResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            {/* Header Telemetry Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-body)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score Obtained:</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {inspectedResult.marksScored} / {inspectedResult.totalMarks}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Percentage:</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--cyan-700)' }}>
                  {inspectedResult.percentage}% ({inspectedResult.grade || 'Evaluated'})
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accuracy:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                  {inspectedResult.correctCount} Correct • <span style={{ color: '#ef4444' }}>{inspectedResult.wrongCount || 0} Wrong</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status / Violations:</span>
                <div>
                  <Badge variant={inspectedResult.passed ? 'success' : 'danger'}>
                    {inspectedResult.passed ? 'QUALIFIED' : 'FAILED'}
                  </Badge>
                  <span style={{ fontSize: '0.75rem', marginLeft: '0.4rem', color: 'var(--text-muted)' }}>
                    ({inspectedResult.warningCount ?? inspectedResult.blurViolations ?? 0} Warnings)
                  </span>
                </div>
              </div>
            </div>

            {/* Question Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setInspectorFilter('ALL')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: inspectorFilter === 'ALL' ? 'var(--navy-900)' : 'var(--bg-body)',
                  color: inspectorFilter === 'ALL' ? '#ffffff' : 'var(--navy-800)',
                  border: '1px solid var(--border-light)'
                }}
              >
                All Questions ({inspectedResult.questionEvaluations?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setInspectorFilter('CORRECT')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: inspectorFilter === 'CORRECT' ? '#10b981' : 'var(--bg-body)',
                  color: inspectorFilter === 'CORRECT' ? '#ffffff' : '#059669',
                  border: '1px solid #a7f3d0'
                }}
              >
                ✓ Correct ({inspectedResult.correctCount || 0})
              </button>
              <button
                type="button"
                onClick={() => setInspectorFilter('INCORRECT')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: inspectorFilter === 'INCORRECT' ? '#ef4444' : 'var(--bg-body)',
                  color: inspectorFilter === 'INCORRECT' ? '#ffffff' : '#dc2626',
                  border: '1px solid #fca5a5'
                }}
              >
                ✗ Incorrect ({inspectedResult.wrongCount || 0})
              </button>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {inspectedQuestionList.map((q) => {
                const isCorrect = q.status === 'correct';
                const isIncorrect = q.status === 'incorrect';

                return (
                  <div
                    key={q.questionId}
                    style={{
                      border: `1px solid ${isCorrect ? '#86efac' : isIncorrect ? '#fca5a5' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        Q{q.questionNumber}: {q.topic}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isCorrect ? '#059669' : isIncorrect ? '#dc2626' : '#64748b' }}>
                        {isCorrect ? `✓ Correct (+${q.maxMarks})` : isIncorrect ? `✗ Incorrect (-${q.negativeMarks})` : '— Unattempted'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--navy-900)' }}>
                      {q.questionText}
                    </div>

                    {/* Technical Diagram if present */}
                    {q.imageUrl && (
                      <div style={{ margin: '0.5rem 0', textAlign: 'center' }}>
                        <img
                          src={q.imageUrl}
                          alt="Question Diagram"
                          style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '4px' }}
                        />
                      </div>
                    )}

                    {q.type === 'numeric' ? (
                      <div
                        style={{
                          backgroundColor: isCorrect ? '#ecfdf5' : isIncorrect ? '#fef2f2' : 'var(--bg-body)',
                          padding: '0.75rem 1rem',
                          borderRadius: '4px',
                          border: `1px solid ${isCorrect ? '#86efac' : isIncorrect ? '#fca5a5' : 'var(--border-light)'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Candidate Value: </span>
                          <strong style={{ color: isCorrect ? '#059669' : isIncorrect ? '#dc2626' : '#64748b' }}>
                            {q.selectedOptionText !== null && q.selectedOptionText !== undefined && String(q.selectedOptionText).trim() !== ''
                              ? q.selectedOptionText
                              : '(Unattempted)'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Institutional Key: </span>
                          <strong style={{ color: '#059669' }}>{q.correctOptionText || q.correctNumericAnswer || 'N/A'}</strong>
                          {Number(q.tolerance) > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> (±{q.tolerance})</span>}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {Array.isArray(q.options) && q.options.map((opt, optIdx) => {
                          const isCorrectKey = optIdx === q.correctOptionIndex;
                          const isUserChoice = optIdx === q.selectedOptionIndex;
                          const letter = String.fromCharCode(65 + optIdx);

                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: '0.45rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.825rem',
                                backgroundColor: isCorrectKey ? '#ecfdf5' : isUserChoice ? '#fef2f2' : 'var(--bg-body)',
                                border: `1px solid ${isCorrectKey ? '#86efac' : isUserChoice ? '#fca5a5' : 'var(--border-light)'}`,
                                display: 'flex',
                                justifyContent: 'space-between'
                              }}
                            >
                              <span><strong>{letter}.</strong> {opt}</span>
                              {isCorrectKey && <span style={{ color: '#059669', fontWeight: 700 }}>✓ Key</span>}
                              {isUserChoice && !isCorrectKey && <span style={{ color: '#dc2626', fontWeight: 700 }}>✗ Candidate Choice</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.explanation && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#1e3a8a', backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '4px' }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Record Deletion"
        maxWidth="460px"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              icon="🗑️"
              onClick={confirmDeleteResult}
            >
              Delete Record Permanently
            </Button>
          </>
        }
      >
        <div style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>
          <p>
            Are you sure you want to delete the submission record for <strong>{deleteTarget?.studentName}</strong> ({deleteTarget?.examCode}: {deleteTarget?.examTitle})?
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--status-danger)', margin: 0 }}>
            ⚠️ This will remove the attempt from institutional reports and student transcripts in LocalStorage.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminResultsAnalyticsView;

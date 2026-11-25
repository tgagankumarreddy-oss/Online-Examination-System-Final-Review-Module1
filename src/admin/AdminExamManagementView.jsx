import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Input, Select, Textarea, Badge } from '../components/common/FormElements.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { INITIAL_EXAMS } from '../data/seedData.js';
import {
  getStoredExams,
  saveExam,
  deleteExam,
  toggleExamStatus,
  saveStoredExams,
  getStoredQuestions,
  getStoredResults
} from '../utils/storage.js';

/**
 * Generates collision-free Exam IDs (e.g. exam_1, exam_2, exam_4)
 * @param {Array} existingExams
 * @returns {string} Unique Exam ID
 */
function generateUniqueExamId(existingExams = []) {
  let counter = existingExams.length + 1;
  let candidate = `exam_${counter}`;
  while (existingExams.some((e) => e.id === candidate)) {
    counter++;
    candidate = `exam_${counter}`;
  }
  return candidate;
}

/**
 * Admin Exam Management View Component
 *
 * Implements Prompt 7 Requirements:
 * 1. Exam Creation Form: Name, Subject, Description, Duration, Total Marks, Passing Marks, Attempt Policy.
 * 2. Question Selection: Multi-select from Question Bank, remove questions, count tracking, marks sum calculation & mismatch explanation.
 * 3. Examination List: Exam ID, Name, Subject, Duration, Total Marks, Passing Marks, Number of Questions, Attempt Policy.
 * 4. Edit Examination: Full modification with preserved ID and question selection.
 * 5. Delete Examination: Safe deletion with historical student results safeguard check.
 * 6. Local Storage Persistence: Full CRUD bound to oes_exams.
 * 7. Professional Academic UI with Navy/Cyan theme, search, and validation feedback.
 */
export function AdminExamManagementView({ onNavigate }) {
  // Load questions pool from storage to associate with exams
  const [questionsPool] = useState(() => getStoredQuestions());

  // Load exams from LocalStorage with auto-normalization for questionIds & attemptPolicy
  const [examsList, setExamsList] = useState(() => {
    const stored = getStoredExams();
    const baseExams = stored && stored.length > 0 ? stored : INITIAL_EXAMS;

    // Normalize exams to ensure questionIds & attemptPolicy exist
    const normalized = baseExams.map((exam) => {
      let qIds = exam.questionIds;
      if (!Array.isArray(qIds)) {
        // Link to existing questions with matching subject code or examId
        const matched = questionsPool.filter(
          (q) => q.subjectCode === exam.code || q.examId === exam.id
        );
        qIds = matched.map((q) => q.id);
      }
      return {
        ...exam,
        questionIds: qIds,
        attemptPolicy: exam.attemptPolicy || 'Single Attempt',
        description:
          exam.description ||
          (Array.isArray(exam.instructions) ? exam.instructions.join(' ') : 'Standard computerized assessment.')
      };
    });

    return normalized;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingExamId, setEditingExamId] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    exam: null,
    historicalResults: []
  });

  // Restore Seed Exams Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Inspector Drawer State
  const [inspectedExamId, setInspectedExamId] = useState(null);

  // Feedback Notification Toast
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Predefined subjects for the form
  const subjectOptions = [
    { value: 'CS-301|Data Structures & Algorithms', label: 'CS-301: Data Structures & Algorithms' },
    { value: 'CS-402|Operating Systems', label: 'CS-402: Operating Systems' },
    { value: 'CS-503|Database Management Systems', label: 'CS-503: Database Management Systems' },
    { value: 'CS-601|Computer Networks', label: 'CS-601: Computer Networks' },
    { value: 'CS-702|Software Engineering', label: 'CS-702: Software Engineering' }
  ];

  // 1. Exam Form State
  const initialFormState = {
    title: '',
    code: 'CS-301',
    subjectName: 'Data Structures & Algorithms',
    category: 'Core CSE',
    description: '',
    durationMinutes: 15,
    totalMarks: 6,
    passingMarks: 4,
    attemptPolicy: 'Single Attempt',
    negativeMarking: 0.25,
    questionType: 'Mixed', // 'MCQ' | 'Numeric' | 'Mixed'
    numberOfQuestions: 5,
    marksPerQuestion: 2.0,
    randomizeQuestions: true,
    allowQuestionImages: true,
    status: 'Active',
    selectedQuestionIds: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Question selection search filter within modal
  const [modalQuestionSearch, setModalQuestionSearch] = useState('');
  const [modalSubjectFilter, setModalSubjectFilter] = useState('ALL');

  // Calculate sum of marks of currently selected questions in modal
  const selectedQuestionsObjects = useMemo(() => {
    return questionsPool.filter((q) => formData.selectedQuestionIds.includes(q.id));
  }, [questionsPool, formData.selectedQuestionIds]);

  const selectedMarksSum = useMemo(() => {
    return selectedQuestionsObjects.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
  }, [selectedQuestionsObjects]);

  // Sync state back to storage if modified
  useEffect(() => {
    saveStoredExams(examsList);
  }, [examsList]);

  // -------------------------------------------------------------
  // FILTERING EXAMS LIST
  // -------------------------------------------------------------

  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return examsList.filter((exam) => {
      const matchesSearch =
        q === '' ||
        (exam.title && exam.title.toLowerCase().includes(q)) ||
        (exam.code && exam.code.toLowerCase().includes(q)) ||
        (exam.category && exam.category.toLowerCase().includes(q)) ||
        (exam.id && exam.id.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' || exam.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [examsList, searchQuery, statusFilter]);

  // -------------------------------------------------------------
  // FORM HANDLING: CREATE & EDIT
  // -------------------------------------------------------------

  const openCreateModal = () => {
    setFormMode('create');
    setEditingExamId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setModalQuestionSearch('');
    setModalSubjectFilter('CS-301'); // Default subject filter to match initial selection
    setIsFormModalOpen(true);
  };

  const openEditModal = (exam) => {
    setFormMode('edit');
    setEditingExamId(exam.id);
    setFormData({
      title: exam.title || '',
      code: exam.code || 'CS-301',
      subjectName: exam.subjectName || exam.category || 'Data Structures & Algorithms',
      category: exam.category || 'Core CSE',
      description: exam.description || '',
      durationMinutes: exam.durationMinutes || 15,
      totalMarks: exam.totalMarks || 10,
      passingMarks: exam.passingMarks || 4,
      attemptPolicy: exam.attemptPolicy || 'Single Attempt',
      negativeMarking: exam.negativeMarking ?? 0.25,
      questionType: exam.questionType || 'Mixed',
      numberOfQuestions: exam.numberOfQuestions || (Array.isArray(exam.questionIds) ? exam.questionIds.length : 5),
      marksPerQuestion: exam.marksPerQuestion || 2.0,
      randomizeQuestions: exam.randomizeQuestions !== false,
      allowQuestionImages: exam.allowQuestionImages !== false,
      status: exam.status || 'Active',
      selectedQuestionIds: Array.isArray(exam.questionIds) ? [...exam.questionIds] : []
    });
    setFormErrors({});
    setModalQuestionSearch('');
    setModalSubjectFilter('ALL');
    setIsFormModalOpen(true);
  };

  // Question Picker Toggle
  const toggleQuestionSelection = (questionId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedQuestionIds.includes(questionId);
      const nextIds = isSelected
        ? prev.selectedQuestionIds.filter((id) => id !== questionId)
        : [...prev.selectedQuestionIds, questionId];
      return { ...prev, selectedQuestionIds: nextIds };
    });
  };

  // Auto-sync Total Marks button helper
  const handleSyncTotalMarks = () => {
    setFormData((prev) => ({
      ...prev,
      totalMarks: selectedMarksSum,
      passingMarks: Math.max(1, Math.floor(selectedMarksSum * 0.4))
    }));
  };

  // Form Validation Engine
  const validateForm = () => {
    const errors = {};

    if (!formData.title || formData.title.trim().length < 4) {
      errors.title = 'Examination Name must be at least 4 characters long.';
    }
    if (!formData.code || !formData.code.trim()) {
      errors.code = 'Subject / Course Code is required.';
    }
    if (!formData.description || formData.description.trim().length < 8) {
      errors.description = 'Please provide an examination description or instructions (min 8 chars).';
    }
    if (formData.durationMinutes === '' || Number(formData.durationMinutes) < 5) {
      errors.durationMinutes = 'Duration must be at least 5 minutes.';
    }
    if (formData.totalMarks === '' || Number(formData.totalMarks) <= 0) {
      errors.totalMarks = 'Total Marks must be greater than 0.';
    }
    if (formData.passingMarks === '' || Number(formData.passingMarks) <= 0) {
      errors.passingMarks = 'Passing Marks must be greater than 0.';
    } else if (Number(formData.passingMarks) > Number(formData.totalMarks)) {
      errors.passingMarks = 'Passing Marks cannot exceed Total Marks.';
    }
    if (formData.selectedQuestionIds.length === 0) {
      errors.selectedQuestionIds = 'Please select at least 1 question from the Question Bank for this examination.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const targetId = formMode === 'edit' ? editingExamId : generateUniqueExamId(examsList);

    const examPayload = {
      id: targetId,
      code: formData.code.trim(),
      title: formData.title.trim(),
      category: formData.category.trim(),
      subjectName: formData.subjectName.trim(),
      description: formData.description.trim(),
      durationMinutes: Number(formData.durationMinutes),
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks),
      attemptPolicy: formData.attemptPolicy,
      negativeMarking: Number(formData.negativeMarking),
      questionType: formData.questionType || 'Mixed',
      numberOfQuestions: formData.selectedQuestionIds.length || Number(formData.numberOfQuestions) || 5,
      marksPerQuestion: Number(formData.marksPerQuestion) || 2.0,
      randomizeQuestions: Boolean(formData.randomizeQuestions),
      allowQuestionImages: Boolean(formData.allowQuestionImages),
      status: formData.status,
      questionIds: formData.selectedQuestionIds,
      instructions: [
        `Duration: ${formData.durationMinutes} minutes. The countdown timer runs automatically upon entry.`,
        `Passing cutoff: ${formData.passingMarks} of ${formData.totalMarks} marks.`,
        `Format: ${formData.questionType || 'Mixed'} questions.`,
        `Policy: ${formData.attemptPolicy}.`,
        `Negative Marking: ${formData.negativeMarking > 0 ? `-${formData.negativeMarking} per incorrect answer` : 'None'}.`
      ]
    };

    const updated = saveExam(examPayload);
    setExamsList(updated);
    setIsFormModalOpen(false);

    showFeedback(
      formMode === 'create'
        ? `Examination "${examPayload.title}" created successfully with ${examPayload.questionIds.length} questions!`
        : `Examination "${editingExamId}" updated successfully!`
    );
  };

  // -------------------------------------------------------------
  // TOGGLE STATUS
  // -------------------------------------------------------------

  const handleToggleStatus = (examId) => {
    const updated = toggleExamStatus(examId);
    setExamsList(updated);
    const target = updated.find((e) => e.id === examId);
    showFeedback(`Exam "${target.code}" status changed to ${target.status}.`, 'info');
  };

  // -------------------------------------------------------------
  // DELETE HANDLING (SAFEGUARDING STUDENT RESULTS)
  // -------------------------------------------------------------

  const openDeleteModal = (exam) => {
    // Check if any historical student submissions exist for this exam
    const results = getStoredResults();
    const historicalResults = results.filter(
      (r) => r.examId === exam.id || r.examCode === exam.code || r.examTitle === exam.title
    );

    setDeleteModalState({
      isOpen: true,
      exam,
      historicalResults
    });
  };

  const confirmDelete = () => {
    const examId = deleteModalState.exam?.id;
    if (!examId) return;

    const updated = deleteExam(examId);
    setExamsList(updated);

    if (inspectedExamId === examId) {
      setInspectedExamId(null);
    }

    setDeleteModalState({ isOpen: false, exam: null, historicalResults: [] });
    showFeedback(`Examination "${examId}" deleted. Historical scorecards remain preserved in LocalStorage.`, 'warning');
  };

  // -------------------------------------------------------------
  // RESTORE DEFAULT CSE EXAMS
  // -------------------------------------------------------------

  const confirmRestoreDefaults = () => {
    saveStoredExams(INITIAL_EXAMS);
    setExamsList(INITIAL_EXAMS);
    setIsRestoreModalOpen(false);
    showFeedback('Restored default 3 computer science examinations from seedData.', 'info');
  };

  // -------------------------------------------------------------
  // TABLE COLUMNS CONFIGURATION
  // -------------------------------------------------------------

  const columns = [
    {
      key: 'id',
      label: 'Exam ID',
      width: '90px',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {val}
        </span>
      )
    },
    {
      key: 'title',
      label: 'Examination Name',
      render: (val, row) => (
        <div style={{ maxWidth: '320px' }}>
          <div style={{ fontWeight: 700, color: 'var(--navy-900)', lineHeight: 1.3 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {row.description ? `${row.description.slice(0, 70)}...` : row.category}
          </div>
        </div>
      )
    },
    {
      key: 'code',
      label: 'Subject',
      width: '140px',
      render: (val, row) => (
        <div>
          <Badge variant="cyan">{val}</Badge>
          <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', marginTop: '0.25rem', fontWeight: 500 }}>
            {row.category || 'Core CSE'}
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
      width: '110px',
      render: (val) => <span style={{ fontWeight: 700 }}>{val} Marks</span>
    },
    {
      key: 'passingMarks',
      label: 'Pass Cutoff',
      width: '100px',
      render: (val) => <span>{val} Marks</span>
    },
    {
      key: 'questionIds',
      label: 'Questions',
      width: '110px',
      render: (qIds) => {
        const count = Array.isArray(qIds) ? qIds.length : 0;
        return (
          <Badge variant={count > 0 ? 'navy' : 'warning'}>
            {count} {count === 1 ? 'Question' : 'Questions'}
          </Badge>
        );
      }
    },
    {
      key: 'attemptPolicy',
      label: 'Attempt Policy',
      width: '130px',
      render: (val) => (
        <Badge variant={val === 'Multiple Attempts' ? 'cyan' : 'neutral'}>
          {val || 'Single Attempt'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '95px',
      render: (val) => (
        <Badge variant={val === 'Active' ? 'success' : 'warning'}>
          {val}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '230px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button
            variant={inspectedExamId === row.id ? 'cyan' : 'secondary'}
            size="sm"
            onClick={() => setInspectedExamId(inspectedExamId === row.id ? null : row.id)}
            title="Inspect full examination details"
          >
            {inspectedExamId === row.id ? 'Hide' : 'Details'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
            title="Edit examination configuration"
          >
            Edit
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleToggleStatus(row.id)}
            title="Toggle Live / Inactive"
          >
            {row.status === 'Active' ? 'Pause' : 'Activate'}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => openDeleteModal(row)}
            title="Delete this examination"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Inspected Exam Object
  const inspectedExam = examsList.find((e) => e.id === inspectedExamId);

  // Filtered pool of questions in modal question picker
  const modalFilteredQuestions = useMemo(() => {
    const q = modalQuestionSearch.trim().toLowerCase();
    return questionsPool.filter((item) => {
      const matchSearch =
        q === '' ||
        (item.question && item.question.toLowerCase().includes(q)) ||
        (item.topic && item.topic.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q));

      const matchSubject =
        modalSubjectFilter === 'ALL' || item.subjectCode === modalSubjectFilter;

      return matchSearch && matchSubject;
    });
  }, [questionsPool, modalQuestionSearch, modalSubjectFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor:
              feedback.type === 'warning'
                ? 'var(--status-danger-bg)'
                : feedback.type === 'info'
                ? 'var(--cyan-light)'
                : 'var(--status-success-bg)',
            border: `1px solid ${
              feedback.type === 'warning'
                ? '#fecaca'
                : feedback.type === 'info'
                ? 'var(--cyan-border)'
                : '#bbf7d0'
            }`,
            color:
              feedback.type === 'warning'
                ? 'var(--status-danger)'
                : feedback.type === 'info'
                ? 'var(--cyan-700)'
                : 'var(--status-success)',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{feedback.type === 'warning' ? '⚠️' : feedback.type === 'info' ? 'ℹ️' : '✅'}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Badge variant="navy">EXAM MANAGEMENT MODULE</Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Schedule, Question Assembly & Attempt Policies
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--navy-900)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Examination Control & Scheduling
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Configure computerized tests, select and map questions from the Question Bank, define durations,
            passing cutoffs, and manage candidate attempt rules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="cyan"
            size="md"
            icon="➕"
            onClick={openCreateModal}
          >
            Create New Examination
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon="🔄"
            onClick={() => setIsRestoreModalOpen(true)}
            title="Restore default 3 seed exams"
          >
            Restore Seed Exams
          </Button>

          {onNavigate && (
            <Button
              variant="outline"
              size="md"
              icon="⬅️"
              onClick={() => onNavigate('admin_dashboard')}
            >
              Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <Card
          title="Total Examinations"
          metric={examsList.length}
          metricLabel="Registered in LocalStorage"
          icon="📋"
          badge={<Badge variant="cyan">{examsList.length} Tests</Badge>}
          footer="All curriculum assessments"
        />

        <Card
          title="Active Live Exams"
          metric={examsList.filter((e) => e.status === 'Active').length}
          metricLabel="Open to Students"
          icon="🟢"
          badge={<Badge variant="success">Candidate Ready</Badge>}
          footer="Eligible for student exam taking"
        />

        <Card
          title="Total Questions Mapped"
          metric={examsList.reduce((acc, e) => acc + (e.questionIds?.length || 0), 0)}
          metricLabel="Selected Across Tests"
          icon="📚"
          badge={<Badge variant="navy">Question Bank</Badge>}
          footer={`From pool of ${questionsPool.length} available MCQs`}
        />

        <Card
          title="Single vs Multiple"
          metric={`${examsList.filter((e) => e.attemptPolicy === 'Single Attempt').length} / ${examsList.filter((e) => e.attemptPolicy !== 'Single Attempt').length}`}
          metricLabel="Single / Multiple Attempts"
          icon="🛡️"
          badge={<Badge variant="neutral">Attempt Rules</Badge>}
          footer="Strict exam integrity policies"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card
        title="Search & Filter Examinations"
        subtitle="Search immediately across exam title, course code, and category."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end'
          }}
        >
          <Input
            label="Search Examinations"
            placeholder="Search by title, code (e.g. CS-301, Algorithms)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix="🔍"
          />

          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses (Active & Inactive)' },
              { value: 'Active', label: 'Active (Open to Students)' },
              { value: 'Inactive', label: 'Inactive / Paused' }
            ]}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              disabled={searchQuery === '' && statusFilter === 'ALL'}
              icon="🔄"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Inspected Exam Detail Drawer */}
      {inspectedExam && (
        <Card
          title={`Examination Specification • ${inspectedExam.title}`}
          subtitle={`Exam ID: ${inspectedExam.id} • Course: ${inspectedExam.code} (${inspectedExam.category})`}
          badge={
            <Badge variant={inspectedExam.status === 'Active' ? 'success' : 'warning'}>
              {inspectedExam.status}
            </Badge>
          }
          action={
            <Button variant="ghost" size="sm" onClick={() => setInspectedExamId(null)}>
              ✕ Close
            </Button>
          }
          style={{ border: '2px solid var(--cyan-border)', backgroundColor: 'var(--cyan-light)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                backgroundColor: '#ffffff',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration:</span>
                <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>⏱️ {inspectedExam.durationMinutes} Minutes</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marks Configuration:</span>
                <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                  🎯 {inspectedExam.totalMarks} Total / {inspectedExam.passingMarks} Pass Cutoff
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attempt Policy:</span>
                <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                  🛡️ {inspectedExam.attemptPolicy || 'Single Attempt'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Negative Marking:</span>
                <div style={{ fontWeight: 700, color: inspectedExam.negativeMarking > 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
                  {inspectedExam.negativeMarking > 0 ? `-${inspectedExam.negativeMarking} Marks` : 'None (0.0)'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-700)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Description & Instructions
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--navy-900)', backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', lineHeight: 1.5 }}>
                {inspectedExam.description}
              </p>
            </div>

            {/* Selected Questions List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-700)', textTransform: 'uppercase' }}>
                  Mapped Questions ({inspectedExam.questionIds?.length || 0})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(inspectedExam)}
                >
                  Modify Question Selection
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {inspectedExam.questionIds && inspectedExam.questionIds.length > 0 ? (
                  inspectedExam.questionIds.map((qId) => {
                    const qObj = questionsPool.find((q) => q.id === qId);
                    return (
                      <div
                        key={qId}
                        style={{
                          padding: '0.65rem 0.85rem',
                          backgroundColor: '#ffffff',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontFamily: 'monospace' }}>
                            {qId}
                          </span>
                          <span style={{ color: 'var(--navy-800)' }}>
                            {qObj ? qObj.question : `Question record (${qId})`}
                          </span>
                        </div>
                        <Badge variant="cyan">
                          {qObj ? `+${qObj.marks} Marks` : 'N/A'}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--status-danger)' }}>
                    No questions currently mapped to this examination.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Examination Registry Table & Empty State */}
      <Card
        title={`Institutional Examination Registry (${filteredExams.length} Found)`}
        subtitle="Master schedule of computerized tests stored in browser LocalStorage"
      >
        <Table
          columns={columns}
          data={filteredExams}
          emptyMessage={
            searchQuery !== '' || statusFilter !== 'ALL'
              ? `No examinations match your filter "${searchQuery}". Click "Reset Filters" to clear.`
              : 'No examinations currently configured. Click "Create New Examination" to schedule one.'
          }
        />
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: CREATE / EDIT EXAMINATION (WITH QUESTION SELECTION) */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'create' ? 'Create New Examination' : `Edit Examination (${editingExamId})`}
        subtitle="Configure examination parameters, duration, marks, attempt rules, and select questions"
        maxWidth="820px"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="md" icon="💾" onClick={handleFormSubmit}>
              {formMode === 'create' ? 'Schedule Examination' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Row 1: Name and Subject */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Input
              label="Examination Name"
              required
              placeholder="e.g. Data Structures & Algorithms Comprehensive"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={formErrors.title}
            />

            <Select
              label="Subject / Curriculum Course"
              required
              value={`${formData.code}|${formData.subjectName}`}
              onChange={(e) => {
                const [code, subjectName] = e.target.value.split('|');
                setFormData({ ...formData, code, subjectName, category: subjectName });
                setModalSubjectFilter(code); // auto-filter questions in picker
              }}
              options={subjectOptions}
            />
          </div>

          {/* Description */}
          <Textarea
            label="Examination Description & Syllabus Scope"
            required
            rows={2}
            placeholder="Provide context, topics covered, and candidate instructions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={formErrors.description}
          />

          {/* Row 2: Duration, Total Marks, Passing Marks, Attempt Policy */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            <Input
              label="Duration (Minutes)"
              type="number"
              min="5"
              step="1"
              required
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              error={formErrors.durationMinutes}
            />

            <Input
              label="Total Marks"
              type="number"
              min="1"
              step="0.5"
              required
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
              error={formErrors.totalMarks}
            />

            <Input
              label="Passing Marks"
              type="number"
              min="1"
              step="0.5"
              required
              value={formData.passingMarks}
              onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
              error={formErrors.passingMarks}
            />

            <Select
              label="Attempt Policy"
              required
              value={formData.attemptPolicy}
              onChange={(e) => setFormData({ ...formData, attemptPolicy: e.target.value })}
              options={[
                { value: 'Single Attempt', label: 'Single Attempt (Strict Final)' },
                { value: 'Multiple Attempts', label: 'Multiple Attempts (Re-test Permitted)' }
              ]}
            />
          </div>

          {/* Row 3: Negative Marking & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            <Input
              label="Negative Marking Penalty"
              type="number"
              min="0"
              step="0.25"
              value={formData.negativeMarking}
              onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.value })}
              hint="Deducted per incorrect response (0 = none)"
            />

            <Select
              label="Exam Availability Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active (Visible to Students)' },
                { value: 'Inactive', label: 'Inactive / Draft (Hidden)' }
              ]}
            />
          </div>

          {/* ------------------------------------------------------------- */}
          {/* QUESTION SELECTION INTERFACE */}
          {/* ------------------------------------------------------------- */}
          <div
            style={{
              marginTop: '0.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              backgroundColor: 'var(--bg-body)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Select Examination Questions from Question Bank <span style={{ color: 'var(--status-danger)' }}>*</span>
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Questions are referenced by ID to prevent duplicate data storage.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant={formData.selectedQuestionIds.length > 0 ? 'cyan' : 'warning'}>
                  {formData.selectedQuestionIds.length} Selected
                </Badge>
                <Badge variant="navy">
                  Sum: {selectedMarksSum} Marks
                </Badge>
              </div>
            </div>

            {/* Marks Match / Mismatch Explanatory Banner */}
            <div style={{ marginBottom: '1rem' }}>
              {selectedMarksSum === Number(formData.totalMarks) ? (
                <div
                  style={{
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'var(--status-success-bg)',
                    border: '1px solid #86efac',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--status-success)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>✓</span>
                  <span>Marks Aligned: Selected questions total exactly {selectedMarksSum} marks, matching Exam Total Marks.</span>
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--status-warning-bg)',
                    border: '1px solid #fde047',
                    borderRadius: 'var(--radius-sm)',
                    color: '#854d0e',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div>
                    <strong>⚠️ Marks Discrepancy:</strong> Selected questions sum to <strong>{selectedMarksSum} Marks</strong>,
                    but Exam Total Marks is set to <strong>{formData.totalMarks} Marks</strong> (Difference: {selectedMarksSum - Number(formData.totalMarks)} Marks).
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSyncTotalMarks}
                    title="Automatically set Exam Total Marks to match selected questions sum"
                  >
                    Sync Total Marks to {selectedMarksSum}
                  </Button>
                </div>
              )}
            </div>

            {/* Error if no questions selected */}
            {formErrors.selectedQuestionIds && (
              <div style={{ fontSize: '0.8rem', color: 'var(--status-danger)', fontWeight: 600, marginBottom: '0.75rem' }}>
                {formErrors.selectedQuestionIds}
              </div>
            )}

            {/* Question Picker Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Input
                placeholder="Search questions by text or topic..."
                value={modalQuestionSearch}
                onChange={(e) => setModalQuestionSearch(e.target.value)}
                prefix="🔍"
              />

              <Select
                value={modalSubjectFilter}
                onChange={(e) => setModalSubjectFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Subjects in Pool' },
                  { value: 'CS-301', label: 'CS-301: Data Structures' },
                  { value: 'CS-402', label: 'CS-402: Operating Systems' },
                  { value: 'CS-503', label: 'CS-503: DBMS' },
                  { value: 'CS-601', label: 'CS-601: Computer Networks' },
                  { value: 'CS-702', label: 'CS-702: Software Engineering' }
                ]}
              />
            </div>

            {/* Scrollable Questions Selection Box */}
            <div
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ffffff'
              }}
            >
              {modalFilteredQuestions.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No questions found in this category.
                </div>
              ) : (
                modalFilteredQuestions.map((q) => {
                  const isChecked = formData.selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: isChecked ? 'var(--cyan-light)' : 'transparent',
                        transition: 'background-color 0.1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by wrapper div onClick
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--navy-900)' }}>
                          {q.id}
                        </span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                          {q.question}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                        <Badge variant="neutral">{q.subjectCode}</Badge>
                        <Badge variant={isChecked ? 'cyan' : 'neutral'}>
                          +{q.marks} Marks
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: DELETE CONFIRMATION (SAFEGUARDING STUDENT RESULTS) */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, exam: null, historicalResults: [] })}
        title="Confirm Examination Deletion"
        maxWidth="520px"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setDeleteModalState({ isOpen: false, exam: null, historicalResults: [] })}
            >
              Cancel
            </Button>
            <Button variant="danger" size="md" icon="🗑️" onClick={confirmDelete}>
              Confirm Delete Examination
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ color: 'var(--navy-900)', fontSize: '0.95rem' }}>
            Are you sure you want to delete examination{' '}
            <strong>{deleteModalState.exam?.title}</strong> ({deleteModalState.exam?.code})?
          </p>

          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--bg-body)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--navy-800)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div><strong>Exam ID:</strong> {deleteModalState.exam?.id}</div>
            <div><strong>Duration:</strong> {deleteModalState.exam?.durationMinutes} mins • <strong>Marks:</strong> {deleteModalState.exam?.totalMarks}</div>
            <div><strong>Mapped Questions:</strong> {deleteModalState.exam?.questionIds?.length || 0} questions</div>
          </div>

          {/* Historical Student Submissions Safeguard Notice */}
          {deleteModalState.historicalResults && deleteModalState.historicalResults.length > 0 ? (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--cyan-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--cyan-border)',
                fontSize: '0.825rem',
                color: 'var(--cyan-700)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🛡️</span>
                <span>Historical Student Transcripts Protected:</span>
              </div>
              <div>
                <strong>{deleteModalState.historicalResults.length} candidate submission(s)</strong> (including{' '}
                {deleteModalState.historicalResults[0]?.studentName || 'registered candidates'}) have completed this assessment.
              </div>
              <div style={{ fontStyle: 'italic' }}>
                Deleting this examination configuration will safely unpublish it from future test scheduling, while historical student scorecards and grades are safely preserved in LocalStorage.
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No candidate submissions are recorded for this test. The examination will be completely removed from scheduling.
            </p>
          )}

          <p style={{ fontSize: '0.8rem', color: 'var(--status-danger)', fontWeight: 600 }}>
            ⚠️ This will remove the examination configuration from LocalStorage.
          </p>
        </div>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: RESTORE DEFAULT CSE EXAMS */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Default Curriculum Examinations"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="md" icon="🔄" onClick={confirmRestoreDefaults}>
              Yes, Restore 3 Seed Exams
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ color: 'var(--navy-900)', fontSize: '0.95rem' }}>
            This will restore the 3 standard B.Tech CSE examination configurations from <code>seedData.js</code>:
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--navy-800)' }}>
            <li>CS-301: Data Structures & Algorithms Comprehensive (15 Mins, 20 Marks)</li>
            <li>CS-402: Operating Systems & Concurrency (10 Mins, 16 Marks)</li>
            <li>CS-503: Database Management & Relational Design (12 Mins, 14 Marks)</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export default AdminExamManagementView;

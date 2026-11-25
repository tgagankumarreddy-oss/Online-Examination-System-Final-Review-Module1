import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Table } from '../components/common/Table.jsx';
import { Input, Select, Textarea, Badge } from '../components/common/FormElements.jsx';
import { Modal } from '../components/common/Modal.jsx';
import questionsData from '../data/questions.json';
import { INITIAL_QUESTIONS } from '../data/seedData.js';
import {
  getStoredQuestions,
  saveQuestion,
  deleteQuestion,
  saveStoredQuestions,
  getStoredExams
} from '../utils/storage.js';

/**
 * Generates a collision-free sequential Question ID (e.g. q9, q10) matching the existing convention
 * or timestamp fallback if non-standard IDs exist.
 * @param {Array} existingList
 * @returns {string} Unique Question ID
 */
function generateUniqueQuestionId(existingList = []) {
  let maxIndex = 0;
  existingList.forEach((q) => {
    if (q.id) {
      const match = String(q.id).match(/^q(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxIndex) {
          maxIndex = num;
        }
      }
    }
  });

  if (maxIndex > 0) {
    let nextCandidate = `q${maxIndex + 1}`;
    while (existingList.some((q) => q.id === nextCandidate)) {
      maxIndex++;
      nextCandidate = `q${maxIndex + 1}`;
    }
    return nextCandidate;
  }
  return `q_${Date.now()}`;
}

/**
 * Admin Question Bank View Component
 * Complete Question Management with Full CRUD (Create, Read, Update, Delete),
 * Live Search, Subject Filtering, Form Validation, Dependency Checking, and LocalStorage Persistence.
 */
export function AdminQuestionBankView({ onNavigate }) {
  // Load questions from LocalStorage (fallback to questions.json if empty)
  const [questionsList, setQuestionsList] = useState(() => {
    const stored = getStoredQuestions();
    return stored && stored.length > 0 ? stored : questionsData;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // Modals & Forms State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Delete Confirmation Modal State (with exam dependency handling)
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    question: null,
    dependentExams: []
  });

  // Restore Defaults Confirmation Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Toast / Feedback Alert State
  const [feedback, setFeedback] = useState(null);

  // Question Form State
  const initialFormState = {
    type: 'mcq', // 'mcq' | 'numeric'
    imageUrl: '',
    numericAnswer: '',
    tolerance: 0,
    subjectCode: 'CS-301',
    course: 'Data Structures & Algorithms',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0, // 0: A, 1: B, 2: C, 3: D
    marks: 2.0,
    negativeMarks: 0.5,
    difficulty: 'Medium',
    topic: '',
    explanation: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Client-side image upload with automatic canvas downscaling to protect LocalStorage
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Please select a valid image file (PNG, JPG, SVG, WebP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Limit max dimensions to 600x400 to prevent oversized base64 strings
        const maxW = 600;
        const maxH = 400;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
        showFeedback('Question image successfully uploaded and optimized!');
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Trigger temporary feedback toast
  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // 1. Dynamic Subject Extraction
  const subjectList = useMemo(() => {
    const subjectsMap = new Map();
    questionsList.forEach((q) => {
      const code = q.subjectCode || 'GEN';
      const name = q.course || code;
      if (!subjectsMap.has(code)) {
        subjectsMap.set(code, name);
      }
    });
    return Array.from(subjectsMap.entries()).map(([code, name]) => ({
      code,
      name,
      label: `${code}: ${name}`
    }));
  }, [questionsList]);

  // Subject filter options
  const subjectFilterOptions = useMemo(() => {
    return [
      { value: 'ALL', label: `All Subjects (${subjectList.length} Available)` },
      ...subjectList.map((s) => ({
        value: s.code,
        label: `${s.code} - ${s.name}`
      }))
    ];
  }, [subjectList]);

  // Subject dropdown options for Form (with predefined choices)
  const formSubjectOptions = [
    { value: 'CS-301|Data Structures & Algorithms', label: 'CS-301: Data Structures & Algorithms' },
    { value: 'CS-402|Operating Systems', label: 'CS-402: Operating Systems' },
    { value: 'CS-503|Database Management Systems', label: 'CS-503: Database Management Systems' },
    { value: 'CS-601|Computer Networks', label: 'CS-601: Computer Networks' },
    { value: 'CS-702|Software Engineering', label: 'CS-702: Software Engineering' }
  ];

  // 2. Filter & Search Logic
  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return questionsList.filter((q) => {
      const matchesText =
        query === '' ||
        (q.question && q.question.toLowerCase().includes(query)) ||
        (q.topic && q.topic.toLowerCase().includes(query)) ||
        (q.course && q.course.toLowerCase().includes(query)) ||
        (q.subjectCode && q.subjectCode.toLowerCase().includes(query)) ||
        (q.id && q.id.toLowerCase().includes(query));

      const matchesSubject =
        selectedSubject === 'ALL' ||
        q.subjectCode === selectedSubject ||
        q.course === selectedSubject;

      return matchesText && matchesSubject;
    });
  }, [questionsList, searchQuery, selectedSubject]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('ALL');
    setExpandedQuestionId(null);
  };

  // Toggle detail inspector view
  const toggleExpand = (id) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  // -------------------------------------------------------------
  // FORM HANDLING: CREATE & EDIT
  // -------------------------------------------------------------

  const openCreateModal = () => {
    setFormMode('create');
    setEditingQuestionId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (question) => {
    setFormMode('edit');
    setEditingQuestionId(question.id);
    const getOptionText = (opt) => (typeof opt === 'object' && opt !== null ? opt.text || '' : opt || '');
    const isNumeric = question.type === 'numeric';

    setFormData({
      type: isNumeric ? 'numeric' : 'mcq',
      imageUrl: question.imageUrl || '',
      numericAnswer: isNumeric ? (question.correctNumericAnswer ?? question.correctAnswer ?? '') : '',
      tolerance: question.tolerance ?? 0,
      subjectCode: question.subjectCode || 'CS-301',
      course: question.course || 'Data Structures & Algorithms',
      question: question.question || question.questionText || '',
      optionA: getOptionText(question.options?.[0]),
      optionB: getOptionText(question.options?.[1]),
      optionC: getOptionText(question.options?.[2]),
      optionD: getOptionText(question.options?.[3]),
      correctAnswer: question.correctAnswer ?? 0,
      marks: question.marks ?? 2.0,
      negativeMarks: question.negativeMarks ?? 0.5,
      difficulty: question.difficulty || 'Medium',
      topic: question.topic || '',
      explanation: question.explanation || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.question || formData.question.trim().length < 5) {
      errors.question = 'Question prompt must be at least 5 characters long.';
    }

    if (formData.type === 'numeric') {
      // Numerical Answer Validation (Accepts decimals and negative values)
      if (formData.numericAnswer === '' || formData.numericAnswer === null || isNaN(Number(formData.numericAnswer))) {
        errors.numericAnswer = 'A valid numerical answer is required (e.g. 42, -15.5, 3.14).';
      }
      if (formData.tolerance !== '' && formData.tolerance !== null && (isNaN(Number(formData.tolerance)) || Number(formData.tolerance) < 0)) {
        errors.tolerance = 'Tolerance must be a non-negative number (e.g. 0.05).';
      }
    } else {
      // MCQ 4 Options Validation
      if (!formData.optionA.trim()) errors.optionA = 'Option A is required.';
      if (!formData.optionB.trim()) errors.optionB = 'Option B is required.';
      if (!formData.optionC.trim()) errors.optionC = 'Option C is required.';
      if (!formData.optionD.trim()) errors.optionD = 'Option D is required.';

      // Ensure options are not duplicate
      const optionValues = [
        formData.optionA.trim().toLowerCase(),
        formData.optionB.trim().toLowerCase(),
        formData.optionC.trim().toLowerCase(),
        formData.optionD.trim().toLowerCase()
      ];
      if (new Set(optionValues).size < 4 && !errors.optionA && !errors.optionB && !errors.optionC && !errors.optionD) {
        errors.optionD = 'All 4 options must be distinct from one another.';
      }

      // Ensure correct answer index is valid and matches a non-empty option
      const correctIdx = Number(formData.correctAnswer);
      const selectedOptionText = [formData.optionA, formData.optionB, formData.optionC, formData.optionD][correctIdx];
      if (!selectedOptionText || !selectedOptionText.trim()) {
        errors.correctAnswer = 'Designated correct answer must match a non-empty option.';
      }
    }

    if (formData.marks === '' || Number(formData.marks) <= 0) {
      errors.marks = 'Marks must be a positive number greater than 0.';
    }
    if (formData.negativeMarks === '' || Number(formData.negativeMarks) < 0) {
      errors.negativeMarks = 'Negative marks cannot be negative.';
    }
    if (!formData.topic.trim()) {
      errors.topic = 'Topic or syllabus unit is required.';
    }
    if (!formData.explanation.trim()) {
      errors.explanation = 'Please provide an educational explanation for the answer.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isNumeric = formData.type === 'numeric';
    const optionsArray = isNumeric
      ? []
      : [
        formData.optionA.trim(),
        formData.optionB.trim(),
        formData.optionC.trim(),
        formData.optionD.trim()
      ];

    const targetId = formMode === 'edit' ? editingQuestionId : generateUniqueQuestionId(questionsList);

    const questionPayload = {
      id: targetId,
      type: isNumeric ? 'numeric' : 'mcq',
      imageUrl: formData.imageUrl || '',
      subjectCode: formData.subjectCode,
      course: formData.course,
      question: formData.question.trim(),
      options: optionsArray,
      correctAnswer: isNumeric ? Number(formData.numericAnswer) : Number(formData.correctAnswer),
      correctNumericAnswer: isNumeric ? Number(formData.numericAnswer) : undefined,
      tolerance: isNumeric ? Number(formData.tolerance || 0) : undefined,
      marks: Number(formData.marks),
      negativeMarks: Number(formData.negativeMarks),
      difficulty: formData.difficulty,
      topic: formData.topic.trim(),
      explanation: formData.explanation.trim()
    };

    // Save to LocalStorage via storage helper
    const updatedQuestions = saveQuestion(questionPayload);
    setQuestionsList(updatedQuestions);

    setIsFormModalOpen(false);
    showFeedback(
      formMode === 'create'
        ? `Question "${targetId}" (${isNumeric ? 'Numeric' : 'MCQ'}) created successfully in ${questionPayload.subjectCode}!`
        : `Question "${editingQuestionId}" updated successfully!`
    );
  };

  // -------------------------------------------------------------
  // DELETE HANDLING (WITH DEPENDENCY CHECKING)
  // -------------------------------------------------------------

  const openDeleteModal = (question) => {
    // Check if question is used in an existing examination
    const storedExams = getStoredExams();
    const dependentExams = storedExams.filter(
      (e) =>
        e.code === question.subjectCode ||
        e.id === question.examId ||
        (e.category &&
          question.course &&
          e.category.toLowerCase().includes(question.course.toLowerCase()))
    );

    setDeleteModalState({
      isOpen: true,
      question,
      dependentExams
    });
  };

  const confirmDelete = () => {
    const qId = deleteModalState.question?.id;
    if (!qId) return;

    // Check if question exists in current stored questions (handle missing question safely)
    const currentStored = getStoredQuestions();
    const exists = currentStored.some((q) => q.id === qId);

    if (!exists) {
      setQuestionsList(currentStored);
      setDeleteModalState({ isOpen: false, question: null, dependentExams: [] });
      showFeedback(`Question "${qId}" was already missing or previously deleted.`, 'warning');
      return;
    }

    const updated = deleteQuestion(qId);
    setQuestionsList(updated);
    if (expandedQuestionId === qId) {
      setExpandedQuestionId(null);
    }
    setDeleteModalState({ isOpen: false, question: null, dependentExams: [] });
    showFeedback(`Question "${qId}" was successfully deleted from the Question Bank.`, 'warning');
  };

  // -------------------------------------------------------------
  // FACTORY RESET TO DEFAULT SEED QUESTIONS (ALL 32 QUESTIONS)
  // -------------------------------------------------------------

  const confirmRestoreDefaults = () => {
    const seedPool = (Array.isArray(INITIAL_QUESTIONS) && INITIAL_QUESTIONS.length >= 32)
      ? INITIAL_QUESTIONS
      : questionsData;

    // Preserve any custom questions created by the user (IDs not in seed pool)
    const seedIds = new Set(seedPool.map(q => q.id));
    const userCreatedQuestions = questionsList.filter(q => q.id && !seedIds.has(q.id));

    const restoredBank = [...seedPool, ...userCreatedQuestions];
    saveStoredQuestions(restoredBank);
    setQuestionsList(restoredBank);
    setIsRestoreModalOpen(false);
    handleResetFilters();
    showFeedback(
      `Question bank successfully restored to the full 32 B.Tech CSE examination questions${userCreatedQuestions.length > 0 ? ` (and preserved ${userCreatedQuestions.length} user-created questions)` : ''}.`,
      'info'
    );
  };

  // -------------------------------------------------------------
  // TABLE COLUMNS CONFIGURATION
  // -------------------------------------------------------------

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: '75px',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {val}
        </span>
      )
    },
    {
      key: 'question',
      label: 'Question Prompt & Type',
      render: (val, row) => (
        <div style={{ maxWidth: '380px' }}>
          <div style={{ fontWeight: 600, color: 'var(--navy-900)', lineHeight: 1.4, marginBottom: '0.35rem' }}>
            {val}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <Badge variant={row.type === 'numeric' ? 'navy' : 'cyan'}>
              {row.type === 'numeric' ? 'NUMERIC' : 'MCQ'}
            </Badge>
            {row.imageUrl && (
              <span style={{ fontSize: '0.72rem', color: 'var(--cyan-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                📷 Image
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Topic: <strong>{row.topic}</strong>
            </span>
            {row.difficulty && (
              <Badge
                variant={
                  row.difficulty === 'Easy'
                    ? 'success'
                    : row.difficulty === 'Medium'
                      ? 'warning'
                      : 'danger'
                }
              >
                {row.difficulty}
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'subjectCode',
      label: 'Subject',
      width: '150px',
      render: (val, row) => (
        <div>
          <Badge variant="cyan">{val}</Badge>
          <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', marginTop: '0.25rem', fontWeight: 500 }}>
            {row.course}
          </div>
        </div>
      )
    },
    {
      key: 'options',
      label: 'Options / Numeric Key',
      render: (opts, row) => {
        if (row.type === 'numeric') {
          return (
            <div style={{ padding: '0.4rem 0.65rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
              <div style={{ color: '#166534', fontWeight: 700 }}>
                Numerical Key: <code style={{ backgroundColor: '#ffffff', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>{row.correctNumericAnswer ?? row.correctAnswer}</code>
              </div>
              {row.tolerance !== undefined && Number(row.tolerance) > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.15rem' }}>
                  Tolerance: ±{row.tolerance}
                </div>
              )}
            </div>
          );
        }

        if (!Array.isArray(opts)) return null;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px' }}>
            {opts.map((opt, idx) => {
              const optText = typeof opt === 'object' && opt !== null ? (opt.text || opt.label || '') : String(opt);
              const isCorrect = idx === row.correctAnswer;
              const letter = String.fromCharCode(65 + idx);
              return (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isCorrect ? 'var(--status-success-bg)' : 'transparent',
                    border: isCorrect ? '1px solid #86efac' : '1px solid transparent',
                    color: isCorrect ? 'var(--status-success)' : 'var(--navy-800)',
                    fontWeight: isCorrect ? 700 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ fontWeight: 700, color: isCorrect ? 'var(--status-success)' : 'var(--text-muted)' }}>
                    {letter}.
                  </span>
                  <span>{optText}</span>
                  {isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✓</span>}
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      key: 'correctAnswer',
      label: 'Correct Key',
      width: '120px',
      render: (correctIdx, row) => {
        if (row.type === 'numeric') {
          return (
            <div>
              <Badge variant="navy">{row.correctNumericAnswer ?? row.correctAnswer}</Badge>
              {row.tolerance !== undefined && Number(row.tolerance) > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  ±{row.tolerance}
                </div>
              )}
            </div>
          );
        }
        const letter = String.fromCharCode(65 + correctIdx);
        return (
          <div>
            <Badge variant="success">Option {letter}</Badge>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Index: {correctIdx}
            </div>
          </div>
        );
      }
    },
    {
      key: 'marks',
      label: 'Marks',
      width: '95px',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.85rem' }}>
            +{val}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>
            -{row.negativeMarks}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button
            variant={expandedQuestionId === row.id ? 'cyan' : 'secondary'}
            size="sm"
            onClick={() => toggleExpand(row.id)}
            title="Inspect full details"
          >
            {expandedQuestionId === row.id ? 'Hide' : 'Inspect'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
            title="Edit this question"
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => openDeleteModal(row)}
            title="Delete this question"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const expandedQuestion = questionsList.find((q) => q.id === expandedQuestionId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Visual Feedback Alert */}
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
            border: `1px solid ${feedback.type === 'warning'
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

      {/* Page Header */}
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
            <Badge variant="navy">QUESTION BANK MODULE</Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Full CRUD & LocalStorage Persistence
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
            Question Bank Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Author, edit, search, filter, and curate multiple-choice questions for all B.Tech CSE examination modules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="cyan"
            size="md"
            icon="➕"
            onClick={openCreateModal}
          >
            Add New Question
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon="🔄"
            onClick={() => setIsRestoreModalOpen(true)}
            title="Restore original 32 seed questions repository"
          >
            Restore Seed Defaults (32 Questions)
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

      {/* Question Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <Card
          title="Total Questions"
          metric={questionsList.length}
          metricLabel="Questions in Store"
          icon="📚"
          badge={<Badge variant="cyan">{questionsList.length} Items</Badge>}
          footer="Persisted in browser LocalStorage"
        />

        <Card
          title="Available Subjects"
          metric={subjectList.length}
          metricLabel="Curriculum Courses"
          icon="🎓"
          badge={<Badge variant="navy">Core CSE</Badge>}
          footer={subjectList.map((s) => s.code).join(' • ')}
        />

        <Card
          title="Filtered Questions"
          metric={filteredQuestions.length}
          metricLabel="Currently Visible"
          icon="🔍"
          badge={
            <Badge variant={filteredQuestions.length > 0 ? 'success' : 'warning'}>
              {filteredQuestions.length} Found
            </Badge>
          }
          footer={`Matching search & subject filters`}
        />
      </div>

      {/* Search and Subject Filter Controls */}
      <Card
        title="Search & Subject Filtering"
        subtitle="Search immediately across prompt text, topic, and course codes."
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
            label="Search by Question Text or Subject"
            placeholder="Type query (e.g. QuickSort, Semaphore, CS-301)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix="🔍"
            hint="Instant real-time search"
          />

          <Select
            label="Filter by Course"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjectFilterOptions}
            hint="Filter by specific subject"
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleResetFilters}
              disabled={searchQuery === '' && selectedSubject === 'ALL'}
              icon="🔄"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Expanded Question Inspector Detail Drawer */}
      {expandedQuestion && (
        <Card
          title={`Question Inspector • ${expandedQuestion.id}`}
          subtitle={`${expandedQuestion.subjectCode}: ${expandedQuestion.course} • Topic: ${expandedQuestion.topic}`}
          badge={<Badge variant="cyan">{expandedQuestion.difficulty || 'Medium'}</Badge>}
          action={
            <Button variant="ghost" size="sm" onClick={() => setExpandedQuestionId(null)}>
              ✕ Close
            </Button>
          }
          style={{
            border: '2px solid var(--cyan-border)',
            backgroundColor: 'var(--cyan-light)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Full Question Text
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', lineHeight: 1.5 }}>
                {expandedQuestion.question}
              </div>
            </div>

            {expandedQuestion.imageUrl && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Question Diagram / Image
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
                  <img
                    src={expandedQuestion.imageUrl}
                    alt="Question Diagram"
                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {expandedQuestion.type === 'numeric' ? 'Verified Numerical Answer Key' : 'Options & Verified Answer Key'}
              </div>
              {expandedQuestion.type === 'numeric' ? (
                <div style={{ padding: '1rem', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>
                    Correct Numerical Value: <strong style={{ color: '#059669', fontSize: '1.1rem' }}>{expandedQuestion.correctNumericAnswer ?? expandedQuestion.correctAnswer}</strong>
                  </div>
                  {expandedQuestion.tolerance !== undefined && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Acceptable Margin of Error / Tolerance: <strong>±{expandedQuestion.tolerance}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                  {expandedQuestion.options?.map((opt, idx) => {
                    const isCorrect = idx === expandedQuestion.correctAnswer;
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isCorrect ? '#ecfdf5' : '#ffffff',
                          border: isCorrect ? '2px solid #10b981' : '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.875rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: isCorrect ? '#10b981' : 'var(--bg-body)',
                              color: isCorrect ? '#ffffff' : 'var(--navy-800)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          >
                            {letter}
                          </span>
                          <span style={{ fontWeight: isCorrect ? 700 : 500, color: 'var(--navy-900)' }}>
                            {opt}
                          </span>
                        </div>
                        {isCorrect && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                            ✓ Correct Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {expandedQuestion.explanation && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-700)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Educational Rationale
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--navy-900)', lineHeight: 1.5 }}>
                  {expandedQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Question Table & Empty State */}
      <Card
        title={`Questions Registry (${filteredQuestions.length} Found)`}
        subtitle={
          selectedSubject === 'ALL'
            ? 'Master question repository for computerized tests'
            : `Showing questions filtered by ${selectedSubject}`
        }
      >
        <Table
          columns={columns}
          data={filteredQuestions}
          emptyMessage={
            searchQuery !== '' || selectedSubject !== 'ALL'
              ? `No questions found matching "${searchQuery}" in ${selectedSubject}. Click "Reset Filters" to clear.`
              : 'No questions currently present in the question bank. Click "Add New Question" to create one.'
          }
        />
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT QUESTION FORM */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'create' ? 'Author New Question' : `Edit Question (${editingQuestionId})`}
        subtitle="Fill in question details, 4 multiple choice options, and educational explanation"
        maxWidth="720px"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="md" icon="💾" onClick={handleFormSubmit}>
              {formMode === 'create' ? 'Save to Question Bank' : 'Update Question'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Question Format & Type Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: 'var(--bg-body)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              Question Format & Input Type <span style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: formData.type !== 'numeric' ? 700 : 500, color: formData.type !== 'numeric' ? 'var(--cyan-700)' : 'var(--navy-800)' }}>
                <input
                  type="radio"
                  name="questionType"
                  value="mcq"
                  checked={formData.type !== 'numeric'}
                  onChange={() => setFormData({ ...formData, type: 'mcq' })}
                  style={{ accentColor: 'var(--cyan-600)' }}
                />
                <span>Multiple Choice Question (MCQ)</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: formData.type === 'numeric' ? 700 : 500, color: formData.type === 'numeric' ? 'var(--cyan-700)' : 'var(--navy-800)' }}>
                <input
                  type="radio"
                  name="questionType"
                  value="numeric"
                  checked={formData.type === 'numeric'}
                  onChange={() => setFormData({ ...formData, type: 'numeric' })}
                  style={{ accentColor: 'var(--cyan-600)' }}
                />
                <span>Numeric Answer Question</span>
              </label>
            </div>
          </div>

          {/* Subject Selector */}
          <Select
            label="Curriculum Subject / Course"
            required
            value={`${formData.subjectCode}|${formData.course}`}
            onChange={(e) => {
              const [code, course] = e.target.value.split('|');
              setFormData({ ...formData, subjectCode: code, course });
            }}
            options={formSubjectOptions}
          />

          {/* Question Prompt */}
          <Textarea
            label="Question Prompt"
            required
            rows={3}
            placeholder="Enter the complete question prompt..."
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            error={formErrors.question}
          />

          {/* Question Illustration / Image Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-800)' }}>
              Question Diagram / Image (Optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/*"
                id="questionImageFileInput"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label
                htmlFor="questionImageFileInput"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.95rem',
                  backgroundColor: 'var(--bg-body)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--navy-900)'
                }}
              >
                📷 {formData.imageUrl ? 'Replace Image' : 'Upload Image'}
              </label>

              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Remove Image ✕
                </button>
              )}
            </div>

            {formData.imageUrl && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', width: 'fit-content', backgroundColor: '#f8fafc' }}>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{ maxHeight: '140px', maxWidth: '320px', objectFit: 'contain', display: 'block' }}
                />
              </div>
            )}
          </div>

          {/* Conditional Answer Configuration: Numeric Inputs vs 4 Options Grid */}
          {formData.type === 'numeric' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                backgroundColor: '#f0fdf4',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid #86efac'
              }}
            >
              <Input
                label="Correct Numerical Answer"
                required
                type="number"
                step="any"
                placeholder="e.g. 42 or -15.5 or 3.1415"
                value={formData.numericAnswer}
                onChange={(e) => setFormData({ ...formData, numericAnswer: e.target.value })}
                error={formErrors.numericAnswer}
                hint="Supports integers, decimals, and negative numbers"
              />

              <Input
                label="Acceptable Decimal Tolerance (±)"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 0.05 (0 for exact match)"
                value={formData.tolerance}
                onChange={(e) => setFormData({ ...formData, tolerance: e.target.value })}
                error={formErrors.tolerance}
                hint="Absolute margin of error allowed during evaluation"
              />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-800)', display: 'block', marginBottom: '0.5rem' }}>
                Multiple Choice Options <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                <Input
                  label="Option A"
                  required
                  placeholder="Option A text..."
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  error={formErrors.optionA}
                  prefix="A"
                />
                <Input
                  label="Option B"
                  required
                  placeholder="Option B text..."
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  error={formErrors.optionB}
                  prefix="B"
                />
                <Input
                  label="Option C"
                  required
                  placeholder="Option C text..."
                  value={formData.optionC}
                  onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                  error={formErrors.optionC}
                  prefix="C"
                />
                <Input
                  label="Option D"
                  required
                  placeholder="Option D text..."
                  value={formData.optionD}
                  onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                  error={formErrors.optionD}
                  prefix="D"
                />
              </div>
            </div>
          )}

          {/* Correct Answer & Difficulty & Marks Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {formData.type !== 'numeric' && (
              <Select
                label="Designated Correct Option"
                required
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
                error={formErrors.correctAnswer}
                options={[
                  { value: 0, label: `Option A (${formData.optionA ? formData.optionA.slice(0, 20) : 'First Option'})` },
                  { value: 1, label: `Option B (${formData.optionB ? formData.optionB.slice(0, 20) : 'Second Option'})` },
                  { value: 2, label: `Option C (${formData.optionC ? formData.optionC.slice(0, 20) : 'Third Option'})` },
                  { value: 3, label: `Option D (${formData.optionD ? formData.optionD.slice(0, 20) : 'Fourth Option'})` }
                ]}
              />
            )}

            <Select
              label="Difficulty Tier"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' }
              ]}
            />

            <Input
              label="Marks"
              type="number"
              step="0.5"
              min="0.5"
              required
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              error={formErrors.marks}
            />

            <Input
              label="Negative Deduction"
              type="number"
              step="0.25"
              min="0"
              required
              value={formData.negativeMarks}
              onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
              error={formErrors.negativeMarks}
            />
          </div>

          {/* Topic / Unit */}
          <Input
            label="Syllabus Topic / Subtopic"
            required
            placeholder="e.g. Dynamic Programming, Virtual Memory, B+ Trees..."
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            error={formErrors.topic}
          />

          {/* Pedagogical Explanation */}
          <Textarea
            label="Educational Solution & Explanation"
            required
            rows={3}
            placeholder="Explain why the designated option is correct and clarify the theoretical principle..."
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            error={formErrors.explanation}
          />
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: DELETE CONFIRMATION (WITH EXAM DEPENDENCY CHECK) */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, question: null, dependentExams: [] })}
        title="Confirm Question Deletion"
        maxWidth="520px"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setDeleteModalState({ isOpen: false, question: null, dependentExams: [] })}
            >
              Cancel
            </Button>
            <Button variant="danger" size="md" icon="🗑️" onClick={confirmDelete}>
              Confirm Permanent Delete
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ color: 'var(--navy-900)', fontSize: '0.95rem' }}>
            Are you sure you want to permanently delete question{' '}
            <strong>{deleteModalState.question?.id}</strong> from the question bank?
          </p>

          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--bg-body)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--navy-800)',
              fontStyle: 'italic',
              border: '1px solid var(--border-light)'
            }}
          >
            "{deleteModalState.question?.question}"
          </div>

          {/* Examination Dependency Warning if question belongs to active exam */}
          {deleteModalState.dependentExams && deleteModalState.dependentExams.length > 0 && (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--status-warning-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #fde047',
                fontSize: '0.825rem',
                color: '#854d0e',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>⚠️</span>
                <span>Active Examination Dependency Warning:</span>
              </div>
              <div>
                This question belongs to the curriculum of active examination(s):
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: '0.2rem 0' }}>
                {deleteModalState.dependentExams.map((ex) => (
                  <li key={ex.id}>
                    <strong>{ex.code}</strong>: {ex.title} ({ex.status})
                  </li>
                ))}
              </ul>
              <div>
                Deleting it will safely remove it from the question pool without breaking the examination system.
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.8rem', color: 'var(--status-danger)', fontWeight: 600 }}>
            ⚠️ This deletion will immediately update LocalStorage and cannot be undone except via seed reset.
          </p>
        </div>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: RESTORE FACTORY SEED DEFAULTS CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Default Question Repository"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="md" icon="🔄" onClick={confirmRestoreDefaults}>
              Yes, Restore 32 Seed Questions
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ color: 'var(--navy-900)', fontSize: '0.95rem' }}>
            This will ensure all <strong>32 B.Tech CSE examination questions</strong> are present in the Question Bank (covering Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, and Artificial Intelligence).
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            🛡️ <strong>Safety Guarantee:</strong> Any custom questions you have created will be preserved and merged alongside the 32 foundation questions.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminQuestionBankView;

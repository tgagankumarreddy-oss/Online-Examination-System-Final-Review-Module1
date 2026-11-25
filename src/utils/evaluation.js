/**
 * Evaluation Engine for Online Examination System
 * Pure client-side grading, statistical computations, and grade assignment.
 * Supports mathematical invariance, question snapshots, and configurable negative marking.
 */

import { getStoredQuestions, getStoredExams } from './storage.js';

/**
 * Standard Academic Grading Scale
 * @param {number} percentage
 * @returns {{ grade: string, label: string, color: string }}
 */
export function calculateGrade(percentage) {
  const pct = Number(percentage) || 0;
  if (pct >= 90) return { grade: 'O', label: 'Outstanding', color: '#059669' };
  if (pct >= 80) return { grade: 'A+', label: 'Excellent', color: '#10b981' };
  if (pct >= 70) return { grade: 'A', label: 'Very Good', color: '#0284c7' };
  if (pct >= 60) return { grade: 'B+', label: 'Good', color: '#06b6d4' };
  if (pct >= 50) return { grade: 'B', label: 'Above Average', color: '#f59e0b' };
  if (pct >= 40) return { grade: 'C', label: 'Pass', color: '#d97706' };
  return { grade: 'F', label: 'Fail / Needs Re-eval', color: '#ef4444' };
}

/**
 * Normalizes options into standard string array
 * @param {Array} rawOptions
 * @returns {Array<string>}
 */
export function normalizeOptions(rawOptions = []) {
  if (!Array.isArray(rawOptions)) return [];
  return rawOptions.map((opt) => {
    if (typeof opt === 'string') return opt;
    if (opt && typeof opt === 'object') return opt.text || opt.label || '';
    return String(opt || '');
  });
}

/**
 * Reusable Evaluation Engine
 * Evaluates a candidate's attempt against either its frozen questions snapshot
 * or the active question bank repository.
 *
 * @param {Object} attempt - Examination attempt payload
 * @param {Object} [examMetadata] - Optional exam configuration
 * @param {Array} [fallbackQuestions] - Optional fallback questions pool
 * @returns {Object} Comprehensive evaluated scorecard result
 */
export function evaluateExamAttempt(attempt, examMetadata = null, fallbackQuestions = null) {
  if (!attempt) return null;

  // 1. Resolve Exam Metadata
  const allExams = examMetadata ? [examMetadata] : getStoredExams();
  const exam =
    examMetadata ||
    allExams.find((e) => e.id === attempt.examId || e.code === attempt.examCode) ||
    {};

  // 2. Resolve Questions Pool (Prioritize Frozen Snapshot for Historical Integrity)
  let questionsPool = [];
  if (Array.isArray(attempt.questionsSnapshot) && attempt.questionsSnapshot.length > 0) {
    questionsPool = attempt.questionsSnapshot;
  } else if (Array.isArray(fallbackQuestions) && fallbackQuestions.length > 0) {
    questionsPool = fallbackQuestions;
  } else {
    const stored = getStoredQuestions();
    if (Array.isArray(attempt.questionIds) && attempt.questionIds.length > 0) {
      questionsPool = attempt.questionIds.map((id) => stored.find((q) => q.id === id)).filter(Boolean);
    }
    if (questionsPool.length === 0 && (attempt.examCode || exam.code)) {
      const code = attempt.examCode || exam.code;
      questionsPool = stored.filter((q) => q.subjectCode === code || q.examId === attempt.examId);
    }
    if (questionsPool.length === 0) {
      questionsPool = stored.slice(0, attempt.totalQuestions || 5);
    }
  }

  // Candidate responses: { [questionId]: originalOptionIndex (0..3) } or option letter ("A".."D")
  const responses = attempt.responses || {};

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let positiveMarks = 0;
  let negativePenalties = 0;

  // 3. Question-Wise Detailed Evaluation
  const questionEvaluations = questionsPool.map((q, idx) => {
    const qId = q.id || `q_${idx + 1}`;
    const formattedOptions = normalizeOptions(q.options || []);
    const isNumeric = q.type === 'numeric';
    const qMarks = Number(q.marks) || 2.0;
    const qNegative = Number(q.negativeMarks ?? exam.negativeMarking ?? 0);

    let userChoiceIndex = undefined;
    let selectedOptionLetter = null;
    let selectedOptionText = null;
    let correctChoiceIndex = 0;
    let correctOptionLetter = null;
    let correctOptionText = null;
    let status = 'unattempted'; // 'correct' | 'incorrect' | 'unattempted'
    let marksAwarded = 0;

    if (isNumeric) {
      // -------------------------------------------------------------
      // NUMERIC QUESTION EVALUATION (Exact & Tolerance Matching)
      // -------------------------------------------------------------
      const rawUserResp = responses[qId];
      const hasResponse =
        rawUserResp !== undefined &&
        rawUserResp !== null &&
        String(rawUserResp).trim() !== '';

      const correctNum = parseFloat(q.correctAnswer ?? q.correctNumericAnswer ?? 0);
      const tolerance = Math.abs(parseFloat(q.tolerance) || 0);

      correctOptionText = tolerance > 0 ? `${correctNum} (±${tolerance})` : `${correctNum}`;
      selectedOptionText = hasResponse ? String(rawUserResp).trim() : null;

      if (!hasResponse) {
        status = 'unattempted';
        unattemptedCount++;
        marksAwarded = 0;
      } else {
        const userNum = parseFloat(rawUserResp);
        if (isNaN(userNum)) {
          status = 'incorrect';
          wrongCount++;
          negativePenalties += qNegative;
          marksAwarded = -qNegative;
        } else {
          const diff = Math.abs(userNum - correctNum);
          if (diff <= tolerance) {
            status = 'correct';
            correctCount++;
            positiveMarks += qMarks;
            marksAwarded = qMarks;
          } else {
            status = 'incorrect';
            wrongCount++;
            negativePenalties += qNegative;
            marksAwarded = -qNegative;
          }
        }
      }
    } else {
      // -------------------------------------------------------------
      // MULTIPLE CHOICE QUESTION (MCQ) EVALUATION
      // -------------------------------------------------------------
      const rawUserResp = responses[qId];

      if (rawUserResp !== undefined && rawUserResp !== null && rawUserResp !== '') {
        if (typeof rawUserResp === 'number') {
          userChoiceIndex = rawUserResp;
        } else if (typeof rawUserResp === 'string') {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          const letterIdx = letters.indexOf(rawUserResp.trim().toUpperCase());
          if (letterIdx >= 0) {
            userChoiceIndex = letterIdx;
          } else {
            const textIdx = formattedOptions.findIndex((opt) => opt.toLowerCase() === rawUserResp.toLowerCase());
            userChoiceIndex = textIdx >= 0 ? textIdx : undefined;
          }
        }
      }

      const rawCorrect = q.correctAnswer ?? q.correctOption;
      if (typeof rawCorrect === 'number') {
        correctChoiceIndex = rawCorrect;
      } else if (typeof rawCorrect === 'string') {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const foundIdx = letters.indexOf(rawCorrect.trim().toUpperCase());
        correctChoiceIndex = foundIdx >= 0 ? foundIdx : (!isNaN(parseInt(rawCorrect, 10)) ? parseInt(rawCorrect, 10) : 0);
      }

      selectedOptionLetter = userChoiceIndex !== undefined ? String.fromCharCode(65 + userChoiceIndex) : null;
      selectedOptionText = userChoiceIndex !== undefined ? formattedOptions[userChoiceIndex] || 'Selected' : null;
      correctOptionLetter = String.fromCharCode(65 + correctChoiceIndex);
      correctOptionText = formattedOptions[correctChoiceIndex] || 'Correct';

      if (userChoiceIndex === undefined || userChoiceIndex < 0) {
        status = 'unattempted';
        unattemptedCount++;
        marksAwarded = 0;
      } else if (userChoiceIndex === correctChoiceIndex) {
        status = 'correct';
        correctCount++;
        positiveMarks += qMarks;
        marksAwarded = qMarks;
      } else {
        status = 'incorrect';
        wrongCount++;
        negativePenalties += qNegative;
        marksAwarded = -qNegative;
      }
    }

    return {
      questionId: qId,
      questionNumber: idx + 1,
      type: isNumeric ? 'numeric' : 'mcq',
      imageUrl: q.imageUrl || '',
      questionText: q.question || q.questionText || `Question statement ${idx + 1}`,
      options: formattedOptions,
      selectedOptionIndex: userChoiceIndex,
      selectedOptionLetter,
      selectedOptionText,
      correctOptionIndex: correctChoiceIndex,
      correctOptionLetter,
      correctOptionText,
      tolerance: q.tolerance ?? 0,
      status,
      isCorrect: status === 'correct',
      isIncorrect: status === 'incorrect',
      isUnattempted: status === 'unattempted',
      marksAwarded,
      maxMarks: qMarks,
      negativeMarks: qNegative,
      explanation: q.explanation || 'No educational explanation provided for this question.',
      topic: q.topic || 'Core Syllabus'
    };
  });

  // 4. Compute Totals & Cutoffs Safely (Avoid Division-by-Zero)
  const totalQuestions = questionEvaluations.length;
  const attemptedCount = correctCount + wrongCount;
  const rawScore = positiveMarks - negativePenalties;
  const marksScored = Math.max(0, Number(rawScore.toFixed(2)));

  const totalMaxMarks =
    Number(exam.totalMarks) ||
    Number(attempt.totalMarks) ||
    questionsPool.reduce((acc, q) => acc + (Number(q.marks) || 2), 0) ||
    (totalQuestions * 2);

  const passingMarks =
    Number(exam.passingMarks) ||
    Number(attempt.passingMarks) ||
    Math.max(1, Math.floor(totalMaxMarks * 0.4));

  const percentage = totalMaxMarks > 0 ? Number(((marksScored / totalMaxMarks) * 100).toFixed(1)) : 0;
  const passed = marksScored >= passingMarks;
  const gradeInfo = calculateGrade(percentage);

  // Return Evaluated Result Object with preserved audit identity
  return {
    ...attempt,
    id: attempt.id || `res_${Date.now()}`,
    attemptId: attempt.attemptId || attempt.id || `att_${Date.now()}`,
    examId: exam.id || attempt.examId || 'exam_default',
    examTitle: exam.title || attempt.examTitle || 'Semester Examination',
    examCode: exam.code || attempt.examCode || 'CS-CORE',
    studentId: attempt.studentId || 'usr_student_1',
    studentName: attempt.studentName || 'Gagan Kumar Reddy',
    studentRoll: attempt.studentRoll || '22CSE101',
    submittedAt: attempt.submittedAt || new Date().toISOString(),
    totalQuestions,
    attempted: attemptedCount,
    attemptedCount,
    correctCount,
    wrongCount,
    incorrectCount: wrongCount,
    unattemptedCount,
    positiveMarksTotal: Number(positiveMarks.toFixed(2)),
    negativePenaltiesTotal: Number(negativePenalties.toFixed(2)),
    marksScored,
    totalMarks: totalMaxMarks,
    passingMarks,
    percentage,
    passed,
    grade: gradeInfo.grade,
    gradeLabel: gradeInfo.label,
    gradeColor: gradeInfo.color,
    timeTakenSeconds: Number(attempt.timeTakenSeconds) || 0,
    submissionType: attempt.submissionType || 'manual',
    submissionReason: attempt.submissionReason || 'Manual submission by candidate',
    warningCount: Number(attempt.warningCount ?? attempt.blurViolations ?? 0),
    blurViolations: Number(attempt.blurViolations ?? attempt.warningCount ?? 0),
    responses: { ...responses },
    questionsSnapshot: questionsPool,
    questionEvaluations
  };
}

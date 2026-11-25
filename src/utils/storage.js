/**
 * Storage Utility for Online Examination System
 * Manages all browser LocalStorage and SessionStorage interactions with error handling and validation.
 *
 * STORAGE SEPARATION POLICY:
 * - LocalStorage: Strictly persistent application data (Questions, Examinations, Examination Attempts, Results).
 * - SessionStorage: Strictly active-session information (Current User, Role, Identity).
 * - Passwords: Never stored in either LocalStorage or SessionStorage under any condition.
 */

import { INITIAL_EXAMS, INITIAL_RESULTS, INITIAL_USERS, INITIAL_QUESTIONS } from '../data/seedData.js';

export const STORAGE_KEYS = {
  QUESTIONS: 'oes_questions',
  EXAMS: 'oes_exams',
  CURRENT_USER: 'currentUser',
  EXAM_RESULTS: 'oes_exam_results',
  ACTIVE_EXAM_ATTEMPT: 'oes_active_exam_attempt',
  ACTIVE_SESSION: 'oes_active_session',
  STUDENT_SESSION: 'oes_active_session',
  ADMIN_SESSION: 'oes_admin_session',
  USERS: 'oes_users',
  SYSTEM_STATUS: 'oes_system_initialized'
};

/**
 * Defensive sanitizer to ensure passwords are never serialized into browser storage.
 */
function sanitizeNoPasswords(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeNoPasswords);
  }
  const clone = { ...data };
  if ('password' in clone) {
    delete clone.password;
  }
  return clone;
}

/* =========================================================================
 * LOCAL STORAGE PRIMITIVES
 * ========================================================================= */

/**
 * Checks if browser LocalStorage is supported and functional.
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__oes_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error('LocalStorage is not available:', error);
    return false;
  }
}

/**
 * Safely retrieve and parse data from LocalStorage.
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Error reading key "${key}" from LocalStorage. Returning default.`, error);
    return defaultValue;
  }
}

/**
 * Safely serialize and store data in LocalStorage.
 * Guarantees no password property is ever written to LocalStorage.
 * @param {string} key
 * @param {any} value
 * @returns {boolean} Success status
 */
export function setItem(key, value) {
  try {
    const safeValue = sanitizeNoPasswords(value);
    const serialized = JSON.stringify(safeValue);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving key "${key}" to LocalStorage:`, error);
    return false;
  }
}

/**
 * Remove an item from LocalStorage.
 * @param {string} key
 */
export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing key "${key}" from LocalStorage:`, error);
  }
}

/* =========================================================================
 * SESSION STORAGE PRIMITIVES
 * ========================================================================= */

/**
 * Checks if browser SessionStorage is supported and functional.
 * @returns {boolean}
 */
export function isSessionStorageAvailable() {
  try {
    const testKey = '__oes_session_test__';
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error('SessionStorage is not available:', error);
    return false;
  }
}

/**
 * Safely retrieve and parse data from SessionStorage.
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export function getSessionItem(key, defaultValue = null) {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Error reading key "${key}" from SessionStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely serialize and store data in SessionStorage.
 * Guarantees no password property is ever written to SessionStorage.
 * @param {string} key
 * @param {any} value
 * @returns {boolean} Success status
 */
export function setSessionItem(key, value) {
  try {
    const safeValue = sanitizeNoPasswords(value);
    const serialized = JSON.stringify(safeValue);
    window.sessionStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving key "${key}" to SessionStorage:`, error);
    return false;
  }
}

/**
 * Remove an item from SessionStorage.
 * @param {string} key
 */
export function removeSessionItem(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing key "${key}" from SessionStorage:`, error);
  }
}

/* =========================================================================
 * INITIALIZATION & STORAGE CLEANUP
 * ========================================================================= */

/**
 * Initialize storage with default questions, exams, and demo results if not present.
 * Also cleans any legacy active sessions or passwords previously placed in LocalStorage.
 * @param {Array} initialQuestions - Default question bank from questions.json
 * @returns {Object} Initialization summary report
 */
export function initializeStorage(initialQuestions = []) {
  if (!isStorageAvailable()) {
    return {
      success: false,
      message: 'Browser LocalStorage is unavailable.'
    };
  }

  // 1. Initialize Questions (Upgrades legacy bank to comprehensive 32-question repository)
  let questionsInitialized = false;
  const existingQuestions = getItem(STORAGE_KEYS.QUESTIONS, null);
  if (!existingQuestions || !Array.isArray(existingQuestions) || existingQuestions.length < 32) {
    const questionSeed = (initialQuestions && initialQuestions.length >= 32) ? initialQuestions : INITIAL_QUESTIONS;
    const seedIds = new Set(questionSeed.map(q => q.id));
    const custom = (Array.isArray(existingQuestions) ? existingQuestions : []).filter(q => q && q.id && !seedIds.has(q.id));
    setItem(STORAGE_KEYS.QUESTIONS, [...questionSeed, ...custom]);
    questionsInitialized = true;
  }

  // 2. Initialize Exams (Ensures 5 realistic B.Tech CSE exams are present)
  const existingExams = getItem(STORAGE_KEYS.EXAMS, null);
  if (!existingExams || !Array.isArray(existingExams) || existingExams.length < 5 || !existingExams.some(e => e.title && e.title.includes('Internal Assessment 1'))) {
    setItem(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  }

  // 3. Initialize Demo Results ONLY if key does not exist yet (never overwrite historical attempts on refresh)
  const existingResults = getItem(STORAGE_KEYS.EXAM_RESULTS, null);
  if (existingResults === null) {
    setItem(STORAGE_KEYS.EXAM_RESULTS, INITIAL_RESULTS);
  }

  // 4. Initialize Users in LocalStorage without ANY passwords
  const existingUsers = getItem(STORAGE_KEYS.USERS, null);
  if (!existingUsers || !Array.isArray(existingUsers) || existingUsers.length < 4 || !existingUsers.some(u => u.name === 'Prof. R. Srinivasan')) {
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS.map(sanitizeNoPasswords));
  } else if (existingUsers.some(u => u.password)) {
    // Sanitize any existing legacy records in LocalStorage
    setItem(STORAGE_KEYS.USERS, existingUsers.map(sanitizeNoPasswords));
  }

  // 5. Cleanup legacy active session keys from LocalStorage (Session belongs strictly in SessionStorage)
  removeItem('oes_admin_session');
  removeItem('oes_active_session');
  removeItem('oes_current_user');

  // Set system health flag
  setItem(STORAGE_KEYS.SYSTEM_STATUS, {
    version: '1.2.0',
    initializedAt: new Date().toISOString(),
    status: 'Ready',
    sessionDriver: 'SessionStorage',
    persistenceDriver: 'LocalStorage'
  });

  const storedQuestions = getItem(STORAGE_KEYS.QUESTIONS, []);
  const storedExams = getItem(STORAGE_KEYS.EXAMS, []);
  const storedResults = getItem(STORAGE_KEYS.EXAM_RESULTS, []);

  return {
    success: true,
    questionsCount: storedQuestions.length,
    examsCount: storedExams.length,
    resultsCount: storedResults.length,
    newlySeeded: questionsInitialized,
    storageStatus: 'Active'
  };
}

/**
 * Reset entire application storage back to initial seed defaults
 * Preserves user-created questions and completed results
 * @param {Array} defaultQuestions
 */
export function resetStorageToDefaults(defaultQuestions = INITIAL_QUESTIONS) {
  const currentQuestions = getStoredQuestions();
  const seedIds = new Set(defaultQuestions.map((q) => q.id));
  const custom = currentQuestions.filter((q) => q && q.id && !seedIds.has(q.id));
  setItem(STORAGE_KEYS.QUESTIONS, [...defaultQuestions, ...custom]);
  setItem(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  return {
    success: true,
    message: 'System questions and exams restored to default 32 B.Tech CSE foundation data.'
  };
}

/* =========================================================================
 * EXAM CRUD HELPERS (LOCAL STORAGE)
 * ========================================================================= */

export function getStoredExams() {
  return getItem(STORAGE_KEYS.EXAMS, []);
}

export function saveStoredExams(exams) {
  return setItem(STORAGE_KEYS.EXAMS, exams);
}

export function saveExam(examData) {
  const exams = getStoredExams();
  const existingIndex = exams.findIndex((e) => e.id === examData.id);

  let updated;
  if (existingIndex >= 0) {
    updated = [...exams];
    updated[existingIndex] = { ...updated[existingIndex], ...examData, updatedAt: new Date().toISOString() };
  } else {
    const newExam = {
      ...examData,
      id: examData.id || `exam_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: examData.status || 'Active'
    };
    updated = [newExam, ...exams];
  }

  saveStoredExams(updated);
  return updated;
}

export function deleteExam(examId) {
  const exams = getStoredExams();
  const filtered = exams.filter((e) => e.id !== examId);
  saveStoredExams(filtered);
  return filtered;
}

export function toggleExamStatus(examId) {
  const exams = getStoredExams();
  const updated = exams.map((exam) => {
    if (exam.id === examId) {
      return {
        ...exam,
        status: exam.status === 'Active' ? 'Inactive' : 'Active'
      };
    }
    return exam;
  });
  saveStoredExams(updated);
  return updated;
}

/* =========================================================================
 * QUESTION BANK CRUD HELPERS (LOCAL STORAGE)
 * ========================================================================= */

export function getStoredQuestions() {
  return getItem(STORAGE_KEYS.QUESTIONS, []);
}

export function saveStoredQuestions(questions) {
  return setItem(STORAGE_KEYS.QUESTIONS, questions);
}

export function saveQuestion(questionData) {
  const questions = getStoredQuestions();
  const existingIndex = questions.findIndex((q) => q.id === questionData.id);

  let updated;
  if (existingIndex >= 0) {
    updated = [...questions];
    updated[existingIndex] = { ...updated[existingIndex], ...questionData, updatedAt: new Date().toISOString() };
  } else {
    const newQuestion = {
      ...questionData,
      id: questionData.id || `q_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    updated = [newQuestion, ...questions];
  }

  saveStoredQuestions(updated);
  return updated;
}

export function deleteQuestion(questionId) {
  const questions = getStoredQuestions();
  const filtered = questions.filter((q) => q.id !== questionId);
  saveStoredQuestions(filtered);
  return filtered;
}

/* =========================================================================
 * RESULTS & SUBMISSIONS HELPERS (LOCAL STORAGE)
 * ========================================================================= */

export function getStoredResults() {
  return getItem(STORAGE_KEYS.EXAM_RESULTS, []);
}

export function saveExamResult(result) {
  if (!result) return getStoredResults();
  const currentResults = getStoredResults();

  // Prevent duplicate result records using unique attempt ID or result ID
  const existingIndex = currentResults.findIndex(
    (r) =>
      r.id === result.id ||
      (result.attemptId && r.attemptId && r.attemptId === result.attemptId)
  );

  let updated;
  if (existingIndex >= 0) {
    updated = [...currentResults];
    updated[existingIndex] = { ...updated[existingIndex], ...result };
  } else {
    updated = [result, ...currentResults];
  }

  setItem(STORAGE_KEYS.EXAM_RESULTS, updated);
  return updated;
}

/* =========================================================================
 * ACTIVE EXAMINATION ATTEMPT PERSISTENCE (CRASH / REFRESH RECOVERY)
 * ========================================================================= */

/**
 * Retrieves the currently active, in-progress examination attempt if any.
 * @returns {object|null}
 */
export function getActiveExamAttempt() {
  return getItem(STORAGE_KEYS.ACTIVE_EXAM_ATTEMPT, null);
}

/**
 * Saves or updates in-progress examination telemetry (answers, timer, question index, violations).
 * @param {object} attemptData
 */
export function saveActiveExamAttempt(attemptData) {
  if (!attemptData) return false;
  return setItem(STORAGE_KEYS.ACTIVE_EXAM_ATTEMPT, {
    ...attemptData,
    lastSavedAt: Date.now()
  });
}

/**
 * Clears active examination attempt upon successful completion or abandonment.
 */
export function clearActiveExamAttempt() {
  removeItem(STORAGE_KEYS.ACTIVE_EXAM_ATTEMPT);
}

export function deleteExamResult(resultId) {
  const results = getStoredResults();
  const filtered = results.filter((r) => r.id !== resultId);
  setItem(STORAGE_KEYS.EXAM_RESULTS, filtered);
  return filtered;
}

export function clearAllResults() {
  setItem(STORAGE_KEYS.EXAM_RESULTS, []);
  return [];
}

/* =========================================================================
 * USERS REPOSITORY HELPERS (LOCAL STORAGE - NO PASSWORDS)
 * ========================================================================= */

export function getUsers() {
  return getItem(STORAGE_KEYS.USERS, INITIAL_USERS.map(sanitizeNoPasswords));
}

export function saveUsers(users) {
  return setItem(STORAGE_KEYS.USERS, users.map(sanitizeNoPasswords));
}

/* =========================================================================
 * SESSION MANAGEMENT (SESSION STORAGE STRICTLY)
 * ========================================================================= */

/**
 * Returns the active user from Session Storage regardless of role.
 * @returns {object|null}
 */
export function getCurrentUser() {
  return getSessionItem('currentUser', null);
}

/**
 * Sets the active user in Session Storage.
 * @param {object} user
 */
export function setCurrentUser(user) {
  if (!user) {
    clearCurrentUser();
    return false;
  }
  const clean = sanitizeNoPasswords(user);
  setSessionItem('currentUser', clean);
  return true;
}

/**
 * Clears the active user session from Session Storage.
 */
export function clearCurrentUser() {
  removeSessionItem('currentUser');
  removeSessionItem(STORAGE_KEYS.ADMIN_SESSION);
  removeSessionItem(STORAGE_KEYS.ACTIVE_SESSION);
}

/* =========================================================================
 * ADMIN SESSION HELPERS (SESSION STORAGE)
 * ========================================================================= */

/**
 * Retrieves the authenticated Admin session from Session Storage.
 * Validates that the active session has role === 'admin'.
 * @returns {object|null}
 */
export function getAdminSession() {
  const session = getSessionItem('currentUser', null);
  if (session && session.role === 'admin') {
    return session;
  }
  const directAdmin = getSessionItem(STORAGE_KEYS.ADMIN_SESSION, null);
  if (directAdmin && directAdmin.role === 'admin') {
    return directAdmin;
  }
  return null;
}

/**
 * Persists an authenticated Admin session into Session Storage.
 * Stores only minimal required session information without password.
 * @param {object} sessionData
 */
export function setAdminSession(sessionData) {
  if (!sessionData) return false;
  const clean = sanitizeNoPasswords(sessionData);
  clean.role = 'admin';

  // Store in Session Storage under consistent "currentUser" key
  setSessionItem('currentUser', clean);
  setSessionItem(STORAGE_KEYS.ADMIN_SESSION, clean);

  // Ensure removed from LocalStorage
  removeItem(STORAGE_KEYS.ADMIN_SESSION);
  return true;
}

/**
 * Clears the authenticated Admin session from Session Storage.
 */
export function clearAdminSession() {
  const session = getSessionItem('currentUser', null);
  if (session && session.role === 'admin') {
    removeSessionItem('currentUser');
  }
  removeSessionItem(STORAGE_KEYS.ADMIN_SESSION);
  removeItem(STORAGE_KEYS.ADMIN_SESSION);
}

/* =========================================================================
 * STUDENT SESSION HELPERS (SESSION STORAGE)
 * ========================================================================= */

/**
 * Retrieves the authenticated Student session from Session Storage.
 * Validates that the active session has role === 'student'.
 * @returns {object|null}
 */
export function getStudentSession() {
  const session = getSessionItem('currentUser', null);
  if (session && session.role === 'student') {
    return session;
  }
  const directStudent = getSessionItem(STORAGE_KEYS.ACTIVE_SESSION, null);
  if (directStudent && directStudent.role === 'student') {
    return directStudent;
  }
  return null;
}

/**
 * Persists an authenticated Student session into Session Storage.
 * Stores only minimal required session information without password.
 * @param {object} sessionData
 */
export function setStudentSession(sessionData) {
  if (!sessionData) return false;
  const clean = sanitizeNoPasswords(sessionData);
  clean.role = 'student';

  // Store in Session Storage under consistent "currentUser" key
  setSessionItem('currentUser', clean);
  setSessionItem(STORAGE_KEYS.ACTIVE_SESSION, clean);

  // Ensure removed from LocalStorage
  removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  return true;
}

/**
 * Clears the authenticated Student session from Session Storage.
 */
export function clearStudentSession() {
  const session = getSessionItem('currentUser', null);
  if (session && session.role === 'student') {
    removeSessionItem('currentUser');
  }
  removeSessionItem(STORAGE_KEYS.ACTIVE_SESSION);
  removeItem(STORAGE_KEYS.ACTIVE_SESSION);
}

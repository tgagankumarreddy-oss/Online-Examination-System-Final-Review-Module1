import React, { useEffect, useState } from 'react';
import './App.css';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { AdminLoginView } from './admin/AdminLoginView.jsx';
import { AdminDashboardView } from './admin/AdminDashboardView.jsx';
import { AdminQuestionBankView } from './admin/AdminQuestionBankView.jsx';
import { AdminExamManagementView } from './admin/AdminExamManagementView.jsx';
import { AdminResultsAnalyticsView } from './admin/AdminResultsAnalyticsView.jsx';
import { AdminStudentManagementView } from './admin/AdminStudentManagementView.jsx';
import { INITIAL_QUESTIONS } from './data/seedData.js';
import {
  isStorageAvailable,
  initializeStorage,
  getStoredQuestions,
  getStoredExams,
  getStoredResults,
  getAdminSession,
  clearAdminSession
} from './utils/storage.js';

export default function App() {
  const [adminSession, setAdminSession] = useState(() => getAdminSession());
  const [activeNav, setActiveNav] = useState('admin_dashboard');
  const [authenticated, setAuthenticated] = useState(() => Boolean(getAdminSession()));
  const [stats, setStats] = useState({
    examsCount: 0,
    questionsCount: 0,
    activeExams: 0,
    resultsCount: 0
  });

  const refreshStats = () => {
    const questions = getStoredQuestions();
    const exams = getStoredExams();
    const results = getStoredResults();
    setStats({
      examsCount: exams.length,
      questionsCount: questions.length,
      activeExams: exams.filter((exam) => exam.status === 'Active').length,
      resultsCount: results.length
    });
  };

  useEffect(() => {
    if (isStorageAvailable()) {
      initializeStorage(INITIAL_QUESTIONS);
      refreshStats();
    }
  }, []);

  const handleLoginSuccess = (sessionPayload) => {
    setAdminSession(sessionPayload || getAdminSession());
    setAuthenticated(true);
    setActiveNav('admin_dashboard');
    refreshStats();
  };

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
    setAuthenticated(false);
    setActiveNav('admin_dashboard');
  };

  const handleNavigate = (target) => {
    if (target && target.startsWith('admin_')) {
      setActiveNav(target);
    }
  };

  if (!authenticated || !getAdminSession()) {
    return (
      <AdminLoginView
        onLoginSuccess={handleLoginSuccess}
        onBackToPortal={() => {}}
      />
    );
  }

  let currentView;
  switch (activeNav) {
    case 'admin_students':
      currentView = <AdminStudentManagementView onNavigate={handleNavigate} />;
      break;
    case 'admin_questions':
      currentView = <AdminQuestionBankView onNavigate={handleNavigate} />;
      break;
    case 'admin_exams':
      currentView = <AdminExamManagementView onNavigate={handleNavigate} />;
      break;
    case 'admin_results':
      currentView = <AdminResultsAnalyticsView onNavigate={handleNavigate} />;
      break;
    case 'admin_dashboard':
    default:
      currentView = <AdminDashboardView onNavigate={handleNavigate} stats={stats} />;
      break;
  }

  return (
    <AppLayout
      activeRole="admin"
      onRoleChange={() => {}}
      activeNav={activeNav}
      onNavChange={handleNavigate}
      adminSession={adminSession}
      onAdminLogout={handleLogout}
    >
      {currentView}
    </AppLayout>
  );
}

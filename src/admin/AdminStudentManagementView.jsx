import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input, Select, Badge } from '../components/common/FormElements.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Table } from '../components/common/Table.jsx';
import { getUsers, saveUsers, getStoredResults } from '../utils/storage.js';
import { hashPassword } from '../utils/crypto.js';
import { DEMO_STUDENTS } from '../data/demonstrationCredentials.js';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Mechanical Engineering'
];

export function AdminStudentManagementView() {
  // 1. Data State
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);

  // 2. Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 3. Modals State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Student for Modals
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 4. Form States
  const initialRegisterForm = {
    name: '',
    registrationNumber: '',
    email: '',
    phone: '',
    department: DEPARTMENTS[0],
    course: 'B.Tech CSE',
    academicYear: '2026–2027',
    section: 'A',
    password: '',
    confirmPassword: ''
  };
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [registerErrors, setRegisterErrors] = useState({});
  const [showRegisterPass, setShowRegisterPass] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    phone: '',
    department: '',
    course: '',
    academicYear: '',
    section: '',
    status: 'Active'
  });
  const [editErrors, setEditErrors] = useState({});

  const [resetPassForm, setResetPassForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [resetPassErrors, setResetPassErrors] = useState({});
  const [showResetPass, setShowResetPass] = useState(false);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Load live data from LocalStorage
  const loadData = () => {
    const allUsers = getUsers();
    const allResults = getStoredResults();
    setUsers(allUsers);
    setResults(allResults);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter only students (exclude admin records)
  const students = useMemo(() => {
    return users.filter((u) => u.role === 'student');
  }, [users]);

  // Filtered students by search & category
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.registrationNumber && s.registrationNumber.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q));

      const matchesDept =
        departmentFilter === 'ALL' ||
        (s.department && s.department.toLowerCase().includes(departmentFilter.toLowerCase()));

      const currentStatus = s.status || 'Active';
      const matchesStatus =
        statusFilter === 'ALL' || currentStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, searchQuery, departmentFilter, statusFilter]);

  // Statistics
  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => (s.status || 'Active') === 'Active').length;
  const inactiveStudentsCount = students.filter((s) => s.status === 'Inactive').length;

  // ---------------------------------------------------------------------------
  // 1. REGISTER NEW STUDENT
  // ---------------------------------------------------------------------------
  const handleOpenRegister = () => {
    setRegisterForm(initialRegisterForm);
    setRegisterErrors({});
    setShowRegisterPass(false);
    setIsRegisterModalOpen(true);
  };

  const validateRegister = () => {
    const errs = {};
    if (!registerForm.name.trim()) errs.name = 'Full name is required.';
    if (!registerForm.registrationNumber.trim()) {
      errs.registrationNumber = 'Registration number is required.';
    } else {
      const reg = registerForm.registrationNumber.trim();
      const duplicate = users.some(
        (u) =>
          u.role === 'student' &&
          (u.registrationNumber?.toLowerCase() === reg.toLowerCase() ||
            u.rollNumber?.toLowerCase() === reg.toLowerCase())
      );
      if (duplicate) {
        errs.registrationNumber = 'A student with this registration number already exists.';
      }
    }

    if (!registerForm.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!registerForm.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(registerForm.phone.trim().replace(/[-\s]/g, ''))) {
      errs.phone = 'Phone number must be a valid 10-digit number.';
    }

    if (!registerForm.department) errs.department = 'Department is required.';
    if (!registerForm.course.trim()) errs.course = 'Course / Branch is required.';
    if (!registerForm.academicYear.trim()) errs.academicYear = 'Academic year is required.';
    if (!registerForm.section.trim()) errs.section = 'Section is required.';

    if (!registerForm.password) {
      errs.password = 'Initial password is required.';
    } else if (registerForm.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setRegisterErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateRegister()) return;

    try {
      const passHash = await hashPassword(registerForm.password);
      const newStudent = {
        id: `usr_student_${Date.now()}`,
        name: registerForm.name.trim(),
        registrationNumber: registerForm.registrationNumber.trim(),
        rollNumber: registerForm.registrationNumber.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        department: registerForm.department,
        course: registerForm.course.trim(),
        semester: '6th Semester',
        batch: '2024-2028',
        academicYear: registerForm.academicYear.trim(),
        section: registerForm.section.trim().toUpperCase(),
        role: 'student',
        status: 'Active',
        passwordHash: passHash,
        registeredAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newStudent];
      saveUsers(updatedUsers);
      setUsers(updatedUsers);
      setIsRegisterModalOpen(false);
      showToast(`Student ${newStudent.name} (${newStudent.registrationNumber}) registered successfully.`);
    } catch (err) {
      console.error('Registration failed:', err);
      setRegisterErrors({ form: 'An error occurred while securing student credentials.' });
    }
  };

  // ---------------------------------------------------------------------------
  // 2. VIEW STUDENT DOSSIER
  // ---------------------------------------------------------------------------
  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // 3. EDIT STUDENT
  // ---------------------------------------------------------------------------
  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name || '',
      registrationNumber: student.registrationNumber || student.rollNumber || '',
      email: student.email || '',
      phone: student.phone || '',
      department: student.department || DEPARTMENTS[0],
      course: student.course || student.branch || 'B.Tech CSE',
      academicYear: student.academicYear || '2026–2027',
      section: student.section || 'A',
      status: student.status || 'Active'
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.name.trim()) errs.name = 'Full name is required.';
    if (!editForm.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (editForm.phone && !/^\d{10}$/.test(editForm.phone.trim().replace(/[-\s]/g, ''))) {
      errs.phone = 'Phone number must be 10 digits.';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateEdit() || !selectedStudent) return;

    const updatedUsers = users.map((u) => {
      if (u.id === selectedStudent.id) {
        return {
          ...u,
          name: editForm.name.trim(),
          email: editForm.email.trim().toLowerCase(),
          phone: editForm.phone.trim(),
          department: editForm.department,
          course: editForm.course.trim(),
          academicYear: editForm.academicYear.trim(),
          section: editForm.section.trim().toUpperCase(),
          status: editForm.status,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    setIsEditModalOpen(false);
    showToast(`Updated student profile for ${editForm.name}.`);
  };

  // ---------------------------------------------------------------------------
  // 4. TOGGLE ACCOUNT STATUS (ACTIVATE / DEACTIVATE)
  // ---------------------------------------------------------------------------
  const handleToggleStatus = (student) => {
    const currentStatus = student.status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    const confirmMsg =
      nextStatus === 'Inactive'
        ? `Are you sure you want to deactivate ${student.name} (${student.registrationNumber})? This student will be barred from logging in and taking examinations.`
        : `Reactivate student account for ${student.name}? They will be permitted to access the student portal.`;

    if (!window.confirm(confirmMsg)) return;

    const updatedUsers = users.map((u) => {
      if (u.id === student.id || (u.registrationNumber && u.registrationNumber === student.registrationNumber)) {
        return {
          ...u,
          status: nextStatus,
          statusChangedAt: new Date().toISOString()
        };
      }
      return u;
    });

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showToast(`Student ${student.name} is now ${nextStatus}.`);
  };

  // ---------------------------------------------------------------------------
  // 5. RESET PASSWORD
  // ---------------------------------------------------------------------------
  const handleOpenResetPassword = (student) => {
    setSelectedStudent(student);
    setResetPassForm({ newPassword: '', confirmPassword: '' });
    setResetPassErrors({});
    setShowResetPass(false);
    setIsResetPasswordModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const errs = {};
    if (!resetPassForm.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (resetPassForm.newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }

    if (resetPassForm.newPassword !== resetPassForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setResetPassErrors(errs);
      return;
    }

    try {
      const passHash = await hashPassword(resetPassForm.newPassword);
      const updatedUsers = users.map((u) => {
        if (u.id === selectedStudent.id || (u.registrationNumber && u.registrationNumber === selectedStudent.registrationNumber)) {
          return {
            ...u,
            passwordHash: passHash,
            passwordResetAt: new Date().toISOString()
          };
        }
        return u;
      });

      saveUsers(updatedUsers);
      setUsers(updatedUsers);
      setIsResetPasswordModalOpen(false);
      showToast(`Password successfully reset for ${selectedStudent.name}.`);
    } catch (err) {
      console.error('Password reset failed:', err);
      setResetPassErrors({ form: 'Failed to securely update password hash.' });
    }
  };

  // ---------------------------------------------------------------------------
  // 6. DELETE STUDENT
  // ---------------------------------------------------------------------------
  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedStudent) return;
    const updatedUsers = users.filter((u) => u.id !== selectedStudent.id);
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    setIsDeleteModalOpen(false);
    showToast(`Student record for ${selectedStudent.name} permanently removed.`);
  };

  // Student exam history lookup helper
  const getStudentResults = (regNum, studentId) => {
    return results.filter(
      (r) =>
        (regNum && (r.studentRoll === regNum || r.studentReg === regNum || r.registrationNumber === regNum)) ||
        (studentId && r.studentId === studentId)
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #38bdf8',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      {/* Header & Stats Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1.5rem 1.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Badge variant="cyan">ADMINISTRATION CELL</Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student Roster & Access Control</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
            Student Management & Enrollment
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Register new candidates, configure academic departments, toggle exam permissions, and reset credentials.
          </p>
        </div>

        <Button
          variant="cyan"
          size="md"
          icon="➕"
          onClick={handleOpenRegister}
        >
          Register New Student
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card
          title="Total Registered Students"
          metric={totalStudentsCount}
          metricLabel="All Enrolled Candidates"
        />
        <Card
          title="Active Exam Accounts"
          metric={activeStudentsCount}
          metricLabel="Permitted to Take Tests"
        />
        <Card
          title="Deactivated Accounts"
          metric={inactiveStudentsCount}
          metricLabel="Temporarily Suspended"
        />
        <Card
          title="Active Departments"
          metric={DEPARTMENTS.length}
          metricLabel="Under B.Tech Engineering"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end'
          }}
        >
          <Input
            label="Search Student"
            placeholder="Search by Name, Reg Number, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix="🔍"
          />

          <Select
            label="Department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Departments' },
              ...DEPARTMENTS.map((d) => ({ value: d, label: d }))
            ]}
          />

          <Select
            label="Account Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive / Suspended' }
            ]}
          />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredStudents.length}</strong> of {totalStudentsCount}
            </span>
            {(searchQuery || departmentFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('ALL');
                  setStatusFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Students Data Table */}
      <Card title="Student Directory & Examination Permissions">
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '0.25rem' }}>No Students Found</h3>
            <p style={{ fontSize: '0.85rem' }}>
              No student records matched your search query or filters. Click <strong>Register New Student</strong> to enroll a student.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--navy-900)', fontWeight: 700 }}>Candidate</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--navy-900)', fontWeight: 700 }}>Registration No.</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--navy-900)', fontWeight: 700 }}>Academic Details</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--navy-900)', fontWeight: 700 }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--navy-900)', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--navy-900)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => {
                  const currentStatus = s.status || 'Active';
                  const isDeactivated = currentStatus === 'Inactive';
                  const candidateAttempts = getStudentResults(s.registrationNumber || s.rollNumber, s.id);

                  return (
                    <tr
                      key={s.id || idx}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: isDeactivated ? '#fef2f2' : idx % 2 === 0 ? '#ffffff' : 'var(--bg-body)',
                        opacity: isDeactivated ? 0.85 : 1
                      }}
                    >
                      {/* Name & Badge */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: isDeactivated ? '#fee2e2' : 'var(--cyan-light)',
                              color: isDeactivated ? '#b91c1c' : 'var(--cyan-800)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}
                          >
                            {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {candidateAttempts.length} Completed Exam{candidateAttempts.length === 1 ? '' : 's'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reg Number */}
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy-800)' }}>
                        {s.registrationNumber || s.rollNumber}
                      </td>

                      {/* Academic */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ color: 'var(--navy-900)', fontWeight: 600 }}>{s.department}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.course || 'B.Tech CSE'} • Sec {s.section || 'A'} • {s.academicYear || '2026–2027'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ color: 'var(--navy-800)' }}>{s.email}</div>
                        {s.phone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {s.phone}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge variant={isDeactivated ? 'danger' : 'success'}>
                          {isDeactivated ? '● INACTIVE' : '● ACTIVE'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            title="View Student Dossier"
                            onClick={() => handleOpenView(s)}
                          >
                            👁️
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Edit Student Information"
                            onClick={() => handleOpenEdit(s)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Reset Password"
                            onClick={() => handleOpenResetPassword(s)}
                          >
                            🔑
                          </Button>
                          <Button
                            variant={isDeactivated ? 'success' : 'outline'}
                            size="sm"
                            title={isDeactivated ? 'Activate Student Account' : 'Deactivate / Block Student'}
                            onClick={() => handleToggleStatus(s)}
                            style={{
                              borderColor: isDeactivated ? undefined : '#fca5a5',
                              color: isDeactivated ? undefined : '#b91c1c'
                            }}
                          >
                            {isDeactivated ? 'Activate' : 'Deactivate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete Student Record"
                            onClick={() => handleOpenDelete(s)}
                            style={{ color: '#ef4444' }}
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 1: REGISTER NEW STUDENT                                       */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Student"
        maxWidth="640px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <Button variant="secondary" size="md" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="md" onClick={handleRegisterSubmit}>
              Complete Enrollment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {registerErrors.form && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
              {registerErrors.form}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Input
              label="Full Name"
              placeholder="e.g. A. Rajesh Kumar"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              error={registerErrors.name}
              required
            />
            <Input
              label="Registration Number"
              placeholder="e.g. 2500032890"
              value={registerForm.registrationNumber}
              onChange={(e) => setRegisterForm({ ...registerForm, registrationNumber: e.target.value })}
              error={registerErrors.registrationNumber}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Input
              label="Institutional Email Address"
              type="email"
              placeholder="e.g. rajesh.kumar@eduexam.ac.in"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              error={registerErrors.email}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. 9876543210 (10 digits)"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
              error={registerErrors.phone}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Select
              label="Department"
              value={registerForm.department}
              onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              error={registerErrors.department}
              required
            />
            <Input
              label="Course / Branch"
              placeholder="e.g. B.Tech Computer Science"
              value={registerForm.course}
              onChange={(e) => setRegisterForm({ ...registerForm, course: e.target.value })}
              error={registerErrors.course}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Input
              label="Academic Year"
              placeholder="e.g. 2026–2027"
              value={registerForm.academicYear}
              onChange={(e) => setRegisterForm({ ...registerForm, academicYear: e.target.value })}
              error={registerErrors.academicYear}
              required
            />
            <Input
              label="Section"
              placeholder="e.g. A, B, C"
              value={registerForm.section}
              onChange={(e) => setRegisterForm({ ...registerForm, section: e.target.value })}
              error={registerErrors.section}
              required
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Initial Authentication Credentials
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
              <div style={{ position: 'relative' }}>
                <Input
                  label="Initial Password"
                  type={showRegisterPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  error={registerErrors.password}
                  required
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Input
                  label="Confirm Password"
                  type={showRegisterPass ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  error={registerErrors.confirmPassword}
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="toggleRegPass"
                checked={showRegisterPass}
                onChange={(e) => setShowRegisterPass(e.target.checked)}
              />
              <label htmlFor="toggleRegPass" style={{ fontSize: '0.8rem', color: 'var(--navy-800)', cursor: 'pointer' }}>
                Show password text
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: EDIT STUDENT INFORMATION                                  */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Information"
        maxWidth="600px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <Button variant="secondary" size="md" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="md" onClick={handleEditSubmit}>
              Save Profile Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Input
              label="Full Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              error={editErrors.name}
              required
            />
            <Input
              label="Registration Number"
              value={editForm.registrationNumber}
              disabled
              hint="Immutable identifier"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Input
              label="Institutional Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              error={editErrors.email}
              required
            />
            <Input
              label="Phone Number"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              error={editErrors.phone}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Select
              label="Department"
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
            />
            <Input
              label="Course / Branch"
              value={editForm.course}
              onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <Input
              label="Academic Year"
              value={editForm.academicYear}
              onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
            />
            <Select
              label="Account Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active (Permitted)' },
                { value: 'Inactive', label: 'Inactive (Blocked)' }
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 3: VIEW STUDENT DOSSIER                                       */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Academic Dossier"
        maxWidth="600px"
        footer={
          <Button variant="secondary" size="md" onClick={() => setIsViewModalOpen(false)}>
            Close Dossier
          </Button>
        }
      >
        {selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'var(--bg-body)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cyan-light)',
                  color: 'var(--cyan-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}
              >
                {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--navy-900)' }}>
                  {selectedStudent.name}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  Reg: <strong>{selectedStudent.registrationNumber || selectedStudent.rollNumber}</strong> • Status: <Badge variant={selectedStudent.status === 'Inactive' ? 'danger' : 'success'}>{selectedStudent.status || 'Active'}</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Institutional Email:</div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{selectedStudent.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone Number:</div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{selectedStudent.phone || 'Not configured'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Department:</div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{selectedStudent.department}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Course / Branch:</div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{selectedStudent.course || 'B.Tech CSE'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Academic Year & Section:</div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                  {selectedStudent.academicYear || '2026–2027'} (Sec {selectedStudent.section || 'A'})
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Enrolled On:</div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                  {selectedStudent.registeredAt ? new Date(selectedStudent.registeredAt).toLocaleDateString() : 'System Seed Foundation'}
                </div>
              </div>
            </div>

            {/* Completed Exams Sub-table */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Completed Examinations History
              </div>
              {getStudentResults(selectedStudent.registrationNumber || selectedStudent.rollNumber, selectedStudent.id).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No examination attempts recorded for this candidate yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getStudentResults(selectedStudent.registrationNumber || selectedStudent.rollNumber, selectedStudent.id).map((r, i) => (
                    <div
                      key={r.id || i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-body)',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div>
                        <strong>{r.examTitle || r.examinationName || r.examCode}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          Submitted: {new Date(r.submittedAt || r.submissionTime).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: r.passed ? '#059669' : '#dc2626' }}>
                          {r.marksScored || r.marksObtained || 0} / {r.totalMarks || r.maximumMarks || 0} ({r.percentage}%)
                        </div>
                        <Badge variant={r.passed ? 'success' : 'danger'}>{r.passed ? 'PASS' : 'FAIL'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 4: RESET PASSWORD                                             */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Reset Student Password"
        maxWidth="500px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <Button variant="secondary" size="md" onClick={() => setIsResetPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="cyan" size="md" onClick={handleResetPasswordSubmit}>
              Save New Password
            </Button>
          </div>
        }
      >
        <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--navy-900)' }}>
            Resetting password for candidate: <strong>{selectedStudent?.name}</strong> (Reg: <strong>{selectedStudent?.registrationNumber || selectedStudent?.rollNumber}</strong>)
          </div>

          {resetPassErrors.form && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
              {resetPassErrors.form}
            </div>
          )}

          <Input
            label="New Password"
            type={showResetPass ? 'text' : 'password'}
            placeholder="Minimum 6 characters"
            value={resetPassForm.newPassword}
            onChange={(e) => setResetPassForm({ ...resetPassForm, newPassword: e.target.value })}
            error={resetPassErrors.newPassword}
            required
          />

          <Input
            label="Confirm New Password"
            type={showResetPass ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={resetPassForm.confirmPassword}
            onChange={(e) => setResetPassForm({ ...resetPassForm, confirmPassword: e.target.value })}
            error={resetPassErrors.confirmPassword}
            required
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="toggleResetPass"
              checked={showResetPass}
              onChange={(e) => setShowResetPass(e.target.checked)}
            />
            <label htmlFor="toggleResetPass" style={{ fontSize: '0.8rem', color: 'var(--navy-800)', cursor: 'pointer' }}>
              Show password text
            </label>
          </div>

          <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
            🔒 The new password will be hashed using SHA-256 before storing. Plaintext passwords are never saved.
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 5: CONFIRM DELETE STUDENT                                     */}
      {/* ------------------------------------------------------------------- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Student Deletion"
        maxWidth="480px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <Button variant="secondary" size="md" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleDeleteConfirm}>
              Permanently Delete Student
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
          <p style={{ color: 'var(--navy-900)', margin: 0 }}>
            Are you sure you want to permanently delete the student account for <strong>{selectedStudent?.name}</strong> (Registration: <strong>{selectedStudent?.registrationNumber || selectedStudent?.rollNumber}</strong>)?
          </p>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
            ⚠️ This will remove the student record from the local user roster. This action cannot be undone.
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminStudentManagementView;

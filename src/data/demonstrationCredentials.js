/**
 * Demonstration Credentials Configuration
 * Online Examination System - Frontend Academic Demonstration
 *
 * NOTE: These are demonstration credentials configured strictly for academic showcase
 * and local frontend testing. In a client-side architecture without a backend server,
 * JavaScript files can be inspected by users via browser developer tools.
 * Storing demonstration credentials in this file does not make them secure or suitable
 * for production environments. Server-side authentication and secure password hashing
 * would be mandatory for production use.
 */

export const DEMO_ADMIN = {
  name: 'Prof. R. Srinivasan',
  username: 'admin',
  password: 'Admin@CSE2026!',
  role: 'admin',
  department: 'Computer Science & Engineering',
  designation: 'Head of Department & Chief Examiner',
  academicYear: '2026–2027',
  email: 'r.srinivasan@eduexam.ac.in'
};

export const DEMO_STUDENTS = [
  {
    name: 'T. Gagan Kumar Reddy',
    registrationNumber: '2500032735',
    rollNumber: '2500032735',
    password: 'GkReddy@2735!',
    role: 'student',
    department: 'B.Tech Computer Science and Engineering',
    semester: '6th Semester',
    batch: '2024-2028',
    academicYear: '2026–2027',
    email: 'gagan.reddy@eduexam.ac.in'
  },
  {
    name: 'N. P. Shyam',
    registrationNumber: '2500032722',
    rollNumber: '2500032722',
    password: 'Shyam#2722CSE',
    role: 'student',
    department: 'B.Tech Computer Science and Engineering',
    semester: '6th Semester',
    batch: '2024-2028',
    academicYear: '2026–2027',
    email: 'np.shyam@eduexam.ac.in'
  },
  {
    name: 'D. Ajay Ramachandra',
    registrationNumber: '2500032721',
    rollNumber: '2500032721',
    password: 'Ajay@2721Exam',
    role: 'student',
    department: 'B.Tech Computer Science and Engineering',
    semester: '6th Semester',
    batch: '2024-2028',
    academicYear: '2026–2027',
    email: 'ajay.ramachandra@eduexam.ac.in'
  }
];

/**
 * Authenticates an administrator against the demonstration credentials.
 * @param {string} username - Entered username
 * @param {string} password - Entered password
 * @returns {object|null} Sanitized session object without password, or null if invalid
 */
export function verifyAdminCredentials(username, password) {
  if (!username || !password) return null;
  const cleanUser = username.trim();
  const cleanPass = password.trim();

  const isMatch =
    (cleanUser.toLowerCase() === DEMO_ADMIN.username.toLowerCase() ||
      cleanUser.toLowerCase() === DEMO_ADMIN.email.toLowerCase()) &&
    cleanPass === DEMO_ADMIN.password;

  if (!isMatch) return null;

  // Return minimal active session payload - NEVER include password
  return {
    username: DEMO_ADMIN.username,
    name: DEMO_ADMIN.name,
    role: 'admin',
    department: DEMO_ADMIN.department,
    designation: DEMO_ADMIN.designation,
    academicYear: DEMO_ADMIN.academicYear,
    email: DEMO_ADMIN.email,
    loginTimestamp: new Date().toISOString()
  };
}

/**
 * Authenticates a candidate student against the demonstration credentials.
 * @param {string} regNumber - Entered registration number
 * @param {string} password - Entered password
 * @returns {object|null} Sanitized session object without password, or null if invalid
 */
export function verifyStudentCredentials(regNumber, password) {
  if (!regNumber || !password) return null;
  const cleanReg = regNumber.trim();
  const cleanPass = password.trim();

  const matched = DEMO_STUDENTS.find(
    (s) =>
      (s.registrationNumber === cleanReg || s.rollNumber === cleanReg) &&
      s.password === cleanPass
  );

  if (!matched) return null;

  // Return minimal active session payload - NEVER include password
  return {
    registrationNumber: matched.registrationNumber,
    rollNumber: matched.rollNumber,
    name: matched.name,
    role: 'student',
    department: matched.department,
    semester: matched.semester,
    batch: matched.batch,
    academicYear: matched.academicYear,
    email: matched.email,
    loginTimestamp: new Date().toISOString()
  };
}

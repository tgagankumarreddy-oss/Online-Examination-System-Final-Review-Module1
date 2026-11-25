/**
 * Initial Seed Data for the Online Examination System (B.Tech CSE)
 * Loaded into Browser LocalStorage on initial load if not already present.
 */

export const INITIAL_USERS = [
  {
    id: "usr_admin_1",
    username: "admin",
    email: "r.srinivasan@eduexam.ac.in",
    name: "Prof. R. Srinivasan",
    role: "admin",
    department: "Computer Science & Engineering",
    designation: "Head of Department & Chief Examiner",
    academicYear: "2026–2027"
  },
  {
    id: "usr_student_1",
    registrationNumber: "2500032735",
    rollNumber: "2500032735",
    email: "gagan.reddy@eduexam.ac.in",
    name: "T. Gagan Kumar Reddy",
    role: "student",
    department: "B.Tech Computer Science and Engineering",
    semester: "6th Semester",
    batch: "2024-2028",
    academicYear: "2026–2027"
  },
  {
    id: "usr_student_2",
    registrationNumber: "2500032722",
    rollNumber: "2500032722",
    email: "np.shyam@eduexam.ac.in",
    name: "N. P. Shyam",
    role: "student",
    department: "B.Tech Computer Science and Engineering",
    semester: "6th Semester",
    batch: "2024-2028",
    academicYear: "2026–2027"
  },
  {
    id: "usr_student_3",
    registrationNumber: "2500032721",
    rollNumber: "2500032721",
    email: "ajay.ramachandra@eduexam.ac.in",
    name: "D. Ajay Ramachandra",
    role: "student",
    department: "B.Tech Computer Science and Engineering",
    semester: "6th Semester",
    batch: "2024-2028",
    academicYear: "2026–2027"
  }
];

export const INITIAL_EXAMS = [
  {
    id: "exam_dsa_01",
    code: "CS-301",
    title: "Data Structures and Algorithms – Internal Assessment 1",
    category: "Core CSE",
    durationMinutes: 15,
    totalMarks: 20,
    passingMarks: 8,
    negativeMarking: 0.25,
    status: "Active",
    questionIds: [
      "q_dsa_1", "q_dsa_2", "q_dsa_3", "q_dsa_4", "q_dsa_5",
      "q_dsa_6", "q_dsa_7", "q_dsa_8", "q_dsa_9", "q_dsa_10"
    ],
    attemptPolicy: "Single Attempt",
    instructions: [
      "Total duration is 15 minutes. The timer starts automatically upon entry.",
      "Each correct answer awards 2.0 marks. An incorrect answer deducts 0.25 marks.",
      "Unattempted questions receive zero penalty.",
      "You can flag questions for review and return to them anytime before final submission.",
      "Do not switch tabs or exit fullscreen; violation warnings will be recorded.",
      "The system will automatically auto-submit your exam when the countdown timer hits 00:00."
    ],
    createdAt: "2026-11-20T10:00:00.000Z"
  },
  {
    id: "exam_dbms_03",
    code: "CS-503",
    title: "Database Management Systems – Mid Semester Examination",
    category: "Databases",
    durationMinutes: 12,
    totalMarks: 12,
    passingMarks: 5,
    negativeMarking: 0.0,
    status: "Active",
    questionIds: [
      "q_dbms_1", "q_dbms_2", "q_dbms_3",
      "q_dbms_4", "q_dbms_5", "q_dbms_6"
    ],
    attemptPolicy: "Multiple Attempts",
    instructions: [
      "Total duration is 12 minutes.",
      "No negative marking for this foundational test.",
      "Each question carries 2.0 marks.",
      "Topics include SQL, Normalization, ACID properties, and B+ Trees."
    ],
    createdAt: "2026-11-22T09:15:00.000Z"
  },
  {
    id: "exam_os_02",
    code: "CS-402",
    title: "Operating Systems – Internal Assessment 2",
    category: "Systems",
    durationMinutes: 10,
    totalMarks: 16,
    passingMarks: 6,
    negativeMarking: 0.25,
    status: "Active",
    questionIds: [
      "q_os_1", "q_os_2", "q_os_3", "q_os_4",
      "q_os_5", "q_os_6", "q_os_7", "q_os_8"
    ],
    attemptPolicy: "Single Attempt",
    instructions: [
      "Total duration is 10 minutes.",
      "Each question carries 2.0 marks. Negative mark for wrong answer is 0.25.",
      "Topics include CPU scheduling, virtual memory, race conditions, and deadlocks.",
      "Use the Question Palette on the right to navigate between sections."
    ],
    createdAt: "2026-11-21T14:30:00.000Z"
  },
  {
    id: "exam_cn_04",
    code: "CS-601",
    title: "Computer Networks – Practice Examination",
    category: "Networks",
    durationMinutes: 10,
    totalMarks: 8,
    passingMarks: 4,
    negativeMarking: 0.25,
    status: "Active",
    questionIds: [
      "q_cn_1", "q_cn_2", "q_cn_3", "q_cn_4"
    ],
    attemptPolicy: "Multiple Attempts",
    instructions: [
      "Total duration is 10 minutes.",
      "Each question carries 2.0 marks. Negative mark for wrong answer is 0.25.",
      "Topics include OSI Reference Model, ARP, TCP Congestion Control, and DNS."
    ],
    createdAt: "2026-11-23T08:00:00.000Z"
  },
  {
    id: "exam_ai_05",
    code: "CS-702",
    title: "Artificial Intelligence – Model Examination",
    category: "Artificial Intelligence",
    durationMinutes: 10,
    totalMarks: 8,
    passingMarks: 4,
    negativeMarking: 0.0,
    status: "Active",
    questionIds: [
      "q_ai_1", "q_ai_2", "q_ai_3", "q_ai_4"
    ],
    attemptPolicy: "Single Attempt",
    instructions: [
      "Total duration is 10 minutes.",
      "Each question carries 2.0 marks. No negative marking.",
      "Topics include Heuristic Search, Minimax & Alpha-Beta Pruning, Reinforcement Learning, and Neural Activations."
    ],
    createdAt: "2026-11-24T09:00:00.000Z"
  }
];

export const INITIAL_QUESTIONS = [
  // EXAM 1: DSA (10 questions, 2 marks each = 20 total)
  {
    id: "q_dsa_1",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 1,
    question: "What is the worst-case time complexity of QuickSort when the pivot element is always chosen as the smallest or largest element?",
    questionText: "What is the worst-case time complexity of QuickSort when the pivot element is always chosen as the smallest or largest element?",
    options: [
      "O(n log n)",
      "O(n)",
      "O(n²)",
      "O(log n)"
    ],
    correctAnswer: 2,
    correctOption: "C",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Sorting Algorithms",
    explanation: "When the selected pivot divides the array into subproblems of size 0 and n-1 at each recursion step (e.g., sorted array with first or last element as pivot), the recurrence relation becomes T(n) = T(n-1) + O(n), which resolves to O(n²)."
  },
  {
    id: "q_dsa_2",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 2,
    question: "Which of the following data structures is typically used to implement Breadth-First Search (BFS) traversal of a graph?",
    questionText: "Which of the following data structures is typically used to implement Breadth-First Search (BFS) traversal of a graph?",
    options: [
      "Stack",
      "Queue",
      "Binary Search Tree",
      "Min-Heap"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Graph Algorithms",
    explanation: "Breadth-First Search visits vertices level by level in First-In, First-Out order, making a FIFO Queue the fundamental data structure for maintaining the frontier of vertices."
  },
  {
    id: "q_dsa_3",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 3,
    question: "What is the balance factor constraint for any node in an AVL Tree?",
    questionText: "What is the balance factor constraint for any node in an AVL Tree?",
    options: [
      "Height difference between left and right subtrees must be in {-1, 0, 1}",
      "Height difference between left and right subtrees must strictly equal 0",
      "Number of nodes in left subtree equals right subtree",
      "Balance factor can be any value between -2 and +2"
    ],
    correctAnswer: 0,
    correctOption: "A",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Self-Balancing Trees",
    explanation: "An AVL tree is a self-balancing binary search tree where the difference between heights of left and right subtrees for any node cannot exceed 1. Hence, balance factor must be in {-1, 0, 1}."
  },
  {
    id: "q_dsa_4",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 4,
    question: "Which algorithm finds the Single Source Shortest Path in a weighted graph with non-negative edge weights?",
    questionText: "Which algorithm finds the Single Source Shortest Path in a weighted graph with non-negative edge weights?",
    options: [
      "Prim's Algorithm",
      "Kruskal's Algorithm",
      "Dijkstra's Algorithm",
      "Floyd-Warshall Algorithm"
    ],
    correctAnswer: 2,
    correctOption: "C",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Greedy Algorithms",
    explanation: "Dijkstra's algorithm computes the shortest path from a single source vertex to all other vertices in graphs with non-negative weights using a priority queue in O((V + E) log V) time."
  },
  {
    id: "q_dsa_5",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 5,
    question: "What is the minimum number of stacks required to implement a standard First-In-First-Out (FIFO) Queue?",
    questionText: "What is the minimum number of stacks required to implement a standard First-In-First-Out (FIFO) Queue?",
    options: [
      "1",
      "2",
      "3",
      "Cannot be implemented using stacks"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Stacks & Queues",
    explanation: "Two stacks (an input stack for enqueue and an output stack for dequeue) are required to invert the LIFO order twice, restoring the desired FIFO order with amortized O(1) operations."
  },
  {
    id: "q_dsa_6",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 6,
    question: "In a min-heap with N elements, where is the second smallest element always located?",
    questionText: "In a min-heap with N elements, where is the second smallest element always located?",
    options: [
      "At index 0 (the root)",
      "Either at index 1 or index 2 (children of the root)",
      "At any leaf node",
      "At index N - 1"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Heaps",
    explanation: "In a 0-indexed min-heap, the root (index 0) holds the smallest element. By the heap property, the second smallest element must be one of the immediate children of the root (indices 1 or 2)."
  },
  {
    id: "q_dsa_7",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 7,
    question: "Which algorithmic paradigm is employed by the 0/1 Knapsack problem when solved in O(n*W) time?",
    questionText: "Which algorithmic paradigm is employed by the 0/1 Knapsack problem when solved in O(n*W) time?",
    options: [
      "Greedy Technique",
      "Dynamic Programming",
      "Divide and Conquer",
      "Backtracking with pruning only"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Dynamic Programming",
    explanation: "0/1 Knapsack exhibits overlapping subproblems and optimal substructure. It cannot be solved greedily; dynamic programming achieves pseudo-polynomial O(n*W) runtime using tabulation or memoization."
  },
  {
    id: "q_dsa_8",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 8,
    question: "What is the primary resolution strategy used in Open Addressing collision resolution known as Quadratic Probing?",
    questionText: "What is the primary resolution strategy used in Open Addressing collision resolution known as Quadratic Probing?",
    options: [
      "hash(key, i) = (h(key) + i) % TableSize",
      "hash(key, i) = (h(key) + c1*i + c2*i²) % TableSize",
      "Creating a linked list at each bucket",
      "Hashing the result using a secondary hash function h2(key)"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Hard",
    topic: "Hashing",
    explanation: "Quadratic probing calculates probe positions using quadratic polynomial offsets (c1*i + c2*i²) added to the original hash value to mitigate primary clustering."
  },
  {
    id: "q_dsa_9",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 9,
    question: "What is the maximum number of nodes in a binary tree of height 'h' (assuming root has height 0)?",
    questionText: "What is the maximum number of nodes in a binary tree of height 'h' (assuming root has height 0)?",
    options: [
      "2^h - 1",
      "2^(h + 1) - 1",
      "2^h",
      "h² + 1"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Trees",
    explanation: "A perfect binary tree of height h with root at level 0 has nodes summing: 2^0 + 2^1 + ... + 2^h = 2^(h+1) - 1."
  },
  {
    id: "q_dsa_10",
    examId: "exam_dsa_01",
    subjectCode: "CS-301",
    course: "Data Structures & Algorithms",
    questionNumber: 10,
    question: "What is the space complexity of an adjacency matrix representation of a graph with V vertices and E edges?",
    questionText: "What is the space complexity of an adjacency matrix representation of a graph with V vertices and E edges?",
    options: [
      "O(V + E)",
      "O(V²)",
      "O(E²)",
      "O(V * E)"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Graph Representation",
    explanation: "An adjacency matrix allocates a 2D matrix of size V x V irrespective of the number of edges, requiring O(V²) space."
  },

  // EXAM 2: OPERATING SYSTEMS (8 questions, 2 marks each = 16 total)
  {
    id: "q_os_1",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 1,
    question: "Which condition is NOT one of Coffman's four necessary conditions for a Deadlock to occur?",
    questionText: "Which condition is NOT one of Coffman's four necessary conditions for a Deadlock to occur?",
    options: [
      "Mutual Exclusion",
      "Preemption Allowed",
      "Hold and Wait",
      "Circular Wait"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Deadlocks",
    explanation: "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlocks cannot persist."
  },
  {
    id: "q_os_2",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 2,
    question: "What phenomenon occurs in paging when increasing the number of page frames results in an increased number of page faults for FIFO replacement?",
    questionText: "What phenomenon occurs in paging when increasing the number of page frames results in an increased number of page faults for FIFO replacement?",
    options: [
      "Thrashing",
      "Belady's Anomaly",
      "Priority Inversion",
      "Convoy Effect"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Memory Management",
    explanation: "Belady's Anomaly describes the counter-intuitive situation where increasing page frames leads to more page faults under First-In, First-Out (FIFO) page replacement."
  },
  {
    id: "q_os_3",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 3,
    question: "Which CPU scheduling algorithm is mathematically optimal in terms of minimizing average waiting time?",
    questionText: "Which CPU scheduling algorithm is mathematically optimal in terms of minimizing average waiting time?",
    options: [
      "First-Come, First-Served (FCFS)",
      "Round Robin (RR)",
      "Shortest Job First (SJF) / Shortest Remaining Time First",
      "Priority Scheduling"
    ],
    correctAnswer: 2,
    correctOption: "C",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "CPU Scheduling",
    explanation: "Shortest Job First (SJF) is provably optimal because scheduling a shorter process before a longer process decreases waiting time for the short process more than it increases waiting time for the long process."
  },
  {
    id: "q_os_4",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 4,
    question: "What is the role of the Translation Lookaside Buffer (TLB) in virtual memory systems?",
    questionText: "What is the role of the Translation Lookaside Buffer (TLB) in virtual memory systems?",
    options: [
      "Stores operating system kernel instructions",
      "A fast hardware cache of recent virtual-to-physical address translations",
      "Buffers disk write blocks",
      "Manages network packets"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Virtual Memory",
    explanation: "The TLB is an associative memory cache inside the MMU that stores recent page table entries (virtual page number to physical frame number) to avoid multiple RAM memory accesses during address translation."
  },
  {
    id: "q_os_5",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 5,
    question: "In UNIX-like operating systems, what system call creates an exact duplicate child process of the caller?",
    questionText: "In UNIX-like operating systems, what system call creates an exact duplicate child process of the caller?",
    options: [
      "fork()",
      "exec()",
      "spawn()",
      "clone()"
    ],
    correctAnswer: 0,
    correctOption: "A",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Process Management",
    explanation: "The fork() system call creates a new child process with its own copy of the parent's address space, file descriptors, and registers. It returns 0 to the child and the child's PID to the parent."
  },
  {
    id: "q_os_6",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 6,
    question: "What is a 'Race Condition' in concurrent programming?",
    questionText: "What is a 'Race Condition' in concurrent programming?",
    options: [
      "When two processes compete for CPU clock frequency",
      "When the outcome of concurrent execution depends unpredictably on the order of execution",
      "When a thread is starved of memory allocation",
      "When a system continuously pages without doing useful work"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "Synchronization",
    explanation: "A race condition occurs when multiple threads or processes access and manipulate shared data concurrently and the final result depends on the order or timing in which instructions execute."
  },
  {
    id: "q_os_7",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 7,
    question: "What is an Inode in Unix file systems?",
    questionText: "What is an Inode in Unix file systems?",
    options: [
      "The name of the root directory",
      "A data structure containing file metadata such as size, permissions, and disk block pointers",
      "The partition boot record",
      "A cache for directory strings"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "File Systems",
    explanation: "An inode (index node) stores all metadata about a filesystem object (file or directory) except its filename and actual data contents: permissions, owner, timestamps, and pointers to storage blocks."
  },
  {
    id: "q_os_8",
    examId: "exam_os_02",
    subjectCode: "CS-402",
    course: "Operating Systems",
    questionNumber: 8,
    question: "Which synchronization primitive consists of an integer variable accessed only via atomic wait() (P) and signal() (V) operations?",
    questionText: "Which synchronization primitive consists of an integer variable accessed only via atomic wait() (P) and signal() (V) operations?",
    options: [
      "Monitor",
      "Semaphore",
      "Spinlock only",
      "Barrier"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Synchronization",
    explanation: "Dijkstra introduced the Semaphore as an integer variable that, apart from initialization, is accessed only through two standard atomic operations: wait() (or P) and signal() (or V)."
  },

  // EXAM 3: DBMS (6 questions, 2 marks each = 12 total)
  {
    id: "q_dbms_1",
    examId: "exam_dbms_03",
    subjectCode: "CS-503",
    course: "Database Management Systems",
    questionNumber: 1,
    question: "Which normal form eliminates transitive functional dependencies on non-prime attributes?",
    questionText: "Which normal form eliminates transitive functional dependencies on non-prime attributes?",
    options: [
      "First Normal Form (1NF)",
      "Second Normal Form (2NF)",
      "Third Normal Form (3NF)",
      "Boyce-Codd Normal Form (BCNF)"
    ],
    correctAnswer: 2,
    correctOption: "C",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Medium",
    topic: "Normalization",
    explanation: "A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on any candidate key (X -> Y requires X is a superkey or Y is a prime attribute)."
  },
  {
    id: "q_dbms_2",
    examId: "exam_dbms_03",
    subjectCode: "CS-503",
    course: "Database Management Systems",
    questionNumber: 2,
    question: "In ACID properties of transactions, what does 'Atomicity' guarantee?",
    questionText: "In ACID properties of transactions, what does 'Atomicity' guarantee?",
    options: [
      "Transactions are executed in isolation from other concurrent operations",
      "Either all operations of a transaction execute completely, or none are reflected",
      "The database transforms from one valid state to another valid state",
      "Committed changes persist even during unexpected system power loss"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Easy",
    topic: "Transactions",
    explanation: "Atomicity ensures an 'all-or-nothing' execution rule. If any part of a transaction fails, all updates are rolled back to the pre-transaction state."
  },
  {
    id: "q_dbms_3",
    examId: "exam_dbms_03",
    subjectCode: "CS-503",
    course: "Database Management Systems",
    questionNumber: 3,
    question: "Which SQL clause is used to filter records aggregated by a GROUP BY clause?",
    questionText: "Which SQL clause is used to filter records aggregated by a GROUP BY clause?",
    options: [
      "WHERE",
      "HAVING",
      "FILTER BY",
      "ORDER BY"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Easy",
    topic: "SQL Queries",
    explanation: "WHERE filters rows before aggregation takes place, whereas HAVING filters summary groups produced by the GROUP BY clause."
  },
  {
    id: "q_dbms_4",
    examId: "exam_dbms_03",
    subjectCode: "CS-503",
    course: "Database Management Systems",
    questionNumber: 4,
    question: "Why are B+ Trees predominantly preferred over Binary Search Trees for relational database indexing on disk storage?",
    questionText: "Why are B+ Trees predominantly preferred over Binary Search Trees for relational database indexing on disk storage?",
    options: [
      "B+ Trees have fewer disk I/O operations due to high fan-out and leaf-level sequential traversal",
      "Binary search trees require less memory cache",
      "B+ Trees don't require balancing",
      "B+ Trees allow duplicate primary keys"
    ],
    correctAnswer: 0,
    correctOption: "A",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Hard",
    topic: "Indexing",
    explanation: "B+ trees have a high branching factor (fan-out), keeping tree height very shallow (typically 3-4 levels) which reduces disk I/O reads. Furthermore, linked leaf nodes provide fast range query scans."
  },
  {
    id: "q_dbms_5",
    examId: "exam_dbms_03",
    subjectCode: "CS-503",
    course: "Database Management Systems",
    questionNumber: 5,
    question: "What type of join returns all rows from the left table, and matched rows from the right table, filling nulls if no match?",
    questionText: "What type of join returns all rows from the left table, and matched rows from the right table, filling nulls if no match?",
    options: [
      "INNER JOIN",
      "LEFT OUTER JOIN",
      "RIGHT OUTER JOIN",
      "CROSS JOIN"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Easy",
    topic: "Relational Algebra",
    explanation: "A LEFT OUTER JOIN preserves all records from the left relation regardless of whether a matching record exists in the right relation; missing attributes are populated with NULL."
  },
  {
    id: "q_dbms_6",
    examId: "exam_dbms_03",
    subjectCode: "CS-503",
    course: "Database Management Systems",
    questionNumber: 6,
    question: "Which schedule property guarantees that once a transaction commits, it will never need to be rolled back due to failure of another uncommitted transaction?",
    questionText: "Which schedule property guarantees that once a transaction commits, it will never need to be rolled back due to failure of another uncommitted transaction?",
    options: [
      "Serial Schedule",
      "Cascadeless Recoverable Schedule",
      "Strict Schedule",
      "Conflict-Serializable Schedule"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Hard",
    topic: "Concurrency Control",
    explanation: "In a cascadeless schedule, transactions read only committed values from other transactions, preventing cascading aborts (domino effect) when a transaction rolls back."
  },

  // EXAM 4: COMPUTER NETWORKS (4 questions, 2 marks each = 8 total)
  {
    id: "q_cn_1",
    examId: "exam_cn_04",
    subjectCode: "CS-601",
    course: "Computer Networks",
    questionNumber: 1,
    question: "In the OSI reference model, which layer provides reliable end-to-end communication, flow control, and error recovery?",
    questionText: "In the OSI reference model, which layer provides reliable end-to-end communication, flow control, and error recovery?",
    options: [
      "Data Link Layer",
      "Transport Layer",
      "Network Layer",
      "Session Layer"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Medium",
    topic: "OSI Reference Model",
    explanation: "The Transport Layer (Layer 4) is responsible for host-to-host process communication, sequencing, flow control, and retransmission via protocols like TCP."
  },
  {
    id: "q_cn_2",
    examId: "exam_cn_04",
    subjectCode: "CS-601",
    course: "Computer Networks",
    questionNumber: 2,
    question: "What is the primary role of the Address Resolution Protocol (ARP) in IPv4 local area networks?",
    questionText: "What is the primary role of the Address Resolution Protocol (ARP) in IPv4 local area networks?",
    options: [
      "Resolving domain names to IP addresses",
      "Mapping a 32-bit IPv4 address to a 48-bit physical MAC address",
      "Translating private IP addresses to public routable IP addresses",
      "Assigning dynamic IP addresses automatically to local host machines"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Network Layer & Addressing",
    explanation: "ARP broadcasts a request onto the local link layer network to determine the 48-bit Ethernet MAC hardware address corresponding to a known 32-bit IPv4 target."
  },
  {
    id: "q_cn_3",
    examId: "exam_cn_04",
    subjectCode: "CS-601",
    course: "Computer Networks",
    questionNumber: 3,
    question: "Which TCP congestion control event is directly triggered upon receipt of three duplicate acknowledgments (3 dup-ACKs)?",
    questionText: "Which TCP congestion control event is directly triggered upon receipt of three duplicate acknowledgments (3 dup-ACKs)?",
    options: [
      "Slow Start reset to 1 MSS",
      "Fast Retransmit & Fast Recovery",
      "Additive Increase without congestion window reduction",
      "Connection termination with FIN-ACK"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Hard",
    topic: "TCP Congestion Control",
    explanation: "Receipt of three duplicate ACKs indicates packet loss without timer timeout; TCP executes Fast Retransmit to immediately resend the missing segment and halves ssthresh/cwnd in Fast Recovery."
  },
  {
    id: "q_cn_4",
    examId: "exam_cn_04",
    subjectCode: "CS-601",
    course: "Computer Networks",
    questionNumber: 4,
    question: "Which transport protocol and default well-known port number are utilized by standard DNS queries?",
    questionText: "Which transport protocol and default well-known port number are utilized by standard DNS queries?",
    options: [
      "TCP Port 80",
      "UDP Port 53",
      "UDP Port 67",
      "TCP Port 443"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.25,
    difficulty: "Easy",
    topic: "Application Layer Protocols",
    explanation: "Standard DNS name lookup queries use UDP on port 53 for low-latency resolution. (TCP port 53 is used for zone transfers and responses exceeding 512 bytes)."
  },

  // EXAM 5: ARTIFICIAL INTELLIGENCE (4 questions, 2 marks each = 8 total)
  {
    id: "q_ai_1",
    examId: "exam_ai_05",
    subjectCode: "CS-702",
    course: "Artificial Intelligence",
    questionNumber: 1,
    question: "In state-space graph search, which condition guarantees that the A* algorithm produces an optimal shortest path to the goal?",
    questionText: "In state-space graph search, which condition guarantees that the A* algorithm produces an optimal shortest path to the goal?",
    options: [
      "The heuristic function h(n) is admissible (never overestimates the true remaining cost)",
      "The branching factor of the search tree is strictly constant",
      "The search space contains no directed cycles or zero-cost edges",
      "Iterative deepening is combined with beam search pruning"
    ],
    correctAnswer: 0,
    correctOption: "A",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Medium",
    topic: "Heuristic Search & A*",
    explanation: "An admissible heuristic h(n) <= h*(n) guarantees that A* tree search never expands a suboptimal goal node before an optimal one, ensuring mathematical optimality."
  },
  {
    id: "q_ai_2",
    examId: "exam_ai_05",
    subjectCode: "CS-702",
    course: "Artificial Intelligence",
    questionNumber: 2,
    question: "In the Minimax adversarial game tree algorithm with Alpha-Beta pruning, when does a beta cutoff occur?",
    questionText: "In the Minimax adversarial game tree algorithm with Alpha-Beta pruning, when does a beta cutoff occur?",
    options: [
      "When the current node score exceeds positive infinity",
      "At a MIN node, when the evaluated value is less than or equal to alpha (v <= alpha)",
      "At a MAX node, when the evaluated value is greater than beta (v >= beta)",
      "Only when the game reaches a terminal draw state"
    ],
    correctAnswer: 1,
    correctOption: "B",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Hard",
    topic: "Adversarial Search & Pruning",
    explanation: "At a MIN node, if the backed-up value falls below alpha (the best score MAX can already guarantee), MAX will never choose this path, allowing the remaining sibling branches of the MIN node to be pruned."
  },
  {
    id: "q_ai_3",
    examId: "exam_ai_05",
    subjectCode: "CS-702",
    course: "Artificial Intelligence",
    questionNumber: 3,
    question: "Which machine learning paradigm involves an autonomous agent taking actions in a dynamic environment to maximize a cumulative scalar reward signal?",
    questionText: "Which machine learning paradigm involves an autonomous agent taking actions in a dynamic environment to maximize a cumulative scalar reward signal?",
    options: [
      "Supervised Regression",
      "Unsupervised Hierarchical Clustering",
      "Reinforcement Learning (Markov Decision Processes)",
      "Semi-Supervised Active Learning"
    ],
    correctAnswer: 2,
    correctOption: "C",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Medium",
    topic: "Reinforcement Learning",
    explanation: "Reinforcement Learning frames problems where an agent interacts through state-action-reward loops (MDPs) to discover optimal policies via trial-and-error exploration and exploitation."
  },
  {
    id: "q_ai_4",
    examId: "exam_ai_05",
    subjectCode: "CS-702",
    course: "Artificial Intelligence",
    questionNumber: 4,
    question: "Which activation function is most widely adopted in hidden layers of deep neural networks to alleviate the vanishing gradient problem for positive activations?",
    questionText: "Which activation function is most widely adopted in hidden layers of deep neural networks to alleviate the vanishing gradient problem for positive activations?",
    options: [
      "Standard Sigmoid function (1 / (1 + e^-z))",
      "Hyperbolic Tangent (tanh)",
      "Rectified Linear Unit: ReLU(z) = max(0, z)",
      "Softmax Normalization"
    ],
    correctAnswer: 2,
    correctOption: "C",
    marks: 2.0,
    negativeMarks: 0.0,
    difficulty: "Easy",
    topic: "Neural Networks & Deep Learning",
    explanation: "ReLU provides a constant gradient of 1 for all positive inputs (z > 0), preventing saturation and enabling faster convergence in gradient descent optimization without vanishing gradients."
  }
];

export const INITIAL_RESULTS = [
  {
    id: "res_demo_1",
    examId: "exam_dsa_01",
    examTitle: "Data Structures and Algorithms – Internal Assessment 1",
    examCode: "CS-301",
    studentId: "usr_student_1",
    studentName: "T. Gagan Kumar Reddy",
    studentRoll: "2500032735",
    studentReg: "2500032735",
    totalQuestions: 10,
    attempted: 10,
    correctCount: 8,
    wrongCount: 2,
    unattemptedCount: 0,
    marksScored: 15.5,
    totalMarks: 20,
    percentage: 77.5,
    passed: true,
    grade: "B+",
    timeTakenSeconds: 685,
    submittedAt: "2026-11-23T11:45:22.000Z",
    submissionType: "manual",
    responses: {
      "q_dsa_1": "C",
      "q_dsa_2": "B",
      "q_dsa_3": "A",
      "q_dsa_4": "C",
      "q_dsa_5": "B",
      "q_dsa_6": "B",
      "q_dsa_7": "B",
      "q_dsa_8": "A", // incorrect (correct: C)
      "q_dsa_9": "B",
      "q_dsa_10": "A" // incorrect (correct: B)
    }
  }
];


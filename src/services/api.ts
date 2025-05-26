
// Mock API service that simulates backend functionality
import { toast } from "sonner";

// Types
export type TaskStatus = "todo" | "inprogress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type UserRole = "admin" | "teacher" | "student";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  dueDate?: Date;
  tags: string[];
  assignedTo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer';
  content: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  category: string;
  createdBy: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  questions: string[]; // Question IDs
  createdBy: string;
  published: boolean;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  graded: boolean;
  score?: number;
  answers: Record<string, any>;
  timeSpent: number;
}

// Mock backend data
let tasks: Task[] = [
  {
    id: "1",
    title: "Create user authentication system",
    description: "Implement login, signup, and password reset functionality",
    status: "todo",
    priority: "high",
    createdAt: new Date(2025, 4, 15),
    dueDate: new Date(2025, 5, 1),
    tags: ["authentication", "security"]
  },
  {
    id: "2",
    title: "Design dashboard layout",
    description: "Create wireframes and implement responsive dashboard",
    status: "inprogress",
    priority: "medium",
    createdAt: new Date(2025, 4, 10),
    dueDate: new Date(2025, 4, 25),
    tags: ["design", "frontend"]
  },
  {
    id: "3",
    title: "Implement task filtering",
    description: "Add ability to filter tasks by status, priority, and tags",
    status: "review",
    priority: "medium",
    createdAt: new Date(2025, 4, 5),
    tags: ["frontend", "filters"]
  },
  {
    id: "4",
    title: "Set up database schema",
    description: "Design and implement database schema for tasks and users",
    status: "done",
    priority: "high",
    createdAt: new Date(2025, 4, 1),
    tags: ["database", "backend"]
  }
];

let users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin"
  },
  {
    id: "2",
    name: "Teacher User",
    email: "teacher@example.com",
    role: "teacher"
  },
  {
    id: "3",
    name: "Student User",
    email: "student@example.com",
    role: "student"
  }
];

let questions: Question[] = [
  {
    id: "q1",
    type: "single-choice",
    content: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    points: 5,
    category: "Geography",
    createdBy: "2"
  },
  {
    id: "q2",
    type: "multiple-choice", 
    content: "Which of the following are programming languages?",
    options: ["JavaScript", "HTML", "Python", "CSS"],
    correctAnswer: ["JavaScript", "Python"],
    points: 10,
    category: "Computer Science",
    createdBy: "2"
  },
  {
    id: "q3",
    type: "short-answer",
    content: "Explain the concept of photosynthesis in plants.",
    correctAnswer: "Process by which plants convert sunlight into energy",
    points: 15,
    category: "Biology",
    createdBy: "2"
  },
  {
    id: "q4",
    type: "single-choice",
    content: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    points: 5,
    category: "Mathematics",
    createdBy: "2"
  },
  {
    id: "q5",
    type: "fill-blank",
    content: "The largest planet in our solar system is ____.",
    correctAnswer: "Jupiter",
    points: 8,
    category: "Astronomy",
    createdBy: "2"
  }
];

let exams: Exam[] = [
  {
    id: "e1",
    title: "General Knowledge Quiz",
    description: "A comprehensive quiz covering various topics including geography, science, and mathematics.",
    duration: 60,
    startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
    endTime: new Date(Date.now() + 30 * 60 * 1000), // Ends in 30 minutes
    questions: ["q1", "q2", "q4"],
    createdBy: "2",
    published: true
  },
  {
    id: "e2", 
    title: "Science Fundamentals",
    description: "Test your knowledge of basic scientific concepts in biology and astronomy.",
    duration: 45,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Starts in 2 hours
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // Ends in 3 hours
    questions: ["q3", "q5"],
    createdBy: "2",
    published: true
  },
  {
    id: "e3",
    title: "Programming Basics",
    description: "An assessment of fundamental programming concepts and languages.",
    duration: 90,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // Ended 2 days ago
    questions: ["q2"],
    createdBy: "2", 
    published: true
  }
];

// Track exam submissions with persistent state
let examSubmissions: ExamSubmission[] = [];

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Current logged in user - null when not authenticated
let currentUser: User | null = null;

// User Registration
export async function registerUser(userData: RegisterUserData): Promise<User> {
  await delay(800);
  
  // Check if email is already registered
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    toast.error("Email already registered");
    throw new Error("Email already registered");
  }
  
  // Create new user
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name: userData.name,
    email: userData.email,
    role: userData.role
  };
  
  users = [...users, newUser];
  toast.success("Registration successful!");
  return newUser;
}

// API functions
export async function getTasks(): Promise<Task[]> {
  await delay(500); // Simulate network delay
  return [...tasks];
}

export async function getUsers(): Promise<User[]> {
  await delay(300);
  
  // Only admins can see all users
  if (currentUser && currentUser.role === 'admin') {
    return [...users];
  }
  
  // Others can only see themselves
  if (currentUser) {
    return [currentUser];
  }
  
  throw new Error("Unauthorized access");
}

export async function createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
  await delay(500);
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  
  tasks = [...tasks, newTask];
  toast.success("Task created successfully");
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  await delay(400);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    toast.error("Task not found");
    throw new Error("Task not found");
  }
  
  const updatedTask = { ...tasks[taskIndex], ...updates };
  tasks = [...tasks.slice(0, taskIndex), updatedTask, ...tasks.slice(taskIndex + 1)];
  
  toast.success("Task updated successfully");
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  await delay(400);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    toast.error("Task not found");
    throw new Error("Task not found");
  }
  
  tasks = [...tasks.slice(0, taskIndex), ...tasks.slice(taskIndex + 1)];
  toast.success("Task deleted successfully");
}

// Authentication
export async function login(email: string, password: string): Promise<User> {
  await delay(800);
  const user = users.find(u => u.email === email);
  
  if (!user) {
    toast.error("Invalid credentials");
    throw new Error("Invalid credentials");
  }
  
  // In a real app, we would validate the password here
  currentUser = user;
  console.log('User logged in successfully:', user);
  return user;
}

export async function logout(): Promise<void> {
  await delay(300);
  currentUser = null;
  toast.info("Logged out successfully");
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(300);
  return currentUser;
}

// Question management functions
export async function getQuestions(): Promise<Question[]> {
  await delay(500);
  
  if (!currentUser) {
    throw new Error("Unauthorized access");
  }
  
  return [...questions];
}

export async function createQuestion(question: Omit<Question, "id">): Promise<Question> {
  await delay(500);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
    throw new Error("Unauthorized access");
  }
  
  const newQuestion: Question = {
    ...question,
    id: Math.random().toString(36).substr(2, 9),
  };
  
  questions = [...questions, newQuestion];
  toast.success("Question created successfully");
  return newQuestion;
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  await delay(400);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
    throw new Error("Unauthorized access");
  }
  
  const questionIndex = questions.findIndex(q => q.id === id);
  
  if (questionIndex === -1) {
    toast.error("Question not found");
    throw new Error("Question not found");
  }
  
  const updatedQuestion = { ...questions[questionIndex], ...updates };
  questions = [...questions.slice(0, questionIndex), updatedQuestion, ...questions.slice(questionIndex + 1)];
  
  toast.success("Question updated successfully");
  return updatedQuestion;
}

export async function deleteQuestion(id: string): Promise<void> {
  await delay(400);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
    throw new Error("Unauthorized access");
  }
  
  const questionIndex = questions.findIndex(q => q.id === id);
  
  if (questionIndex === -1) {
    toast.error("Question not found");
    throw new Error("Question not found");
  }
  
  questions = [...questions.slice(0, questionIndex), ...questions.slice(questionIndex + 1)];
  toast.success("Question deleted successfully");
}

// Exam management functions
export async function getExams(): Promise<Exam[]> {
  await delay(500);
  
  if (!currentUser) {
    throw new Error("Unauthorized access");
  }
  
  // Students can only see published exams
  if (currentUser.role === 'student') {
    return exams.filter(exam => exam.published);
  }
  
  return [...exams];
}

export async function createExam(exam: Omit<Exam, "id">): Promise<Exam> {
  await delay(500);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
    throw new Error("Unauthorized access");
  }
  
  const newExam: Exam = {
    ...exam,
    id: Math.random().toString(36).substr(2, 9),
  };
  
  exams = [...exams, newExam];
  toast.success("Exam created successfully");
  return newExam;
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
  await delay(400);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
    throw new Error("Unauthorized access");
  }
  
  const examIndex = exams.findIndex(e => e.id === id);
  
  if (examIndex === -1) {
    toast.error("Exam not found");
    throw new Error("Exam not found");
  }
  
  const updatedExam = { ...exams[examIndex], ...updates };
  exams = [...exams.slice(0, examIndex), updatedExam, ...exams.slice(examIndex + 1)];
  
  toast.success("Exam updated successfully");
  return updatedExam;
}

export async function deleteExam(id: string): Promise<void> {
  await delay(400);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
    throw new Error("Unauthorized access");
  }
  
  const examIndex = exams.findIndex(e => e.id === id);
  
  if (examIndex === -1) {
    toast.error("Exam not found");
    throw new Error("Exam not found");
  }
  
  exams = [...exams.slice(0, examIndex), ...exams.slice(examIndex + 1)];
  toast.success("Exam deleted successfully");
}

// Exam submission functions
export async function submitExam(submission: Omit<ExamSubmission, "id" | "graded">): Promise<ExamSubmission> {
  await delay(500);
  
  if (!currentUser) {
    throw new Error("Unauthorized access");
  }
  
  const exam = exams.find(e => e.id === submission.examId);
  
  const newSubmission: ExamSubmission = {
    ...submission,
    id: Math.random().toString(36).substr(2, 9),
    graded: false,
    submittedAt: new Date(submission.submittedAt),
    studentId: currentUser.id,
    studentName: currentUser.name,
    examTitle: exam?.title || 'Unknown Exam'
  };
  
  examSubmissions = [...examSubmissions, newSubmission];
  toast.success("Exam submitted successfully");
  return newSubmission;
}

export async function getExamSubmissions(): Promise<ExamSubmission[]> {
  await delay(500);
  
  if (!currentUser) {
    throw new Error("Unauthorized access");
  }
  
  // Students can only see their own submissions
  if (currentUser.role === 'student') {
    return examSubmissions.filter(sub => sub.studentId === currentUser.id);
  }
  
  // Teachers and admins can see all submissions
  return [...examSubmissions];
}

export async function gradeSubmission(submissionId: string, score: number, feedback?: Record<string, string>): Promise<ExamSubmission> {
  await delay(400);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
    throw new Error("Unauthorized access");
  }
  
  const submissionIndex = examSubmissions.findIndex(s => s.id === submissionId);
  
  if (submissionIndex === -1) {
    toast.error("Submission not found");
    throw new Error("Submission not found");
  }
  
  const updatedSubmission = {
    ...examSubmissions[submissionIndex],
    graded: true,
    score,
    feedback
  };
  
  examSubmissions = [
    ...examSubmissions.slice(0, submissionIndex),
    updatedSubmission,
    ...examSubmissions.slice(submissionIndex + 1)
  ];
  
  toast.success("Submission graded successfully");
  return updatedSubmission;
}

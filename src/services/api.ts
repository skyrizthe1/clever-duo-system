
// Real API service that connects to MySQL backend
import { toast } from "sonner";
import { backendConfig } from '@/config/database';

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
  start_time: Date;
  end_time: Date;
  questions: string[]; // Question IDs
  created_by: string;
  published: boolean;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  exam_title: string;
  student_id: string;
  student_name: string;
  submitted_at: Date;
  graded: boolean;
  score?: number;
  answers: Record<string, any>;
  time_spent: number;
}

// API Base URL
const API_BASE = backendConfig.baseUrl;

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api/${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log(`Making API request to: ${url}`, config);

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// User Registration - POST /api/auth/register
export async function registerUser(userData: RegisterUserData): Promise<User> {
  try {
    console.log('Registering user:', userData.email);
    const response = await apiRequest('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    console.log('Registration response:', response);
    toast.success("Registration successful!");
    return response.user;
  } catch (error) {
    console.error('Registration error:', error);
    toast.error(error.message || "Registration failed");
    throw error;
  }
}

// User Login - POST /api/auth/login
export async function login(email: string, password: string): Promise<User> {
  try {
    console.log('Attempting login for:', email);
    const response = await apiRequest('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login response:', response);
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      console.log('Auth token stored successfully');
    }
    
    toast.success("Login successful!");
    return response.user;
  } catch (error) {
    console.error('Login error:', error);
    toast.error(error.message || "Invalid credentials");
    throw error;
  }
}

// User Logout - POST /api/auth/logout
export async function logout(): Promise<void> {
  try {
    console.log('Logging out user');
    await apiRequest('auth/logout', {
      method: 'POST',
    });
    
    localStorage.removeItem('authToken');
    console.log('Auth token removed from localStorage');
    toast.success("Logged out successfully");
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('authToken'); // Clear token anyway
    toast.success("Logged out successfully");
  }
}

// Get Current User - GET /api/auth/me
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token found');
      return null;
    }
    
    console.log('Getting current user info');
    const response = await apiRequest('auth/me');
    console.log('Current user response:', response);
    return response.user;
  } catch (error) {
    console.error('Get current user error:', error);
    // If token is invalid, remove it
    localStorage.removeItem('authToken');
    return null;
  }
}

// Task management
export async function getTasks(): Promise<Task[]> {
  try {
    const response = await apiRequest('tasks');
    return response.tasks.map(task => ({
      ...task,
      createdAt: new Date(task.created_at),
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
    }));
  } catch (error) {
    toast.error("Failed to fetch tasks");
    throw error;
  }
}

export async function createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
  try {
    const response = await apiRequest('tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        tags: JSON.stringify(task.tags),
        assigned_to: task.assignedTo,
      }),
    });
    
    toast.success("Task created successfully");
    return {
      ...response.task,
      createdAt: new Date(response.task.created_at),
      dueDate: response.task.due_date ? new Date(response.task.due_date) : undefined,
    };
  } catch (error) {
    toast.error("Failed to create task");
    throw error;
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  try {
    const response = await apiRequest(`tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        due_date: updates.dueDate?.toISOString(),
        tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
        assigned_to: updates.assignedTo,
      }),
    });
    
    toast.success("Task updated successfully");
    return {
      ...response.task,
      createdAt: new Date(response.task.created_at),
      dueDate: response.task.due_date ? new Date(response.task.due_date) : undefined,
    };
  } catch (error) {
    toast.error("Failed to update task");
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await apiRequest(`tasks/${id}`, {
      method: 'DELETE',
    });
    
    toast.success("Task deleted successfully");
  } catch (error) {
    toast.error("Failed to delete task");
    throw error;
  }
}

// User management
export async function getUsers(): Promise<User[]> {
  try {
    const response = await apiRequest('users');
    return response.users;
  } catch (error) {
    toast.error("Failed to fetch users");
    throw error;
  }
}

// Question management
export async function getQuestions(): Promise<Question[]> {
  try {
    const response = await apiRequest('questions');
    return response.questions.map(q => ({
      ...q,
      correctAnswer: q.correct_answer,
      createdBy: q.created_by,
    }));
  } catch (error) {
    toast.error("Failed to fetch questions");
    throw error;
  }
}

export async function createQuestion(question: Omit<Question, "id">): Promise<Question> {
  try {
    const response = await apiRequest('questions', {
      method: 'POST',
      body: JSON.stringify({
        type: question.type,
        content: question.content,
        options: question.options ? JSON.stringify(question.options) : null,
        correct_answer: JSON.stringify(question.correctAnswer),
        points: question.points,
        category: question.category,
        created_by: question.createdBy,
      }),
    });
    
    toast.success("Question created successfully");
    return {
      ...response.question,
      correctAnswer: response.question.correct_answer,
      createdBy: response.question.created_by,
    };
  } catch (error) {
    toast.error("Failed to create question");
    throw error;
  }
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  try {
    const response = await apiRequest(`questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        type: updates.type,
        content: updates.content,
        options: updates.options ? JSON.stringify(updates.options) : undefined,
        correct_answer: updates.correctAnswer ? JSON.stringify(updates.correctAnswer) : undefined,
        points: updates.points,
        category: updates.category,
      }),
    });
    
    toast.success("Question updated successfully");
    return {
      ...response.question,
      correctAnswer: response.question.correct_answer,
      createdBy: response.question.created_by,
    };
  } catch (error) {
    toast.error("Failed to update question");
    throw error;
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    await apiRequest(`questions/${id}`, {
      method: 'DELETE',
    });
    
    toast.success("Question deleted successfully");
  } catch (error) {
    toast.error("Failed to delete question");
    throw error;
  }
}

// Exam management
export async function getExams(): Promise<Exam[]> {
  try {
    const response = await apiRequest('exams');
    return response.exams.map(exam => ({
      ...exam,
      start_time: new Date(exam.start_time),
      end_time: new Date(exam.end_time),
      created_by: exam.created_by,
    }));
  } catch (error) {
    toast.error("Failed to fetch exams");
    throw error;
  }
}

export async function createExam(exam: Omit<Exam, "id">): Promise<Exam> {
  try {
    const response = await apiRequest('exams', {
      method: 'POST',
      body: JSON.stringify({
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        start_time: exam.start_time.toISOString(),
        end_time: exam.end_time.toISOString(),
        questions: JSON.stringify(exam.questions),
        created_by: exam.created_by,
        published: exam.published,
      }),
    });
    
    toast.success("Exam created successfully");
    return {
      ...response.exam,
      start_time: new Date(response.exam.start_time),
      end_time: new Date(response.exam.end_time),
      created_by: response.exam.created_by,
    };
  } catch (error) {
    toast.error("Failed to create exam");
    throw error;
  }
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
  try {
    const response = await apiRequest(`exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        duration: updates.duration,
        start_time: updates.start_time?.toISOString(),
        end_time: updates.end_time?.toISOString(),
        questions: updates.questions ? JSON.stringify(updates.questions) : undefined,
        published: updates.published,
      }),
    });
    
    toast.success("Exam updated successfully");
    return {
      ...response.exam,
      start_time: new Date(response.exam.start_time),
      end_time: new Date(response.exam.end_time),
      created_by: response.exam.created_by,
    };
  } catch (error) {
    toast.error("Failed to update exam");
    throw error;
  }
}

export async function deleteExam(id: string): Promise<void> {
  try {
    await apiRequest(`exams/${id}`, {
      method: 'DELETE',
    });
    
    toast.success("Exam deleted successfully");
  } catch (error) {
    toast.error("Failed to delete exam");
    throw error;
  }
}

// Exam submission management
export async function submitExam(submission: Omit<ExamSubmission, "id" | "graded">): Promise<ExamSubmission> {
  try {
    const response = await apiRequest('exam-submissions', {
      method: 'POST',
      body: JSON.stringify({
        exam_id: submission.exam_id,
        exam_title: submission.exam_title,
        student_id: submission.student_id,
        student_name: submission.student_name,
        submitted_at: submission.submitted_at.toISOString(),
        answers: JSON.stringify(submission.answers),
        time_spent: submission.time_spent,
      }),
    });
    
    toast.success("Exam submitted successfully");
    return {
      ...response.submission,
      submitted_at: new Date(response.submission.submitted_at),
    };
  } catch (error) {
    toast.error("Failed to submit exam");
    throw error;
  }
}

export async function getExamSubmissions(): Promise<ExamSubmission[]> {
  try {
    const response = await apiRequest('exam-submissions');
    return response.submissions.map(sub => ({
      ...sub,
      submitted_at: new Date(sub.submitted_at),
    }));
  } catch (error) {
    toast.error("Failed to fetch exam submissions");
    throw error;
  }
}

export async function gradeSubmission(submissionId: string, score: number, feedback?: Record<string, string>): Promise<ExamSubmission> {
  try {
    const response = await apiRequest(`exam-submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({
        score,
        feedback: feedback ? JSON.stringify(feedback) : null,
      }),
    });
    
    toast.success("Submission graded successfully");
    return {
      ...response.submission,
      submitted_at: new Date(response.submission.submitted_at),
    };
  } catch (error) {
    toast.error("Failed to grade submission");
    throw error;
  }
}

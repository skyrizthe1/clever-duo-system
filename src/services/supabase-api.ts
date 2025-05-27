
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types that match our database schema (using snake_case to match Supabase)
export type UserRole = "admin" | "teacher" | "student";
export type TaskStatus = "todo" | "inprogress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type QuestionType = "single-choice" | "multiple-choice" | "fill-blank" | "short-answer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  due_date?: string;
  tags: string[];
  assigned_to?: string;
  created_by: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correct_answer: string | string[];
  points: number;
  category: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  start_time: string;
  end_time: string;
  questions: string[]; // Question IDs
  created_by: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  submitted_at: string;
  graded: boolean;
  score?: number;
  answers: Record<string, any>;
  time_spent?: number;
  feedback?: Record<string, string>;
}

// Authentication
export async function registerUser(userData: RegisterUserData): Promise<User> {
  console.log('Registering user with data:', userData);
  
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        role: userData.role,
      },
    },
  });

  if (error) {
    console.error('Registration error:', error);
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Registration failed - no user returned');
  }

  console.log('User registered successfully:', data.user);

  return {
    id: data.user.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };
}

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Login failed');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    throw new Error('Failed to fetch user profile');
  }

  return {
    id: data.user.id,
    name: profile.name,
    email: data.user.email!,
    role: profile.role,
    avatar_url: profile.avatar_url,
  };
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error);
    return null;
  }

  return {
    id: user.id,
    name: profile.name,
    email: user.email!,
    role: profile.role,
    avatar_url: profile.avatar_url,
  };
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Tasks fetch error:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "created_by">): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Task creation error:', error);
    throw new Error(error.message);
  }

  toast.success("Task created successfully");
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Task update error:', error);
    throw new Error(error.message);
  }

  toast.success("Task updated successfully");
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Task deletion error:', error);
    throw new Error(error.message);
  }

  toast.success("Task deleted successfully");
}

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Users fetch error:', error);
    throw new Error(error.message);
  }

  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: '', // Email not stored in profiles table
    role: profile.role,
    avatar_url: profile.avatar_url,
  }));
}

// Questions
export async function getQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Questions fetch error:', error);
    throw new Error(error.message);
  }

  return data?.map(item => ({
    ...item,
    correct_answer: item.correct_answer as string | string[]
  })) || [];
}

export async function createQuestion(question: Omit<Question, "id" | "created_by">): Promise<Question> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({
      ...question,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Question creation error:', error);
    throw new Error(error.message);
  }

  toast.success("Question created successfully");
  return {
    ...data,
    correct_answer: data.correct_answer as string | string[]
  };
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Question update error:', error);
    throw new Error(error.message);
  }

  toast.success("Question updated successfully");
  return {
    ...data,
    correct_answer: data.correct_answer as string | string[]
  };
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Question deletion error:', error);
    throw new Error(error.message);
  }

  toast.success("Question deleted successfully");
}

// Exams
export async function getExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Exams fetch error:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function createExam(exam: Omit<Exam, "id" | "created_by">): Promise<Exam> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('exams')
    .insert({
      ...exam,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Exam creation error:', error);
    throw new Error(error.message);
  }

  toast.success("Exam created successfully");
  return data;
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Exam update error:', error);
    throw new Error(error.message);
  }

  toast.success("Exam updated successfully");
  return data;
}

export async function deleteExam(id: string): Promise<void> {
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Exam deletion error:', error);
    throw new Error(error.message);
  }

  toast.success("Exam deleted successfully");
}

// Exam Submissions
export async function submitExam(submission: Omit<ExamSubmission, "id">): Promise<ExamSubmission> {
  const { data, error } = await supabase
    .from('exam_submissions')
    .insert(submission)
    .select()
    .single();

  if (error) {
    console.error('Exam submission error:', error);
    throw new Error(error.message);
  }

  toast.success("Exam submitted successfully");
  return data;
}

export async function getExamSubmissions(): Promise<ExamSubmission[]> {
  const { data, error } = await supabase
    .from('exam_submissions')
    .select(`
      *,
      exam:exams(title),
      student:profiles(name)
    `)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Submissions fetch error:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function gradeSubmission(
  submissionId: string, 
  score: number, 
  feedback?: Record<string, string>
): Promise<ExamSubmission> {
  const { data, error } = await supabase
    .from('exam_submissions')
    .update({
      graded: true,
      score,
      feedback,
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Submission grading error:', error);
    throw new Error(error.message);
  }

  toast.success("Submission graded successfully");
  return data;
}


import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  feedback?: Record<string, string>;
}

// Auth utility functions
const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if available
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.log('Auth cleanup completed');
  }
};

// User Registration with Supabase
export async function registerUser(userData: RegisterUserData): Promise<User> {
  try {
    console.log('Registering user with Supabase:', userData.email);
    
    // Clean up any existing auth state first
    cleanupAuthState();
    
    // Attempt to sign out any existing session
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.log('No existing session to sign out');
    }

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      throw error;
    }

    if (data.user) {
      console.log('Registration successful:', data.user.id);
      return {
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
    }

    throw new Error('Registration failed - no user returned');
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error?.message || "Registration failed";
    toast.error(errorMessage);
    throw error;
  }
}

// User Login with Supabase
export async function login(email: string, password: string): Promise<User> {
  try {
    console.log('Attempting login with Supabase for:', email);
    
    // Clean up any existing auth state first
    cleanupAuthState();
    
    // Attempt to sign out any existing session
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.log('No existing session to sign out');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    if (data.user && data.session) {
      console.log('Login successful:', data.user.id);
      
      // Get or create user profile
      let profile = null;
      try {
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        } else if (existingProfile) {
          profile = existingProfile;
        }
      } catch (err) {
        console.log('Profile lookup completed');
      }

      // If no profile exists, create one
      if (!profile) {
        try {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              role: data.user.user_metadata?.role || 'student'
            })
            .select()
            .single();
          
          if (!insertError && newProfile) {
            profile = newProfile;
          }
        } catch (err) {
          console.log('Profile creation attempted');
        }
      }

      const userName = profile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
      const userRole = profile?.role || data.user.user_metadata?.role || 'student';

      return {
        id: data.user.id,
        name: userName,
        email: data.user.email!,
        role: userRole,
      };
    }

    throw new Error('Login failed - no session returned');
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error?.message || "Invalid credentials";
    toast.error(errorMessage);
    throw error;
  }
}

// User Logout with Supabase
export async function logout(): Promise<void> {
  try {
    console.log('Logging out user with Supabase');
    
    // Clean up auth state first
    cleanupAuthState();
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Logout error:', error);
    }
    
    console.log('Logout completed');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Get Current User with Supabase
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('No authenticated user found');
      return null;
    }
    
    console.log('Getting current user profile for:', user.id);
    
    // Get user profile
    let profile = null;
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && existingProfile) {
        profile = existingProfile;
      }
    } catch (err) {
      console.log('Profile lookup completed');
    }

    const userName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    const userRole = profile?.role || user.user_metadata?.role || 'student';

    console.log('Current user profile loaded:', userName);
    return {
      id: user.id,
      name: userName,
      email: user.email!,
      role: userRole,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Task management with Supabase
export async function getTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      createdAt: new Date(task.created_at!),
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      tags: task.tags || [],
      assignedTo: task.assigned_to || undefined,
    }));
  } catch (error) {
    console.error('Get tasks error:', error);
    toast.error("Failed to fetch tasks");
    throw error;
  }
}

export async function createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        tags: task.tags,
        assigned_to: task.assignedTo,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Task created successfully");
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at!),
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      tags: data.tags || [],
      assignedTo: data.assigned_to || undefined,
    };
  } catch (error) {
    console.error('Create task error:', error);
    toast.error("Failed to create task");
    throw error;
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        due_date: updates.dueDate?.toISOString(),
        tags: updates.tags,
        assigned_to: updates.assignedTo,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Task updated successfully");
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at!),
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      tags: data.tags || [],
      assignedTo: data.assigned_to || undefined,
    };
  } catch (error) {
    console.error('Update task error:', error);
    toast.error("Failed to update task");
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success("Task deleted successfully");
  } catch (error) {
    console.error('Delete task error:', error);
    toast.error("Failed to delete task");
    throw error;
  }
}

// User management with Supabase
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;

    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.id, // We'll need to get email from auth.users if needed
      role: profile.role,
      avatar: profile.avatar_url || undefined,
    }));
  } catch (error) {
    console.error('Get users error:', error);
    toast.error("Failed to fetch users");
    throw error;
  }
}

// Question management with Supabase
export async function getQuestions(): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(q => ({
      id: q.id,
      type: q.type,
      content: q.content,
      options: q.options || undefined,
      correctAnswer: Array.isArray(q.correct_answer) ? 
        q.correct_answer.map(item => String(item)) : 
        String(q.correct_answer),
      points: q.points,
      category: q.category,
      createdBy: q.created_by,
    }));
  } catch (error) {
    console.error('Get questions error:', error);
    toast.error("Failed to fetch questions");
    throw error;
  }
}

export async function createQuestion(question: Omit<Question, "id">): Promise<Question> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('questions')
      .insert({
        type: question.type,
        content: question.content,
        options: question.options,
        correct_answer: question.correctAnswer,
        points: question.points,
        category: question.category,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Question created successfully");
    return {
      id: data.id,
      type: data.type,
      content: data.content,
      options: data.options || undefined,
      correctAnswer: Array.isArray(data.correct_answer) ? 
        data.correct_answer.map(item => String(item)) : 
        String(data.correct_answer),
      points: data.points,
      category: data.category,
      createdBy: data.created_by,
    };
  } catch (error) {
    console.error('Create question error:', error);
    toast.error("Failed to create question");
    throw error;
  }
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .update({
        type: updates.type,
        content: updates.content,
        options: updates.options,
        correct_answer: updates.correctAnswer,
        points: updates.points,
        category: updates.category,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Question updated successfully");
    return {
      id: data.id,
      type: data.type,
      content: data.content,
      options: data.options || undefined,
      correctAnswer: Array.isArray(data.correct_answer) ? 
        data.correct_answer.map(item => String(item)) : 
        String(data.correct_answer),
      points: data.points,
      category: data.category,
      createdBy: data.created_by,
    };
  } catch (error) {
    console.error('Update question error:', error);
    toast.error("Failed to update question");
    throw error;
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success("Question deleted successfully");
  } catch (error) {
    console.error('Delete question error:', error);
    toast.error("Failed to delete question");
    throw error;
  }
}

// Exam management with Supabase
export async function getExams(): Promise<Exam[]> {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description || '',
      duration: exam.duration,
      start_time: new Date(exam.start_time),
      end_time: new Date(exam.end_time),
      questions: exam.questions,
      created_by: exam.created_by,
      published: exam.published || false,
    }));
  } catch (error) {
    console.error('Get exams error:', error);
    toast.error("Failed to fetch exams");
    throw error;
  }
}

export async function createExam(exam: Omit<Exam, "id">): Promise<Exam> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('exams')
      .insert({
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        start_time: exam.start_time.toISOString(),
        end_time: exam.end_time.toISOString(),
        questions: exam.questions,
        created_by: user.id,
        published: exam.published,
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Exam created successfully");
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      duration: data.duration,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      questions: data.questions,
      created_by: data.created_by,
      published: data.published || false,
    };
  } catch (error) {
    console.error('Create exam error:', error);
    toast.error("Failed to create exam");
    throw error;
  }
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
  try {
    const { data, error } = await supabase
      .from('exams')
      .update({
        title: updates.title,
        description: updates.description,
        duration: updates.duration,
        start_time: updates.start_time?.toISOString(),
        end_time: updates.end_time?.toISOString(),
        questions: updates.questions,
        published: updates.published,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Exam updated successfully");
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      duration: data.duration,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      questions: data.questions,
      created_by: data.created_by,
      published: data.published || false,
    };
  } catch (error) {
    console.error('Update exam error:', error);
    toast.error("Failed to update exam");
    throw error;
  }
}

export async function deleteExam(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success("Exam deleted successfully");
  } catch (error) {
    console.error('Delete exam error:', error);
    toast.error("Failed to delete exam");
    throw error;
  }
}

// Exam submission management with Supabase
export async function submitExam(submission: Omit<ExamSubmission, "id" | "graded">): Promise<ExamSubmission> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('exam_submissions')
      .insert({
        exam_id: submission.exam_id,
        student_id: user.id,
        submitted_at: submission.submitted_at.toISOString(),
        answers: submission.answers as any,
        time_spent: submission.time_spent,
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Exam submitted successfully");
    return {
      id: data.id,
      exam_id: data.exam_id,
      exam_title: submission.exam_title,
      student_id: data.student_id,
      student_name: submission.student_name,
      submitted_at: new Date(data.submitted_at!),
      graded: data.graded || false,
      score: data.score || undefined,
      answers: data.answers as Record<string, any>,
      time_spent: data.time_spent || 0,
    };
  } catch (error) {
    console.error('Submit exam error:', error);
    toast.error("Failed to submit exam");
    throw error;
  }
}

export async function getExamSubmissions(): Promise<ExamSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('exam_submissions')
      .select(`
        *,
        exams!inner(title),
        profiles!inner(name)
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return data.map(sub => ({
      id: sub.id,
      exam_id: sub.exam_id,
      exam_title: sub.exams?.title || 'Unknown Exam',
      student_id: sub.student_id,
      student_name: sub.profiles?.name || 'Unknown Student',
      submitted_at: new Date(sub.submitted_at!),
      graded: sub.graded || false,
      score: sub.score || undefined,
      answers: sub.answers as Record<string, any>,
      time_spent: sub.time_spent || 0,
      feedback: sub.feedback as Record<string, string> | undefined,
    }));
  } catch (error) {
    console.error('Get exam submissions error:', error);
    toast.error("Failed to fetch exam submissions");
    throw error;
  }
}

export async function gradeSubmission(submissionId: string, score: number, feedback?: Record<string, string>): Promise<ExamSubmission> {
  try {
    const { data, error } = await supabase
      .from('exam_submissions')
      .update({
        score,
        feedback: feedback as any,
        graded: true,
      })
      .eq('id', submissionId)
      .select(`
        *,
        exams!inner(title),
        profiles!inner(name)
      `)
      .single();

    if (error) throw error;

    toast.success("Submission graded successfully");
    return {
      id: data.id,
      exam_id: data.exam_id,
      exam_title: data.exams?.title || 'Unknown Exam',
      student_id: data.student_id,
      student_name: data.profiles?.name || 'Unknown Student',
      submitted_at: new Date(data.submitted_at!),
      graded: data.graded || false,
      score: data.score || undefined,
      answers: data.answers as Record<string, any>,
      time_spent: data.time_spent || 0,
      feedback: data.feedback as Record<string, string> | undefined,
    };
  } catch (error) {
    console.error('Grade submission error:', error);
    toast.error("Failed to grade submission");
    throw error;
  }
}

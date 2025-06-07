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
  bio?: string;
  slogan?: string;
  phone?: string;
  location?: string;
  social_links?: Record<string, string>;
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
  total_points?: number;
  answers: Record<string, any>;
  time_spent: number;
  feedback?: Record<string, string>;
  individual_scores?: Record<string, number>;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: Date;
  created_by: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  author_name: string;
  pinned: boolean;
  locked: boolean;
  views: number;
  created_at: Date;
  updated_at: Date;
}

export interface ForumReply {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  author_name: string;
  parent_id?: string;
  created_at: Date;
  updated_at: Date;
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
        avatar: profile?.avatar_url,
        bio: profile?.bio,
        slogan: profile?.slogan,
        phone: profile?.phone,
        location: profile?.location,
        social_links: profile?.social_links,
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

// Get Current User with Supabase - Fixed TypeScript error
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('No authenticated user found');
      return null;
    }
    
    console.log('Getting current user profile for:', user.id);
    
    // Get user profile with all fields
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
    
    // Fix for social_links type casting
    let socialLinks = {};
    if (profile?.social_links && 
        typeof profile.social_links === 'object' && 
        profile.social_links !== null &&
        !Array.isArray(profile.social_links)) {
      try {
        socialLinks = profile.social_links as Record<string, string>;
      } catch (e) {
        socialLinks = {};
      }
    }

    return {
      id: user.id,
      name: userName,
      email: user.email!,
      role: userRole,
      avatar: profile?.avatar_url,
      bio: profile?.bio,
      slogan: profile?.slogan,
      phone: profile?.phone,
      location: profile?.location,
      social_links: socialLinks,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Profile update function
export async function updateProfile(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        bio: updates.bio,
        slogan: updates.slogan,
        phone: updates.phone,
        location: updates.location,
        social_links: updates.social_links,
        avatar_url: updates.avatar,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    toast.success("Profile updated successfully");
    return {
      id: data.id,
      name: data.name,
      email: '', // Will be filled by caller
      role: data.role,
      avatar: data.avatar_url,
      bio: data.bio,
      slogan: data.slogan,
      phone: data.phone,
      location: data.location,
      social_links: data.social_links,
    };
  } catch (error) {
    console.error('Update profile error:', error);
    toast.error("Failed to update profile");
    throw error;
  }
}

// Avatar upload function
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Upload avatar error:', error);
    toast.error("Failed to upload avatar");
    throw error;
  }
}

// Password recovery function
export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    toast.success("Password reset email sent");
  } catch (error) {
    console.error('Reset password error:', error);
    toast.error("Failed to send password reset email");
    throw error;
  }
}

// Update password function
export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    toast.success("Password updated successfully");
  } catch (error) {
    console.error('Update password error:', error);
    toast.error("Failed to update password");
    throw error;
  }
}

// User management functions
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: '', // Email not stored in profiles table for privacy
      role: profile.role,
      avatar: profile.avatar_url,
      bio: profile.bio,
      slogan: profile.slogan,
      phone: profile.phone,
      location: profile.location,
      social_links: typeof profile.social_links === 'object' && profile.social_links !== null 
        ? (profile.social_links as Record<string, string>) 
        : {},
    }));
  } catch (error) {
    console.error('Get users error:', error);
    toast.error("Failed to fetch users");
    throw error;
  }
}

// Task functions
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
      description: task.description,
      status: task.status,
      priority: task.priority,
      createdAt: new Date(task.created_at),
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      tags: task.tags || [],
      assignedTo: task.assigned_to,
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
      description: data.description,
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at),
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      tags: data.tags || [],
      assignedTo: data.assigned_to,
    };
  } catch (error) {
    console.error('Create task error:', error);
    toast.error("Failed to create task");
    throw error;
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
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
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    toast.success("Task updated successfully");
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at),
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      tags: data.tags || [],
      assignedTo: data.assigned_to,
    };
  } catch (error) {
    console.error('Update task error:', error);
    toast.error("Failed to update task");
    throw error;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    toast.success("Task deleted successfully");
  } catch (error) {
    console.error('Delete task error:', error);
    toast.error("Failed to delete task");
    throw error;
  }
}

// Question functions
export async function getQuestions(): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(question => ({
      id: question.id,
      type: question.type,
      content: question.content,
      options: question.options,
      correctAnswer: Array.isArray(question.correct_answer) 
        ? question.correct_answer as string[]
        : question.correct_answer as string,
      points: question.points,
      category: question.category,
      createdBy: question.created_by,
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
        correct_answer: question.correctAnswer as any,
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
      options: data.options,
      correctAnswer: data.correct_answer as string | string[],
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

export async function updateQuestion(questionId: string, updates: Partial<Question>): Promise<Question> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .update({
        type: updates.type,
        content: updates.content,
        options: updates.options,
        correct_answer: updates.correctAnswer as any,
        points: updates.points,
        category: updates.category,
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;

    toast.success("Question updated successfully");
    return {
      id: data.id,
      type: data.type,
      content: data.content,
      options: data.options,
      correctAnswer: Array.isArray(data.correct_answer) 
        ? data.correct_answer as string[]
        : data.correct_answer as string,
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

export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;

    toast.success("Question deleted successfully");
  } catch (error) {
    console.error('Delete question error:', error);
    toast.error("Failed to delete question");
    throw error;
  }
}

// Exam functions
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
      description: exam.description,
      duration: exam.duration,
      start_time: new Date(exam.start_time),
      end_time: new Date(exam.end_time),
      questions: exam.questions,
      created_by: exam.created_by,
      published: exam.published,
    }));
  } catch (error) {
    console.error('Get exams error:', error);
    toast.error("Failed to fetch exams");
    throw error;
  }
}

export async function createExam(exam: Omit<Exam, "id" | "created_by">): Promise<Exam> {
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
        published: exam.published,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Exam created successfully");
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      duration: data.duration,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      questions: data.questions,
      created_by: data.created_by,
      published: data.published,
    };
  } catch (error) {
    console.error('Create exam error:', error);
    toast.error("Failed to create exam");
    throw error;
  }
}

export async function updateExam(examId: string, updates: Partial<Exam>): Promise<Exam> {
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
      .eq('id', examId)
      .select()
      .single();

    if (error) throw error;

    toast.success("Exam updated successfully");
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      duration: data.duration,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      questions: data.questions,
      created_by: data.created_by,
      published: data.published,
    };
  } catch (error) {
    console.error('Update exam error:', error);
    toast.error("Failed to update exam");
    throw error;
  }
}

export async function deleteExam(examId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) throw error;

    toast.success("Exam deleted successfully");
  } catch (error) {
    console.error('Delete exam error:', error);
    toast.error("Failed to delete exam");
    throw error;
  }
}

// Exam submission functions
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

    return data.map(submission => ({
      id: submission.id,
      exam_id: submission.exam_id,
      exam_title: submission.exams?.title || 'Unknown Exam',
      student_id: submission.student_id,
      student_name: submission.profiles?.name || 'Unknown Student',
      submitted_at: new Date(submission.submitted_at),
      graded: submission.graded,
      score: submission.score,
      total_points: submission.total_points,
      answers: typeof submission.answers === 'object' && submission.answers !== null 
        ? (submission.answers as Record<string, any>) 
        : {},
      time_spent: submission.time_spent,
      feedback: typeof submission.feedback === 'object' && submission.feedback !== null 
        ? (submission.feedback as Record<string, string>) 
        : {},
      individual_scores: typeof submission.individual_scores === 'object' && submission.individual_scores !== null 
        ? (submission.individual_scores as Record<string, number>) 
        : {},
    }));
  } catch (error) {
    console.error('Get exam submissions error:', error);
    toast.error("Failed to fetch exam submissions");
    throw error;
  }
}

export async function submitExam(submission: Omit<ExamSubmission, "id">): Promise<ExamSubmission> {
  try {
    const { data, error } = await supabase
      .from('exam_submissions')
      .insert({
        exam_id: submission.exam_id,
        student_id: submission.student_id,
        submitted_at: submission.submitted_at.toISOString(),
        graded: submission.graded || false,
        score: submission.score,
        total_points: submission.total_points,
        answers: submission.answers,
        time_spent: submission.time_spent,
        feedback: submission.feedback,
        individual_scores: submission.individual_scores,
      })
      .select(`
        *,
        exams!inner(title),
        profiles!inner(name)
      `)
      .single();

    if (error) throw error;

    toast.success("Exam submitted successfully");
    return {
      id: data.id,
      exam_id: data.exam_id,
      exam_title: data.exams?.title || submission.exam_title,
      student_id: data.student_id,
      student_name: data.profiles?.name || submission.student_name,
      submitted_at: new Date(data.submitted_at),
      graded: data.graded,
      score: data.score,
      total_points: data.total_points,
      answers: typeof data.answers === 'object' && data.answers !== null 
        ? (data.answers as Record<string, any>) 
        : {},
      time_spent: data.time_spent,
      feedback: typeof data.feedback === 'object' && data.feedback !== null 
        ? (data.feedback as Record<string, string>) 
        : {},
      individual_scores: typeof data.individual_scores === 'object' && data.individual_scores !== null 
        ? (data.individual_scores as Record<string, number>) 
        : {},
    };
  } catch (error) {
    console.error('Submit exam error:', error);
    toast.error("Failed to submit exam");
    throw error;
  }
}

export async function gradeSubmission(submissionId: string, grade: number, feedbackData: Record<string, string>): Promise<ExamSubmission> {
  try {
    const { data, error } = await supabase
      .from('exam_submissions')
      .update({
        score: grade,
        feedback: feedbackData,
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
      submitted_at: new Date(data.submitted_at),
      graded: data.graded,
      score: data.score,
      total_points: data.total_points,
      answers: typeof data.answers === 'object' && data.answers !== null 
        ? (data.answers as Record<string, any>) 
        : {},
      time_spent: data.time_spent,
      feedback: typeof data.feedback === 'object' && data.feedback !== null 
        ? (data.feedback as Record<string, string>) 
        : {},
      individual_scores: typeof data.individual_scores === 'object' && data.individual_scores !== null 
        ? (data.individual_scores as Record<string, number>) 
        : {},
    };
  } catch (error) {
    console.error('Grade submission error:', error);
    toast.error("Failed to grade submission");
    throw error;
  }
}

// Forum categories functions
export async function getForumCategories(): Promise<ForumCategory[]> {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      created_at: new Date(category.created_at!),
      created_by: category.created_by,
    }));
  } catch (error) {
    console.error('Get forum categories error:', error);
    toast.error("Failed to fetch forum categories");
    throw error;
  }
}

// Forum posts functions
export async function getForumPosts(categoryId?: string): Promise<ForumPost[]> {
  try {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        profiles!inner(name)
      `)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      category_id: post.category_id,
      author_id: post.author_id,
      author_name: post.profiles?.name || 'Unknown User',
      pinned: post.pinned,
      locked: post.locked,
      views: post.views,
      created_at: new Date(post.created_at!),
      updated_at: new Date(post.updated_at!),
    }));
  } catch (error) {
    console.error('Get forum posts error:', error);
    toast.error("Failed to fetch forum posts");
    throw error;
  }
}

export async function createForumPost(post: Omit<ForumPost, "id" | "author_name" | "views" | "created_at" | "updated_at">): Promise<ForumPost> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        title: post.title,
        content: post.content,
        category_id: post.category_id,
        author_id: user.id,
        pinned: post.pinned,
        locked: post.locked,
      })
      .select(`
        *,
        profiles!inner(name)
      `)
      .single();

    if (error) throw error;

    toast.success("Post created successfully");
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category_id: data.category_id,
      author_id: data.author_id,
      author_name: data.profiles?.name || 'Unknown User',
      pinned: data.pinned,
      locked: data.locked,
      views: data.views,
      created_at: new Date(data.created_at!),
      updated_at: new Date(data.updated_at!),
    };
  } catch (error) {
    console.error('Create forum post error:', error);
    toast.error("Failed to create post");
    throw error;
  }
}

// Forum replies functions
export async function getForumReplies(postId: string): Promise<ForumReply[]> {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        profiles!inner(name)
      `)
      .eq('post_id', postId)
      .order('created_at');

    if (error) throw error;

    return data.map(reply => ({
      id: reply.id,
      content: reply.content,
      post_id: reply.post_id,
      author_id: reply.author_id,
      author_name: reply.profiles?.name || 'Unknown User',
      parent_id: reply.parent_id,
      created_at: new Date(reply.created_at!),
      updated_at: new Date(reply.updated_at!),
    }));
  } catch (error) {
    console.error('Get forum replies error:', error);
    toast.error("Failed to fetch replies");
    throw error;
  }
}

export async function createForumReply(reply: Omit<ForumReply, "id" | "author_name" | "created_at" | "updated_at">): Promise<ForumReply> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        content: reply.content,
        post_id: reply.post_id,
        author_id: user.id,
        parent_id: reply.parent_id,
      })
      .select(`
        *,
        profiles!inner(name)
      `)
      .single();

    if (error) throw error;

    toast.success("Reply posted successfully");
    return {
      id: data.id,
      content: data.content,
      post_id: data.post_id,
      author_id: data.author_id,
      author_name: data.profiles?.name || 'Unknown User',
      parent_id: data.parent_id,
      created_at: new Date(data.created_at!),
      updated_at: new Date(data.updated_at!),
    };
  } catch (error) {
    console.error('Create forum reply error:', error);
    toast.error("Failed to post reply");
    throw error;
  }
}

// Password Recovery Request Functions
export interface PasswordRecoveryRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  admin_id?: string;
  admin_notes?: string;
  temporary_password?: string;
  created_at: Date;
  updated_at: Date;
  processed_at?: Date;
}

export async function createPasswordRecoveryRequest(reason?: string): Promise<PasswordRecoveryRequest> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('password_recovery_requests')
      .insert({
        user_id: user.id,
        user_email: user.email!,
        user_name: profile?.name || user.email?.split('@')[0] || 'User',
        reason: reason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    toast.success("Password recovery request submitted successfully");
    return {
      id: data.id,
      user_id: data.user_id,
      user_email: data.user_email,
      user_name: data.user_name,
      reason: data.reason,
      status: data.status,
      admin_id: data.admin_id,
      admin_notes: data.admin_notes,
      temporary_password: data.temporary_password,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      processed_at: data.processed_at ? new Date(data.processed_at) : undefined,
    };
  } catch (error) {
    console.error('Create password recovery request error:', error);
    toast.error("Failed to submit password recovery request");
    throw error;
  }
}

export async function getPasswordRecoveryRequests(): Promise<PasswordRecoveryRequest[]> {
  try {
    const { data, error } = await supabase
      .from('password_recovery_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(request => ({
      id: request.id,
      user_id: request.user_id,
      user_email: request.user_email,
      user_name: request.user_name,
      reason: request.reason,
      status: request.status,
      admin_id: request.admin_id,
      admin_notes: request.admin_notes,
      temporary_password: request.temporary_password,
      created_at: new Date(request.created_at),
      updated_at: new Date(request.updated_at),
      processed_at: request.processed_at ? new Date(request.processed_at) : undefined,
    }));
  } catch (error) {
    console.error('Get password recovery requests error:', error);
    toast.error("Failed to fetch password recovery requests");
    throw error;
  }
}

function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function processPasswordRecoveryRequest(
  requestId: string, 
  action: 'approve' | 'deny', 
  adminNotes?: string
): Promise<PasswordRecoveryRequest> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let updateData: any = {
      status: action === 'approve' ? 'approved' : 'denied',
      admin_id: user.id,
      admin_notes: adminNotes,
      processed_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updateData.temporary_password = generateTemporaryPassword();
    }

    const { data, error } = await supabase
      .from('password_recovery_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // If approved, update the user's password
    if (action === 'approve' && updateData.temporary_password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        data.user_id,
        { password: updateData.temporary_password }
      );

      if (passwordError) {
        console.error('Failed to update user password:', passwordError);
        toast.error("Request processed but failed to update password");
      }
    }

    toast.success(`Password recovery request ${action}d successfully`);
    return {
      id: data.id,
      user_id: data.user_id,
      user_email: data.user_email,
      user_name: data.user_name,
      reason: data.reason,
      status: data.status,
      admin_id: data.admin_id,
      admin_notes: data.admin_notes,
      temporary_password: data.temporary_password,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      processed_at: new Date(data.processed_at),
    };
  } catch (error) {
    console.error('Process password recovery request error:', error);
    toast.error("Failed to process password recovery request");
    throw error;
  }
}

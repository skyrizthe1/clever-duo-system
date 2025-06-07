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

// Get Current User with Supabase
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
      social_links: profile?.social_links,
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

// ... keep existing code (task, question, exam functions) the same

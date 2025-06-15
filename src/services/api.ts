
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type definitions
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  slogan?: string;
  bio?: string;
  phone?: string;
  location?: string;
  social_links?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  content: string;
  type: 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  category: string;
  createdBy: string;
  created_at?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: string[];
  duration: number;
  start_time: string;
  end_time: string;
  published: boolean;
  created_by: string;
  created_at?: string;
}

export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  assignedTo?: string;
  dueDate?: Date;
  created_at?: string;
}

export interface PasswordRecoveryRequest {
  id: string;
  user_email: string;
  user_name: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_id?: string;
  admin_notes?: string;
  temporary_password?: string;
  created_at: string;
  processed_at?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  isOptimistic?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface ChatRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  responded_at?: string;
}

export interface PrivateChat {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
}

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Login failed:', error.message);
      toast.error(`Login failed: ${error.message}`);
      throw error;
    }

    console.log('Login successful:', data);
    toast.success('Login successful!');
    return data;
  } catch (error: any) {
    console.error('Login error:', error.message);
    toast.error(`Login error: ${error.message}`);
    throw error;
  }
};

export const register = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      console.error('Registration failed:', error.message);
      toast.error(`Registration failed: ${error.message}`);
      throw error;
    }

    console.log('Registration successful:', data);
    toast.success('Registration successful! Please check your email to verify your account.');
    return data;
  } catch (error: any) {
    console.error('Registration error:', error.message);
    toast.error(`Registration error: ${error.message}`);
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout failed:', error.message);
      toast.error(`Logout failed: ${error.message}`);
      throw error;
    }

    console.log('Logout successful');
    toast.success('Logout successful!');
  } catch (error: any) {
    console.error('Logout error:', error.message);
    toast.error(`Logout error: ${error.message}`);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email || '',
      name: profile.name || '',
      role: profile.role || 'student',
      avatar_url: profile.avatar_url,
      slogan: profile.slogan,
      bio: profile.bio,
      phone: profile.phone,
      location: profile.location,
      social_links: profile.social_links,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
  
      if (error) {
        console.error("Error updating profile:", error);
        toast.error(`Failed to update profile: ${error.message}`);
        throw error;
      }
  
      console.log("Profile updated successfully:", data);
      toast.success('Profile updated successfully!');
      return data;
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error(`Error updating profile: ${error.message}`);
      throw error;
    }
  };

export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
};

export const createPasswordRecoveryRequest = async (email: string, reason?: string) => {
  try {
    console.log('Creating password recovery request for:', email);
    
    const { data, error } = await supabase
      .from('password_recovery_requests')
      .insert({
        user_email: email,
        user_name: email.split('@')[0],
        reason: reason || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating password recovery request:', error);
      throw error;
    }

    console.log('Password recovery request created successfully:', data);
    toast.success('Password recovery request submitted successfully. An administrator will review your request.');
    return data;
  } catch (error: any) {
    console.error('Failed to create password recovery request:', error);
    
    let errorMessage = 'Failed to submit password recovery request. Please try again.';
    
    if (error.message?.includes('duplicate key')) {
      errorMessage = 'A password recovery request for this email already exists. Please wait for an administrator to process it.';
    } else if (error.message?.includes('invalid input syntax')) {
      errorMessage = 'Invalid email format. Please check your email address.';
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// User management functions
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data?.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      slogan: profile.slogan,
      bio: profile.bio,
      phone: profile.phone,
      location: profile.location,
      social_links: profile.social_links,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    })) || [];
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    throw error;
  }
};

export const registerUser = async (userData: { name: string; email: string; password: string; role: UserRole }) => {
  try {
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
      console.error('User registration failed:', error.message);
      toast.error(`Registration failed: ${error.message}`);
      throw error;
    }

    console.log('User registration successful:', data);
    toast.success('User registered successfully!');
    return data;
  } catch (error: any) {
    console.error('User registration error:', error.message);
    toast.error(`Registration error: ${error.message}`);
    throw error;
  }
};

// Question management functions
export const getQuestions = async (): Promise<Question[]> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data?.map(q => ({
      id: q.id,
      content: q.content,
      type: q.type,
      options: q.options,
      correctAnswer: q.correct_answer,
      points: q.points,
      category: q.category,
      createdBy: q.created_by,
      created_at: q.created_at,
    })) || [];
  } catch (error: any) {
    console.error('Error fetching questions:', error.message);
    return [];
  }
};

export const createQuestion = async (questionData: Omit<Question, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        content: questionData.content,
        type: questionData.type,
        options: questionData.options,
        correct_answer: questionData.correctAnswer,
        points: questionData.points,
        category: questionData.category,
        created_by: questionData.createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      toast.error(`Failed to create question: ${error.message}`);
      throw error;
    }

    console.log('Question created successfully:', data);
    toast.success('Question created successfully!');
    return data;
  } catch (error: any) {
    console.error('Error creating question:', error.message);
    toast.error(`Error creating question: ${error.message}`);
    throw error;
  }
};

// Exam management functions
export const getExams = async (): Promise<Exam[]> => {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching exams:', error.message);
    return [];
  }
};

export const updateExam = async (examId: string, updates: Partial<Exam>) => {
  try {
    const { data, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', examId)
      .select()
      .single();

    if (error) {
      console.error('Error updating exam:', error);
      toast.error(`Failed to update exam: ${error.message}`);
      throw error;
    }

    console.log('Exam updated successfully:', data);
    toast.success('Exam updated successfully!');
    return data;
  } catch (error: any) {
    console.error('Error updating exam:', error.message);
    toast.error(`Error updating exam: ${error.message}`);
    throw error;
  }
};

export const submitExam = async (submitData: { exam_id: string; exam_title: string; student_id: string; student_name: string; answers: Record<string, any>; submitted_at: Date; time_spent: number; graded: boolean; score: number | undefined; total_points: number | undefined; feedback: any; individual_scores: any; }) => {
  try {
    const { data, error } = await supabase
      .from('exam_submissions')
      .insert(submitData)
      .select()
      .single();

    if (error) {
      console.error('Error submitting exam:', error);
      toast.error(`Failed to submit exam: ${error.message}`);
      throw error;
    }

    console.log('Exam submitted successfully:', data);
    toast.success('Exam submitted successfully!');
    return data;
  } catch (error: any) {
    console.error('Error submitting exam:', error.message);
    toast.error(`Error submitting exam: ${error.message}`);
    throw error;
  }
};

export const getExamSubmissions = async () => {
  try {
    const { data, error } = await supabase
      .from('exam_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching exam submissions:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching exam submissions:', error.message);
    return [];
  }
};

// Task management functions
export const getTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching tasks:', error.message);
    return [];
  }
};

export const createTask = async (taskData: Omit<Task, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      toast.error(`Failed to create task: ${error.message}`);
      throw error;
    }

    console.log('Task created successfully:', data);
    toast.success('Task created successfully!');
    return data;
  } catch (error: any) {
    console.error('Error creating task:', error.message);
    toast.error(`Error creating task: ${error.message}`);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      toast.error(`Failed to update task: ${error.message}`);
      throw error;
    }

    console.log('Task updated successfully:', data);
    toast.success('Task updated successfully!');
    return data;
  } catch (error: any) {
    console.error('Error updating task:', error.message);
    toast.error(`Error updating task: ${error.message}`);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      toast.error(`Failed to delete task: ${error.message}`);
      throw error;
    }

    console.log('Task deleted successfully');
    toast.success('Task deleted successfully!');
  } catch (error: any) {
    console.error('Error deleting task:', error.message);
    toast.error(`Error deleting task: ${error.message}`);
  }
};

// Password recovery functions
export const getPasswordRecoveryRequests = async (): Promise<PasswordRecoveryRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('password_recovery_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching password recovery requests:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching password recovery requests:', error.message);
    return [];
  }
};

export const processPasswordRecoveryRequest = async (requestId: string, action: 'approve' | 'reject', adminNotes?: string, temporaryPassword?: string) => {
  try {
    const { data, error } = await supabase
      .from('password_recovery_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_notes: adminNotes,
        temporary_password: temporaryPassword,
        processed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error processing password recovery request:', error);
      toast.error(`Failed to process request: ${error.message}`);
      throw error;
    }

    console.log('Password recovery request processed successfully:', data);
    toast.success(`Request ${action}d successfully!`);
    return data;
  } catch (error: any) {
    console.error('Error processing password recovery request:', error.message);
    toast.error(`Error processing request: ${error.message}`);
    throw error;
  }
};

// Chat functions
export const sendChatRequest = async (receiverId: string, message: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_requests')
      .insert({
        receiver_id: receiverId,
        message: message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending chat request:', error);
      toast.error(`Failed to send chat request: ${error.message}`);
      throw error;
    }

    console.log('Chat request sent successfully:', data);
    toast.success('Chat request sent successfully!');
    return data;
  } catch (error: any) {
    console.error('Error sending chat request:', error.message);
    toast.error(`Error sending chat request: ${error.message}`);
    throw error;
  }
};

export const getChatRequests = async (): Promise<ChatRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat requests:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching chat requests:', error.message);
    return [];
  }
};

export const getPrivateChats = async (): Promise<PrivateChat[]> => {
  try {
    const { data, error } = await supabase
      .from('private_chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching private chats:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching private chats:', error.message);
    return [];
  }
};

export const respondToChatRequest = async (requestId: string, response: 'accept' | 'reject') => {
  try {
    const { data, error } = await supabase
      .from('chat_requests')
      .update({
        status: response === 'accept' ? 'accepted' : 'rejected',
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error responding to chat request:', error);
      toast.error(`Failed to respond to chat request: ${error.message}`);
      throw error;
    }

    console.log('Chat request response sent successfully:', data);
    toast.success(`Chat request ${response}ed successfully!`);
    return data;
  } catch (error: any) {
    console.error('Error responding to chat request:', error.message);
    toast.error(`Error responding to chat request: ${error.message}`);
    throw error;
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('private_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching chat messages:', error.message);
    return [];
  }
};

export const sendMessage = async (chatId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('private_messages')
      .insert({
        chat_id: chatId,
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
      throw error;
    }

    console.log('Message sent successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error sending message:', error.message);
    toast.error(`Error sending message: ${error.message}`);
    throw error;
  }
};

// Post functions
export const getPostComments = async (postId: string): Promise<PostComment[]> => {
  try {
    const { data, error } = await supabase
      .from('forum_post_comments')
      .select(`
        *,
        profiles!forum_post_comments_author_id_fkey (
          name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching post comments:', error);
      throw error;
    }

    return data?.map(comment => ({
      id: comment.id,
      post_id: comment.post_id,
      author_id: comment.author_id,
      author_name: comment.profiles?.name || 'Unknown',
      author_avatar: comment.profiles?.avatar_url,
      content: comment.content,
      created_at: comment.created_at,
    })) || [];
  } catch (error: any) {
    console.error('Error fetching post comments:', error.message);
    return [];
  }
};

export const createPostComment = async (postId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('forum_post_comments')
      .insert({
        post_id: postId,
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post comment:', error);
      toast.error(`Failed to create comment: ${error.message}`);
      throw error;
    }

    console.log('Post comment created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error creating post comment:', error.message);
    toast.error(`Error creating comment: ${error.message}`);
    throw error;
  }
};

export const getPostLikes = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('forum_post_likes')
      .select('*')
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching post likes:', error);
      throw error;
    }

    const count = data?.length || 0;
    const currentUser = await getCurrentUser();
    const isLiked = currentUser ? data?.some(like => like.user_id === currentUser.id) || false : false;

    return { count, isLiked };
  } catch (error: any) {
    console.error('Error fetching post likes:', error.message);
    return { count: 0, isLiked: false };
  }
};

export const togglePostLike = async (postId: string) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', currentUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
    } else {
      // Add like
      const { error } = await supabase
        .from('forum_post_likes')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling post like:', error.message);
    throw error;
  }
};

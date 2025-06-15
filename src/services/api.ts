import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
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
      // Do not display an error message here, just return null
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
        user_name: email.split('@')[0], // Use email prefix as name initially
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

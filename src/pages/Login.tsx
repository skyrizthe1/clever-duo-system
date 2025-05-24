
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { login } from '@/services/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      console.log('Attempting login with:', values.email);
      
      const user = await login(values.email, values.password);
      console.log('Login successful, user:', user);
      
      // Clear all cached queries and refetch user data
      await queryClient.invalidateQueries();
      
      // Set the user data directly in cache
      queryClient.setQueryData(['currentUser'], user);
      
      toast.success('Login successful');
      
      // Navigate after a short delay to ensure state is updated
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-md flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-lg">E</span>
          </div>
          <h1 className="text-2xl font-bold">Exam Portal</h1>
          <p className="text-gray-500 mt-2">Sign in to access your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

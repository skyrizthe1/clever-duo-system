
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { getCurrentUser } from '@/services/api';
import { AdminDashboard } from '@/components/AdminDashboard';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { Button } from '@/components/ui/button';
import { CloudBackground } from '@/components/CloudBackground';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CloudBackground />
        <Header />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center modern-card p-12 rounded-3xl mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CloudBackground />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16">
          <div className="modern-card p-16 rounded-3xl max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold gradient-text mb-6 leading-tight">
              Modern Exam Portal
            </h1>
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Welcome back, {currentUser?.name}!
            </h2>
            <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              {currentUser?.role === 'admin' && "Manage your educational platform with powerful tools and insights"}
              {currentUser?.role === 'teacher' && "Create and manage your exams with our intuitive interface"}
              {currentUser?.role === 'student' && "Check your upcoming exams and track your academic progress"}
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
        
        <div className="modern-card rounded-3xl p-8">
          {currentUser?.role === 'admin' && <AdminDashboard />}
          {currentUser?.role === 'teacher' && <TeacherDashboard />}
          {currentUser?.role === 'student' && <StudentDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Index;

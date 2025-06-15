
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { getCurrentUser } from '@/services/api';
import { AdminDashboard } from '@/components/AdminDashboard';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { Separator } from '@/components/ui/separator';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          // No user found, redirect to login
          navigate('/login');
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
        // If there's an error getting the user, redirect to login
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Please wait while we prepare your workspace...</p>
          </div>
        </main>
      </div>
    );
  }

  // If no user after loading, this shouldn't render as we redirect above
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Welcome Section */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 leading-tight">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-gray-700 text-xl font-medium">
              {currentUser?.role === 'admin' && "Manage your educational platform with confidence"}
              {currentUser?.role === 'teacher' && "Create impactful exams and track student progress"}
              {currentUser?.role === 'student' && "Stay on top of your academic journey"}
            </p>
          </div>
          
          <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent h-px" />
        </div>
        
        {/* Dashboard Content with Enhanced Spacing */}
        <div className="space-y-12">
          {currentUser?.role === 'admin' && <AdminDashboard />}
          {currentUser?.role === 'teacher' && <TeacherDashboard />}
          {currentUser?.role === 'student' && <StudentDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Index;

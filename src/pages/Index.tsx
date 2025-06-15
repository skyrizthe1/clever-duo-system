
import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { getCurrentUser } from '@/services/api';
import { AdminDashboard } from '@/components/AdminDashboard';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

const Index = () => {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 tracking-tight leading-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-gray-700 text-xl font-medium">
            {currentUser.role === 'admin' && "Manage your educational platform"}
            {currentUser.role === 'teacher' && "Create and manage your exams"}
            {currentUser.role === 'student' && "Check your upcoming exams and results"}
          </p>
        </div>
        
        <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent h-px" />
        
        {currentUser.role === 'admin' && <AdminDashboard />}
        {currentUser.role === 'teacher' && <TeacherDashboard />}
        {currentUser.role === 'student' && <StudentDashboard />}
      </main>
    </div>
  );
};

export default Index;

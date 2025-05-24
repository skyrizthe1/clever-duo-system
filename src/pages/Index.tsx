
import React from 'react';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/api';
import { AdminDashboard } from '@/components/AdminDashboard';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';

const Index = () => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  if (isLoading) {
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
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-gray-600 text-lg">
            {currentUser?.role === 'admin' && "Manage your educational platform"}
            {currentUser?.role === 'teacher' && "Create and manage your exams"}
            {currentUser?.role === 'student' && "Check your upcoming exams and results"}
          </p>
        </div>
        
        {currentUser?.role === 'admin' && <AdminDashboard />}
        {currentUser?.role === 'teacher' && <TeacherDashboard />}
        {currentUser?.role === 'student' && <StudentDashboard />}
      </main>
    </div>
  );
};

export default Index;

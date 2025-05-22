
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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {currentUser?.role === 'admin' && <AdminDashboard />}
        {currentUser?.role === 'teacher' && <TeacherDashboard />}
        {currentUser?.role === 'student' && <StudentDashboard />}
      </main>
    </div>
  );
};

export default Index;

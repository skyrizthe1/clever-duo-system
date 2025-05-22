
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getExams, getQuestions } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, FileText, Check } from 'lucide-react';

export function AdminDashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });
  
  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });
  
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Admin: {users.filter(u => u.role === 'admin').length} | 
              Teacher: {users.filter(u => u.role === 'teacher').length} | 
              Student: {users.filter(u => u.role === 'student').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Published: {exams.filter(e => e.published).length}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">System Administration</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader>
            <CardTitle className="text-md">Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Add, edit, or remove users and manage their roles</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader>
            <CardTitle className="text-md">Question Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage the question repository and categories</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader>
            <CardTitle className="text-md">Exam Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Configure system-wide exam settings and policies</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

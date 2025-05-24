
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getExams, getQuestions } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, FileText, Check, Settings, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  
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

  const handleManageUsers = () => {
    toast.info("User management feature coming soon!");
  };

  const handleQuestionBank = () => {
    navigate('/questions');
  };

  const handleExamSettings = () => {
    toast.info("Exam settings feature coming soon!");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
            <UserIcon className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{users.length}</div>
            <p className="text-xs text-blue-600 mt-1">
              Admin: {users.filter(u => u.role === 'admin').length} | 
              Teacher: {users.filter(u => u.role === 'teacher').length} | 
              Student: {users.filter(u => u.role === 'student').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Questions</CardTitle>
            <FileText className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{questions.length}</div>
            <p className="text-xs text-green-600 mt-1">Question Bank</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Exams</CardTitle>
            <Check className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{exams.length}</div>
            <p className="text-xs text-purple-600 mt-1">
              Published: {exams.filter(e => e.published).length}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">System Administration</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-lg bg-white/80 backdrop-blur-sm"
          onClick={handleManageUsers}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg text-gray-800">Manage Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Add, edit, or remove users and manage their roles</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-lg bg-white/80 backdrop-blur-sm"
          onClick={handleQuestionBank}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg text-gray-800">Question Bank</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage the question repository and categories</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-lg bg-white/80 backdrop-blur-sm"
          onClick={handleExamSettings}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg text-gray-800">Exam Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configure system-wide exam settings and policies</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

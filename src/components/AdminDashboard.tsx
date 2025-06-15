
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getExams, getQuestions, getPasswordRecoveryRequests } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserIcon, FileText, Check, Settings, Database, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserManagementDialog } from './UserManagementDialog';
import { ExamSettingsDialog } from './ExamSettingsDialog';
import { PasswordRecoveryAdmin } from './PasswordRecoveryAdmin';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [examSettingsOpen, setExamSettingsOpen] = useState(false);
  const [passwordRecoveryOpen, setPasswordRecoveryOpen] = useState(false);
  
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

  const { data: recoveryRequests = [] } = useQuery({
    queryKey: ['password-recovery-requests'],
    queryFn: getPasswordRecoveryRequests
  });

  const pendingRecoveryRequests = recoveryRequests.filter(r => r.status === 'pending');

  const handleManageUsers = () => {
    setUserManagementOpen(true);
  };

  const handleQuestionBank = () => {
    navigate('/questions');
  };

  const handleExamSettings = () => {
    setExamSettingsOpen(true);
  };

  const handlePasswordRecovery = () => {
    setPasswordRecoveryOpen(true);
  };

  if (passwordRecoveryOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPasswordRecoveryOpen(false)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
        <PasswordRecoveryAdmin 
          open={passwordRecoveryOpen} 
          onOpenChange={setPasswordRecoveryOpen} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          System Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
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
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Questions</CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{questions.length}</div>
              <p className="text-xs text-green-600 mt-1">Question Bank</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
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

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Password Requests</CardTitle>
              <Key className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{pendingRecoveryRequests.length}</div>
              <p className="text-xs text-orange-600 mt-1">Pending Review</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent h-px" />
      
      <div>
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          System Administration
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300"
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
            className="cursor-pointer hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-green-300"
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
            className="cursor-pointer hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300"
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

          <Card 
            className="cursor-pointer hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-orange-300"
            onClick={handlePasswordRecovery}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Key className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg text-gray-800">Password Recovery</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Review and process password reset requests</p>
              {pendingRecoveryRequests.length > 0 && (
                <div className="mt-2">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                    {pendingRecoveryRequests.length} pending
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <UserManagementDialog 
        open={userManagementOpen} 
        onOpenChange={setUserManagementOpen} 
      />
      
      <ExamSettingsDialog 
        open={examSettingsOpen} 
        onOpenChange={setExamSettingsOpen} 
      />
    </div>
  );
}

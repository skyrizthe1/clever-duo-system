
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExams, getQuestions, updateExam } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Plus, BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TeacherDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });
  
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateExam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    }
  });

  const handleTogglePublish = (examId: string, currentPublished: boolean) => {
    updateExamMutation.mutate({
      id: examId,
      updates: { published: !currentPublished }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">My Questions</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{questions.length}</div>
            <p className="text-xs text-blue-600 mt-1">Question Bank</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
              onClick={() => navigate('/questions')}
            >
              Manage Questions
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">My Exams</CardTitle>
            <Clock className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{exams.length}</div>
            <p className="text-xs text-green-600 mt-1">
              Published: {exams.filter(e => e.published).length}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800"
              onClick={() => navigate('/exams')}
            >
              Manage Exams
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quick Actions</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-lg bg-white/80 backdrop-blur-sm"
          onClick={() => navigate('/questions?action=create')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Create Question</h3>
            </div>
            <p className="text-gray-600">Add a new question to the question bank</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-lg bg-white/80 backdrop-blur-sm"
          onClick={() => navigate('/exams?action=create')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Create Exam</h3>
            </div>
            <p className="text-gray-600">Schedule and set up a new examination</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-lg bg-white/80 backdrop-blur-sm"
          onClick={() => navigate('/grading')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Grade Submissions</h3>
            </div>
            <p className="text-gray-600">Review and grade pending exam submissions</p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Upcoming Exams</h2>
      {exams.length > 0 ? (
        <div className="space-y-4">
          {exams.slice(0, 3).map((exam) => (
            <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-gray-800">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{exam.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Start</p>
                    <p className="text-gray-700">{new Date(exam.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">End</p>
                    <p className="text-gray-700">{new Date(exam.endTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Duration</p>
                    <p className="text-gray-700">{exam.duration} min</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/exams/${exam.id}`)}
                  className="hover:bg-blue-50 border-blue-200 text-blue-700"
                >
                  Edit
                </Button>
                {exam.published ? (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="hover:bg-gray-200"
                    onClick={() => handleTogglePublish(exam.id, exam.published)}
                    disabled={updateExamMutation.isPending}
                  >
                    {updateExamMutation.isPending ? 'Updating...' : 'Unpublish'}
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                    onClick={() => handleTogglePublish(exam.id, exam.published)}
                    disabled={updateExamMutation.isPending}
                  >
                    {updateExamMutation.isPending ? 'Publishing...' : 'Publish'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No exams scheduled yet.</p>
          <p className="text-gray-500 mt-1">Create your first exam to get started!</p>
        </div>
      )}
    </div>
  );
}

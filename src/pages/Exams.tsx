
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExams, getCurrentUser, createExam, updateExam, deleteExam, getQuestions } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Users, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { ExamDetailsDialog } from '@/components/ExamDetailsDialog';
import { toast } from 'sonner';

const Exams = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });

  const createMutation = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setIsCreating(false);
      toast.success('Exam created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateExam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setEditingExam(null);
      toast.success('Exam updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
    }
  });

  const handleViewDetails = (exam: any) => {
    setSelectedExam(exam);
    setDetailsOpen(true);
  };

  const handleEdit = (exam: any) => {
    setEditingExam(exam);
  };

  const handleDelete = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteMutation.mutate(examId);
    }
  };

  const handleCreateExam = (examData: any) => {
    if (!currentUser) return;
    
    const newExam = {
      ...examData,
      created_by: currentUser.id,
      start_time: new Date(examData.start_time),
      end_time: new Date(examData.end_time),
      published: examData.published === 'true' || examData.published === true
    };
    
    createMutation.mutate(newExam);
  };

  const handleUpdateExam = (examData: any) => {
    if (!editingExam) return;
    
    const updates = {
      ...examData,
      start_time: new Date(examData.start_time),
      end_time: new Date(examData.end_time),
      published: examData.published === 'true' || examData.published === true
    };
    
    updateMutation.mutate({ id: editingExam.id, updates });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="text-center">Loading exams...</div>
        </main>
      </div>
    );
  }

  const canManageExams = currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher');
  const userExams = canManageExams ? exams : exams.filter(exam => exam.published);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exams</h1>
          {canManageExams && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          )}
        </div>

        {userExams.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No exams available</h3>
            <p className="text-gray-500 mt-1">
              {canManageExams ? 'Create your first exam to get started' : 'No published exams yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userExams.map((exam) => {
              const now = new Date();
              const startTime = new Date(exam.start_time);
              const endTime = new Date(exam.end_time);
              
              let status = 'upcoming';
              if (now >= startTime && now <= endTime) {
                status = 'ongoing';
              } else if (now > endTime) {
                status = 'completed';
              }

              return (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <Badge 
                        variant={status === 'ongoing' ? 'default' : status === 'completed' ? 'secondary' : 'outline'}
                        className={
                          status === 'ongoing' ? 'bg-green-500' : 
                          status === 'completed' ? 'bg-gray-500' : 'bg-blue-500'
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{exam.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(exam.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{exam.questions.length} questions</span>
                      </div>
                      {!exam.published && (
                        <Badge variant="outline" className="text-yellow-600">
                          Draft
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(exam)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      {canManageExams && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(exam)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(exam.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <ExamDetailsDialog
          exam={selectedExam}
          questions={questions}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          isCreating={isCreating}
          isEditing={!!editingExam}
          onCreateExam={handleCreateExam}
          onUpdateExam={handleUpdateExam}
          onCloseCreate={() => setIsCreating(false)}
          onCloseEdit={() => setEditingExam(null)}
          editingExam={editingExam}
        />
      </main>
    </div>
  );
};

export default Exams;

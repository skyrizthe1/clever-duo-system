
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExams, getQuestions, createExam, updateExam, deleteExam, getCurrentUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Plus, Edit, Trash2, Users } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const Exams = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    start_time: '',
    end_time: '',
    questions: [],
    published: false
  });

  const { data: exams = [], isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const createMutation = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setCreateOpen(false);
      resetForm();
      toast.success('Exam created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateExam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setEditingExam(null);
      resetForm();
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

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 60,
      start_time: '',
      end_time: '',
      questions: [],
      published: false
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.start_time || !formData.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const examData = {
      ...formData,
      start_time: new Date(formData.start_time),
      end_time: new Date(formData.end_time),
      created_by: currentUser?.id || 'unknown'
    };

    if (editingExam) {
      updateMutation.mutate({ id: editingExam.id, updates: examData });
    } else {
      createMutation.mutate(examData);
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      duration: exam.duration,
      start_time: new Date(exam.start_time).toISOString().slice(0, 16),
      end_time: new Date(exam.end_time).toISOString().slice(0, 16),
      questions: exam.questions || [],
      published: exam.published || false
    });
  };

  const handleQuestionToggle = (questionId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, questionId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter(id => id !== questionId)
      }));
    }
  };

  const handleDelete = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteMutation.mutate(examId);
    }
  };

  if (examsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p>Loading exams...</p>
          </div>
        </main>
      </div>
    );
  }

  if (examsError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading exams: {examsError.message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exam Management</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </div>

        {exams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <Badge variant={exam.published ? 'default' : 'secondary'}>
                      {exam.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{exam.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {new Date(exam.start_time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>End: {new Date(exam.end_time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Questions: {exam.questions?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(exam)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(exam.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No exams created yet</h3>
            <p className="text-gray-500 mt-1">Create your first exam to get started</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </div>
        )}

        <Dialog open={createOpen || !!editingExam} onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditingExam(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
              <DialogDescription>
                {editingExam ? 'Update exam details and settings' : 'Set up a new examination with questions and schedule'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter exam title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter exam description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  />
                </div>

                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Questions</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {questions.length > 0 ? questions.map((question) => (
                    <div key={question.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={question.id}
                        checked={formData.questions.includes(question.id)}
                        onCheckedChange={(checked) => handleQuestionToggle(question.id, checked)}
                      />
                      <Label htmlFor={question.id} className="text-sm flex-1">
                        {question.content} ({question.points} pts)
                      </Label>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-sm">No questions available. Create questions first.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Publish exam (make visible to students)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateOpen(false);
                setEditingExam(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingExam ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Exams;

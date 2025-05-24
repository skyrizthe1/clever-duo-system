
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExams, getCurrentUser, createExam, updateExam } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Exams = () => {
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    duration: 60,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });
  
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const createExamMutation = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setIsDialogOpen(false);
      setNewExam({
        title: '',
        description: '',
        duration: 60,
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
    }
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateExam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    }
  });
  
  const filteredExams = React.useMemo(() => {
    if (filter === 'all') return exams;
    if (filter === 'published') return exams.filter(exam => exam.published);
    return exams.filter(exam => !exam.published);
  }, [exams, filter]);
  
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'create') {
      setIsDialogOpen(true);
    }
  }, [location]);
  
  const handleCreateExam = () => {
    setIsDialogOpen(true);
    
    if (location.search.includes('action=create')) {
      navigate('/exams');
    }
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to create an exam");
      return;
    }

    createExamMutation.mutate({
      title: newExam.title,
      description: newExam.description,
      duration: newExam.duration,
      startTime: new Date(newExam.startTime),
      endTime: new Date(newExam.endTime),
      questions: [],
      createdBy: currentUser.id,
      published: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExam(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleTogglePublish = (examId: string, currentPublished: boolean) => {
    updateExamMutation.mutate({
      id: examId,
      updates: { published: !currentPublished }
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Exams</h1>
          {isTeacherOrAdmin && (
            <Button 
              onClick={handleCreateExam}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create New Exam
            </Button>
          )}
        </div>
        
        {isTeacherOrAdmin && (
          <div className="flex gap-2 mb-6">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
              className="transition-all duration-200 hover:scale-105"
            >
              All
            </Button>
            <Button 
              variant={filter === 'published' ? 'default' : 'outline'} 
              onClick={() => setFilter('published')}
              className="transition-all duration-200 hover:scale-105"
            >
              Published
            </Button>
            <Button 
              variant={filter === 'unpublished' ? 'default' : 'outline'} 
              onClick={() => setFilter('unpublished')}
              className="transition-all duration-200 hover:scale-105"
            >
              Unpublished
            </Button>
          </div>
        )}
        
        {filteredExams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map(exam => (
              <Card key={exam.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                  <CardTitle className="text-gray-800">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Duration: {exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-green-500" />
                      <span>Start: {format(new Date(exam.startTime), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Questions: {exam.questions.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="hover:bg-blue-50 transition-colors">View Details</Button>
                  {isTeacherOrAdmin && (
                    exam.published 
                      ? <Button 
                          variant="secondary" 
                          className="hover:bg-gray-200 transition-colors"
                          onClick={() => handleTogglePublish(exam.id, exam.published)}
                          disabled={updateExamMutation.isPending}
                        >
                          {updateExamMutation.isPending ? 'Updating...' : 'Unpublish'}
                        </Button>
                      : <Button 
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
            <h3 className="text-lg font-medium text-gray-600">No exams found</h3>
            <p className="text-gray-500 mt-1">
              {isTeacherOrAdmin 
                ? "Click the 'Create New Exam' button to create your first exam"
                : "No exams are currently available"
              }
            </p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create New Exam</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new exam. You can add questions after creating the exam.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleExamSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newExam.title}
                    onChange={handleInputChange}
                    placeholder="Mid-term Exam"
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newExam.description}
                    onChange={handleInputChange}
                    placeholder="Describe the exam content and instructions"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      value={newExam.duration}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={newExam.startTime}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={newExam.endTime}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createExamMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Exams;

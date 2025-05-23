
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getExams, getCurrentUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const Exams = () => {
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });
  
  const filteredExams = React.useMemo(() => {
    if (filter === 'all') return exams;
    if (filter === 'published') return exams.filter(exam => exam.published);
    return exams.filter(exam => !exam.published);
  }, [exams, filter]);
  
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  
  // Check if we need to show the exam creation dialog
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'create') {
      handleCreateExam();
    }
  }, [location]);
  
  const handleCreateExam = () => {
    // For now, just show a toast to acknowledge the click
    // In a real implementation, this would open a dialog or navigate to a form
    toast.info('Create Exam functionality will be implemented soon');
    
    // Clear the action from the URL
    if (location.search.includes('action=create')) {
      navigate('/exams');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exams</h1>
          {isTeacherOrAdmin && (
            <Button onClick={handleCreateExam}>Create New Exam</Button>
          )}
        </div>
        
        {isTeacherOrAdmin && (
          <div className="flex gap-2 mb-6">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'published' ? 'default' : 'outline'} 
              onClick={() => setFilter('published')}
            >
              Published
            </Button>
            <Button 
              variant={filter === 'unpublished' ? 'default' : 'outline'} 
              onClick={() => setFilter('unpublished')}
            >
              Unpublished
            </Button>
          </div>
        )}
        
        {filteredExams.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map(exam => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{exam.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Duration: {exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Start: {format(new Date(exam.startTime), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Questions: {exam.questions.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">View Details</Button>
                  {isTeacherOrAdmin && (
                    exam.published 
                      ? <Button variant="secondary">Unpublish</Button>
                      : <Button>Publish</Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No exams found</h3>
            <p className="text-gray-500 mt-1">
              {isTeacherOrAdmin 
                ? "Click the 'Create New Exam' button to create your first exam"
                : "No exams are currently available"
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Exams;

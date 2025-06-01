
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExams, getCurrentUser, getExamSubmissions, gradeSubmission } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Grading = () => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [points, setPoints] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  
  const queryClient = useQueryClient();
  
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });
  
  const { data: submissions = [] } = useQuery({
    queryKey: ['examSubmissions'],
    queryFn: getExamSubmissions
  });
  
  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, grade, feedbackData }: { submissionId: string, grade: number, feedbackData: Record<string, string> }) =>
      gradeSubmission(submissionId, grade, feedbackData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSubmissions'] });
      setGradingOpen(false);
      toast.success('Grades saved successfully');
    }
  });
  
  // Filter to get exams that need grading (completed exams)
  const now = new Date();
  const completedExams = exams.filter(exam => 
    exam.published && new Date(exam.end_time) < now
  );
  
  // Get real submissions from the API
  const realSubmissions = submissions.filter(sub => 
    completedExams.some(exam => exam.id === sub.exam_id)
  );
  
  const handleOpenGrading = (submission: any) => {
    setSelectedSubmission(submission);
    
    // Initialize points and feedback for each question
    const initialPoints: Record<string, string> = {};
    const initialFeedback: Record<string, string> = {};
    
    const exam = exams.find(e => e.id === submission.exam_id);
    if (exam) {
      exam.questions.forEach(questionId => {
        initialPoints[questionId] = submission.graded && submission.feedback ? 
          String(Math.floor(Math.random() * 10)) : '';
        initialFeedback[questionId] = submission.graded && submission.feedback ? 
          submission.feedback[questionId] || 'Good work on this question.' : '';
      });
    }
    
    setPoints(initialPoints);
    setFeedback(initialFeedback);
    setGradingOpen(true);
  };
  
  const handleSaveGrading = () => {
    if (!selectedSubmission) return;
    
    const totalPoints = Object.values(points).reduce((sum, p) => sum + (parseInt(p) || 0), 0);
    
    gradeMutation.mutate({
      submissionId: selectedSubmission.id,
      grade: totalPoints,
      feedbackData: feedback
    });
  };
  
  const filteredSubmissions = selectedExam 
    ? realSubmissions.filter(sub => sub.exam_id === selectedExam)
    : realSubmissions;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Grade Submissions</h1>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            variant={selectedExam === null ? 'default' : 'outline'} 
            onClick={() => setSelectedExam(null)}
          >
            All Exams
          </Button>
          
          {completedExams.map(exam => (
            <Button 
              key={exam.id} 
              variant={selectedExam === exam.id ? 'default' : 'outline'} 
              onClick={() => setSelectedExam(exam.id)}
            >
              {exam.title}
            </Button>
          ))}
        </div>
        
        {filteredSubmissions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Student Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.student_name || 'Unknown Student'}</TableCell>
                      <TableCell>{exams.find(e => e.id === sub.exam_id)?.title || 'Unknown Exam'}</TableCell>
                      <TableCell>{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          sub.graded 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {sub.graded ? 'Graded' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenGrading(sub)}
                        >
                          {sub.graded ? 'Review Grades' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No submissions to grade</h3>
            <p className="text-gray-500 mt-1">
              {realSubmissions.length === 0 
                ? "There are no exam submissions yet. Students need to complete exams first."
                : "All submissions for the selected exam have been processed."
              }
            </p>
          </div>
        )}
        
        <Dialog open={gradingOpen} onOpenChange={setGradingOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {exams.find(e => e.id === selectedSubmission?.exam_id)?.title} - {selectedSubmission?.student_name}
              </DialogTitle>
              <DialogDescription>
                Grade this student's exam submission
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
              {selectedSubmission && exams.find(e => e.id === selectedSubmission.exam_id)?.questions.map((questionId, index) => {
                const studentAnswer = selectedSubmission.answers[questionId] || 'No answer';
                
                return (
                  <Card key={questionId}>
                    <CardContent className="pt-4">
                      <div className="mb-2">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <p className="text-muted-foreground text-sm">Question ID: {questionId}</p>
                      </div>
                      
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium mb-1">Student Answer:</h4>
                        <p>{studentAnswer}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`points-${questionId}`} className="text-sm font-medium mb-1 block">
                            Points
                          </label>
                          <Input 
                            id={`points-${questionId}`}
                            value={points[questionId] || ''}
                            onChange={(e) => setPoints({...points, [questionId]: e.target.value})}
                            placeholder="Enter points"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`feedback-${questionId}`} className="text-sm font-medium mb-1 block">
                            Feedback
                          </label>
                          <Textarea 
                            id={`feedback-${questionId}`}
                            value={feedback[questionId] || ''}
                            onChange={(e) => setFeedback({...feedback, [questionId]: e.target.value})}
                            placeholder="Enter feedback for student"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setGradingOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveGrading} disabled={gradeMutation.isPending}>
                {gradeMutation.isPending ? 'Saving...' : 'Save Grades'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Grading;

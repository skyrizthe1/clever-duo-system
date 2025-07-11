import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExams, getCurrentUser, getExamSubmissions, gradeSubmission, getQuestions } from '@/services/api';
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
  
  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
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
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setGradingOpen(false);
      toast.success('Grades saved successfully');
    }
  });
  
  console.log('All submissions:', submissions);
  console.log('Available exams:', exams);
  
  // Get submissions that match available exams
  const validSubmissions = submissions.filter(sub => {
    const examExists = exams.some(exam => exam.id === sub.exam_id);
    console.log(`Submission ${sub.id} for exam ${sub.exam_id}: exam exists = ${examExists}`);
    return examExists;
  });
  
  console.log('Valid submissions:', validSubmissions);
  
  const handleOpenGrading = (submission: any) => {
    console.log('Opening grading for submission:', submission);
    setSelectedSubmission(submission);
    
    // Initialize points and feedback for each question
    const initialPoints: Record<string, string> = {};
    const initialFeedback: Record<string, string> = {};
    
    const exam = exams.find(e => e.id === submission.exam_id);
    if (exam) {
      exam.questions.forEach((questionId, index) => {
        // Get the actual question to determine max points
        const question = questions.find(q => q.id === questionId);
        const maxPoints = question?.points || 10;
        
        // If already graded, use existing scores, otherwise default to 0
        initialPoints[questionId] = submission.graded && submission.individual_scores ? 
          String(submission.individual_scores[questionId] || 0) : '';
        initialFeedback[questionId] = submission.graded && submission.feedback ? 
          submission.feedback[questionId] || '' : '';
      });
    }
    
    setPoints(initialPoints);
    setFeedback(initialFeedback);
    setGradingOpen(true);
  };
  
  const handleSaveGrading = () => {
    if (!selectedSubmission) return;
    
    // Calculate total points awarded
    const totalPointsAwarded = Object.values(points).reduce((sum, p) => sum + (parseInt(p) || 0), 0);
    
    // Calculate total possible points
    const exam = exams.find(e => e.id === selectedSubmission.exam_id);
    let totalPossiblePoints = 100; // default
    
    if (exam) {
      totalPossiblePoints = exam.questions.reduce((sum, questionId) => {
        const question = questions.find(q => q.id === questionId);
        return sum + (question?.points || 10);
      }, 0);
    }
    
    console.log('Grading details:', {
      totalPointsAwarded,
      totalPossiblePoints,
      individual_scores: points,
      feedback
    });
    
    gradeMutation.mutate({
      submissionId: selectedSubmission.id,
      grade: totalPointsAwarded,
      feedbackData: {
        ...feedback,
        total_points: String(totalPossiblePoints),
        individual_scores: JSON.stringify(points)
      }
    });
  };
  
  const filteredSubmissions = selectedExam 
    ? validSubmissions.filter(sub => sub.exam_id === selectedExam)
    : validSubmissions;
  
  console.log('Filtered submissions to display:', filteredSubmissions);
  
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
            All Exams ({validSubmissions.length})
          </Button>
          
          {exams.map(exam => {
            const examSubmissionCount = validSubmissions.filter(sub => sub.exam_id === exam.id).length;
            return (
              <Button 
                key={exam.id} 
                variant={selectedExam === exam.id ? 'default' : 'outline'} 
                onClick={() => setSelectedExam(exam.id)}
              >
                {exam.title} ({examSubmissionCount})
              </Button>
            );
          })}
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
                  {filteredSubmissions.map((sub) => {
                    const exam = exams.find(e => e.id === sub.exam_id);
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.student_name || 'Unknown Student'}</TableCell>
                        <TableCell>{sub.exam_title || 'Unknown Exam'}</TableCell>
                        <TableCell>{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            sub.graded 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {sub.graded ? `Graded (${sub.score || 0} pts)` : 'Pending'}
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
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No submissions to grade</h3>
            <p className="text-gray-500 mt-1">
              {validSubmissions.length === 0 
                ? "There are no exam submissions yet. Students need to complete exams first."
                : "All submissions for the selected exam have been processed."
              }
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Total submissions in system: {submissions.length} | Valid submissions: {validSubmissions.length}
            </p>
          </div>
        )}
        
        <Dialog open={gradingOpen} onOpenChange={setGradingOpen}>
          <DialogContent className="max-w-4xl">
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
                const question = questions.find(q => q.id === questionId);
                const studentAnswer = selectedSubmission.answers[questionId] || 'No answer';
                const maxPoints = question?.points || 10;
                
                return (
                  <Card key={questionId}>
                    <CardContent className="pt-4">
                      <div className="mb-2">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <p className="text-sm font-medium text-blue-600">{question?.content || 'Question not found'}</p>
                        <p className="text-xs text-muted-foreground">Max Points: {maxPoints}</p>
                      </div>
                      
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium mb-1">Student Answer:</h4>
                        <p>{Array.isArray(studentAnswer) ? studentAnswer.join(', ') : studentAnswer}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`points-${questionId}`} className="text-sm font-medium mb-1 block">
                            Points (out of {maxPoints})
                          </label>
                          <Input 
                            id={`points-${questionId}`}
                            type="number"
                            min="0"
                            max={maxPoints}
                            value={points[questionId] || ''}
                            onChange={(e) => setPoints({...points, [questionId]: e.target.value})}
                            placeholder={`0-${maxPoints}`}
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
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {selectedSubmission && (
                <Card className="bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <h3 className="font-medium text-blue-800">Total Score</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {Object.values(points).reduce((sum, p) => sum + (parseInt(p) || 0), 0)}
                        {' / '}
                        {exams.find(e => e.id === selectedSubmission.exam_id)?.questions.reduce((sum, questionId) => {
                          const question = questions.find(q => q.id === questionId);
                          return sum + (question?.points || 10);
                        }, 0) || 100}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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

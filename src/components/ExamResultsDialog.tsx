
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Exam } from '@/services/api';

interface ExamResultsDialogProps {
  exam: Exam | null;
  submission?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamResultsDialog({ exam, submission, open, onOpenChange }: ExamResultsDialogProps) {
  if (!exam) return null;

  // Use actual submission data if available, otherwise show default
  const actualScore = submission?.score || 0;
  const totalPoints = submission?.total_points || 100;
  const timeSpent = submission?.time_spent ? Math.floor(submission.time_spent / 60) : 0;
  const questionsAnswered = submission?.answers ? Object.keys(submission.answers).length : 0;
  
  // Calculate grade based on actual score
  const percentage = totalPoints > 0 ? (actualScore / totalPoints) * 100 : 0;
  
  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const grade = getGrade(percentage);

  const handleDownloadCertificate = () => {
    // Create a simple certificate content
    const certificateContent = `
CERTIFICATE OF COMPLETION

This is to certify that
[Student Name]

has successfully completed the examination

${exam.title}

Score: ${actualScore}/${totalPoints} (${percentage.toFixed(1)}%)
Grade: ${grade}
Date: ${new Date().toLocaleDateString()}

${percentage >= 60 ? 'Congratulations on your achievement!' : 'Keep studying and try again!'}
    `;

    // Create a blob and download it
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Exam Results</DialogTitle>
          <p className="text-muted-foreground">{exam.title}</p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-600 mb-2">
              {percentage.toFixed(1)}%
            </div>
            <Badge className={`text-lg px-4 py-2 ${
              grade === 'A' ? 'bg-green-100 text-green-800' :
              grade === 'B' ? 'bg-blue-100 text-blue-800' :
              grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
              grade === 'D' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              Grade: {grade}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actualScore}/{totalPoints}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  Time Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeSpent} min</div>
                <p className="text-xs text-muted-foreground">of {exam.duration} min</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Questions Answered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{questionsAnswered}/{exam.questions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Date Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {submission?.submitted_at ? 
                    new Date(submission.submitted_at).toLocaleDateString() : 
                    'Not submitted'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {submission?.graded && submission?.feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Teacher Feedback</h4>
              <div className="space-y-2 text-sm text-blue-700">
                {Object.entries(submission.feedback).map(([questionId, feedback], index) => (
                  <p key={questionId}>• Question {index + 1}: {feedback}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {percentage >= 60 && (
              <Button onClick={handleDownloadCertificate}>
                Download Certificate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

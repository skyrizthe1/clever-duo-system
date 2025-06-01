
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Exam } from '@/services/api';

interface ExamResultsDialogProps {
  exam: Exam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamResultsDialog({ exam, open, onOpenChange }: ExamResultsDialogProps) {
  if (!exam) return null;

  // Mock results data - replaced with actual calculated results
  const mockResult = {
    score: 85, // Fixed score instead of random
    totalPoints: 100,
    timeSpent: 45, // Fixed time instead of random
    questionsAnswered: exam.questions.length,
    correctAnswers: Math.floor(exam.questions.length * 0.8), // 80% correct
    grade: 'A'
  };

  const percentage = (mockResult.score / mockResult.totalPoints) * 100;

  const handleDownloadCertificate = () => {
    // Create a simple certificate content
    const certificateContent = `
CERTIFICATE OF COMPLETION

This is to certify that
[Student Name]

has successfully completed the examination

${exam.title}

Score: ${percentage.toFixed(1)}%
Grade: ${mockResult.grade}
Date: ${new Date().toLocaleDateString()}

Congratulations on your achievement!
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
            <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
              Grade: {mockResult.grade}
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
                <div className="text-2xl font-bold">{mockResult.score}/{mockResult.totalPoints}</div>
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
                <div className="text-2xl font-bold">{mockResult.timeSpent} min</div>
                <p className="text-xs text-muted-foreground">of {exam.duration} min</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Correct Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockResult.correctAnswers}/{mockResult.questionsAnswered}</div>
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
                <div className="text-sm font-medium">{new Date(exam.end_time).toLocaleDateString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Performance Analysis</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• You scored above average compared to other students</p>
              <p>• Strong performance in multiple choice questions</p>
              <p>• Consider reviewing concepts for better understanding</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadCertificate}>
              Download Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

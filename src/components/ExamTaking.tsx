
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { Exam, Question } from '@/services/api';
import { useAntiCheating } from '@/hooks/useAntiCheating';
import { toast } from 'sonner';

interface ExamTakingProps {
  exam: Exam | null;
  questions: Question[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (answers: Record<string, any>) => void;
}

export function ExamTaking({ exam, questions, open, onOpenChange, onSubmit }: ExamTakingProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const { violations, isTabActive } = useAntiCheating({
    isExamActive: open,
    onViolation: () => {
      console.log('Anti-cheating violation detected');
    }
  });

  useEffect(() => {
    if (exam && open) {
      setTimeLeft(exam.duration * 60); // Convert minutes to seconds
    }
  }, [exam, open]);

  useEffect(() => {
    if (timeLeft > 0 && open) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && open) {
      handleSubmit();
    }
  }, [timeLeft, open]);

  if (!exam) return null;

  const examQuestions = questions.filter(q => exam.questions.includes(q.id));
  const currentQ = examQuestions[currentQuestion];

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
    onOpenChange(false);
    toast.success('Exam submitted successfully!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / examQuestions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{exam.title}</span>
            <div className="flex items-center gap-4">
              {violations > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {violations} violation{violations > 1 ? 's' : ''}
                </Badge>
              )}
              <Badge className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {isTabActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {examQuestions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {!isTabActive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Warning: Please return to the exam</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                You have switched tabs or minimized the window. This behavior is being monitored.
              </p>
            </div>
          )}

          {currentQ && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {currentQ.content}
                  <Badge className="ml-2" variant="outline">{currentQ.points} points</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentQ.type === 'single-choice' && currentQ.options && (
                  <RadioGroup
                    value={answers[currentQ.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  >
                    {currentQ.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQ.type === 'multiple-choice' && currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`option-${index}`}
                          checked={(answers[currentQ.id] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentAnswers = answers[currentQ.id] || [];
                            if (checked) {
                              handleAnswerChange(currentQ.id, [...currentAnswers, option]);
                            } else {
                              handleAnswerChange(currentQ.id, currentAnswers.filter((a: string) => a !== option));
                            }
                          }}
                        />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {(currentQ.type === 'short-answer' || currentQ.type === 'fill-blank') && (
                  <Textarea
                    placeholder="Enter your answer..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentQuestion < examQuestions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

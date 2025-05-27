
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/services/api';

interface QuestionDialogProps {
  question: Question | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function QuestionDialog({ question, open, onOpenChange, onEdit, onDelete }: QuestionDialogProps) {
  if (!question) return null;

  const renderAnswer = () => {
    if (question.type === 'single-choice' || question.type === 'multiple-choice') {
      if (Array.isArray(question.correct_answer)) {
        return question.correct_answer.map((answer, index) => (
          <Badge key={index} className="mr-2">{answer}</Badge>
        ));
      } else {
        return <Badge>{question.correct_answer}</Badge>;
      }
    }
    return <span className="font-medium">{question.correct_answer}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{question.content}</DialogTitle>
              <DialogDescription className="mt-2">
                <Badge variant="outline" className="mr-2">{question.type}</Badge>
                <Badge variant="secondary" className="mr-2">{question.category}</Badge>
                <Badge>{question.points} point{question.points !== 1 ? 's' : ''}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {question.options && question.options.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Options:</h4>
              <ul className="list-disc list-inside space-y-1">
                {question.options.map((option, index) => (
                  <li key={index} className="text-gray-700">{option}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Correct Answer:</h4>
            <div className="flex flex-wrap gap-2">
              {renderAnswer()}
            </div>
          </div>

          {question.created_at && (
            <div className="text-sm text-gray-500">
              Created: {new Date(question.created_at).toLocaleDateString()}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

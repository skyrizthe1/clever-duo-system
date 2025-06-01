
import React from 'react';
import { Question } from '@/services/api';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type QuestionDialogProps = {
  question: Question;
};

export function QuestionDialog({ question }: QuestionDialogProps) {
  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <div className="flex items-center justify-between mb-2">
          <DialogTitle>Question Preview</DialogTitle>
          <Badge>
            {question.type === 'single-choice' ? 'Single Choice' :
             question.type === 'multiple-choice' ? 'Multiple Choice' :
             question.type === 'fill-blank' ? 'Fill in Blank' : 'Short Answer'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Category: {question.category} | Points: {question.points}
        </div>
      </DialogHeader>

      <div className="py-4">
        <div className="mb-6">
          <h3 className="font-medium mb-2">Question:</h3>
          <p className="bg-secondary/50 p-3 rounded-md">{question.content}</p>
        </div>

        {(question.type === 'single-choice' || question.type === 'multiple-choice') && question.options && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Options:</h3>
            <div className="space-y-2">
              {question.options.map((option, index) => {
                const isCorrect = Array.isArray(question.correctAnswer) 
                  ? question.correctAnswer.includes(option) 
                  : question.correctAnswer === option;
                
                return (
                  <div 
                    key={index} 
                    className={`p-3 rounded-md ${isCorrect ? 'bg-green-100 border-green-400' : 'bg-muted'}`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{index + 1}.</span>
                      <span>{option}</span>
                      {isCorrect && (
                        <Badge className="ml-auto" variant="outline">Correct Answer</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(question.type === 'fill-blank' || question.type === 'short-answer') && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Answer Key:</h3>
            <p className="bg-green-100 p-3 rounded-md border border-green-400">
              {Array.isArray(question.correctAnswer) 
                ? question.correctAnswer.join(', ') 
                : question.correctAnswer}
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={() => {}}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
}

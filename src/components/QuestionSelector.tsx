
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Check } from 'lucide-react';
import { Question } from '@/services/api';

interface QuestionSelectorProps {
  questions: Question[];
  selectedQuestions: string[];
  onQuestionsChange: (questionIds: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionSelector({ 
  questions, 
  selectedQuestions, 
  onQuestionsChange, 
  open, 
  onOpenChange 
}: QuestionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const filteredQuestions = questions.filter(q => {
    let matches = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter && q.type !== filter) {
      matches = false;
    }
    return matches;
  });

  const toggleQuestion = (questionId: string) => {
    const isSelected = selectedQuestions.includes(questionId);
    if (isSelected) {
      onQuestionsChange(selectedQuestions.filter(id => id !== questionId));
    } else {
      onQuestionsChange([...selectedQuestions, questionId]);
    }
  };

  const selectAll = () => {
    onQuestionsChange(filteredQuestions.map(q => q.id));
  };

  const clearAll = () => {
    onQuestionsChange([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Questions for Exam</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All ({filteredQuestions.length})
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredQuestions.map((question) => (
            <Card 
              key={question.id} 
              className={`cursor-pointer transition-colors ${
                selectedQuestions.includes(question.id) 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleQuestion(question.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        question.type === 'single-choice' ? 'default' :
                        question.type === 'multiple-choice' ? 'secondary' :
                        question.type === 'fill-blank' ? 'outline' : 'destructive'
                      }>
                        {question.type === 'single-choice' ? 'Single Choice' :
                         question.type === 'multiple-choice' ? 'Multiple Choice' :
                         question.type === 'fill-blank' ? 'Fill in Blank' : 'Short Answer'}
                      </Badge>
                      <Badge variant="outline">{question.points} pts</Badge>
                      <Badge variant="outline">{question.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      {question.content.length > 100 
                        ? `${question.content.substring(0, 100)}...` 
                        : question.content}
                    </p>
                  </div>
                  <div className="ml-4">
                    {selectedQuestions.includes(question.id) && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Selected: {selectedQuestions.length} questions
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

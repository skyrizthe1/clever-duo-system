
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuestions, Question } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, Plus, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface QuestionSelectorProps {
  selectedQuestions: string[];
  onSelectionChange: (questionIds: string[]) => void;
}

export function QuestionSelector({ selectedQuestions, onSelectionChange }: QuestionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });

  const filteredQuestions = questions.filter(q => {
    let matches = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter && q.type !== filter) {
      matches = false;
    }
    return matches;
  });

  const selectedQuestionsData = questions.filter(q => selectedQuestions.includes(q.id));

  const handleQuestionToggle = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      onSelectionChange(selectedQuestions.filter(id => id !== questionId));
    } else {
      onSelectionChange([...selectedQuestions, questionId]);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    onSelectionChange(selectedQuestions.filter(id => id !== questionId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Selected Questions ({selectedQuestions.length})</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Questions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Questions from Question Bank</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={filter || ''}
                  onChange={(e) => setFilter(e.target.value || null)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="single-choice">Single Choice</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="fill-blank">Fill in Blank</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                {filteredQuestions.map((question) => (
                  <Card key={question.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => handleQuestionToggle(question.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {question.type === 'single-choice' ? 'Single Choice' :
                             question.type === 'multiple-choice' ? 'Multiple Choice' :
                             question.type === 'fill-blank' ? 'Fill in Blank' : 'Short Answer'}
                          </Badge>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </div>
                        <p className="text-sm font-medium">{question.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">Category: {question.category}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsOpen(false)}>Done</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedQuestionsData.length > 0 ? (
        <div className="space-y-2">
          {selectedQuestionsData.map((question) => (
            <Card key={question.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {question.type === 'single-choice' ? 'Single Choice' :
                       question.type === 'multiple-choice' ? 'Multiple Choice' :
                       question.type === 'fill-blank' ? 'Fill in Blank' : 'Short Answer'}
                    </Badge>
                    <Badge variant="outline">{question.points} pts</Badge>
                  </div>
                  <p className="text-sm font-medium">{question.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveQuestion(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No questions selected</p>
          <p className="text-sm text-gray-500">Click "Add Questions" to select from the question bank</p>
        </div>
      )}
    </div>
  );
}

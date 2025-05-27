
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Question, QuestionType } from '@/services/api';

const questionSchema = z.object({
  type: z.enum(['single-choice', 'multiple-choice', 'fill-blank', 'short-answer']),
  content: z.string().min(10, 'Question content must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  points: z.number().min(1, 'Points must be at least 1'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  onSubmit: (question: Omit<Question, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => void;
  initialData?: Question;
  onCancel?: () => void;
}

export function QuestionForm({ onSubmit, initialData, onCancel }: QuestionFormProps) {
  const [options, setOptions] = useState<string[]>(initialData?.options || []);
  const [newOption, setNewOption] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(
    Array.isArray(initialData?.correct_answer) 
      ? initialData.correct_answer 
      : initialData?.correct_answer ? [initialData.correct_answer as string] : []
  );

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: initialData?.type || 'single-choice',
      content: initialData?.content || '',
      category: initialData?.category || '',
      points: initialData?.points || 1,
    },
  });

  const questionType = form.watch('type');

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // Remove from correct answers if it was selected
    const removedOption = options[index];
    setCorrectAnswers(correctAnswers.filter(answer => answer !== removedOption));
  };

  const toggleCorrectAnswer = (option: string) => {
    if (questionType === 'single-choice') {
      setCorrectAnswers([option]);
    } else if (questionType === 'multiple-choice') {
      if (correctAnswers.includes(option)) {
        setCorrectAnswers(correctAnswers.filter(answer => answer !== option));
      } else {
        setCorrectAnswers([...correctAnswers, option]);
      }
    }
  };

  const handleSubmit = (data: QuestionFormData) => {
    let correct_answer: string | string[];
    
    if (data.type === 'single-choice') {
      correct_answer = correctAnswers[0] || '';
    } else if (data.type === 'multiple-choice') {
      correct_answer = correctAnswers;
    } else {
      correct_answer = correctAnswers[0] || '';
    }

    onSubmit({
      ...data,
      options: (data.type === 'single-choice' || data.type === 'multiple-choice') ? options : undefined,
      correct_answer,
    });
  };

  const needsOptions = questionType === 'single-choice' || questionType === 'multiple-choice';

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Question Type</Label>
            <Select 
              value={form.watch('type')} 
              onValueChange={(value: QuestionType) => {
                form.setValue('type', value);
                setOptions([]);
                setCorrectAnswers([]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single-choice">Single Choice</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input {...form.register('category')} placeholder="e.g., Mathematics, Science" />
            {form.formState.errors.category && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="content">Question Content</Label>
          <Textarea 
            {...form.register('content')} 
            placeholder="Enter your question here..."
            rows={3}
          />
          {form.formState.errors.content && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="points">Points</Label>
          <Input 
            type="number" 
            {...form.register('points', { valueAsNumber: true })} 
            min="1" 
            max="100"
          />
          {form.formState.errors.points && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.points.message}</p>
          )}
        </div>

        {needsOptions && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add an option..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                />
                <Button type="button" onClick={addOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1">{option}</span>
                    <Button
                      type="button"
                      variant={correctAnswers.includes(option) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCorrectAnswer(option)}
                    >
                      {correctAnswers.includes(option) ? 'Correct' : 'Mark Correct'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!needsOptions && (
          <div>
            <Label htmlFor="correct-answer">Correct Answer</Label>
            <Input
              value={correctAnswers[0] || ''}
              onChange={(e) => setCorrectAnswers([e.target.value])}
              placeholder="Enter the correct answer..."
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Update Question' : 'Create Question'}
          </Button>
        </div>
      </form>
    </div>
  );
}

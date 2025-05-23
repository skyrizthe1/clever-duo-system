
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Question } from '@/services/api';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';

const questionSchema = z.object({
  content: z.string().min(5, 'Question content is required and must be at least 5 characters'),
  type: z.enum(['single-choice', 'multiple-choice', 'fill-blank', 'short-answer']),
  points: z.coerce.number().min(1, 'Points must be at least 1'),
  category: z.string().min(1, 'Category is required'),
});

type QuestionFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Question;
  isEditing?: boolean;
};

export function QuestionForm({ onSubmit, onCancel, initialData, isEditing = false }: QuestionFormProps) {
  const [options, setOptions] = useState<string[]>(initialData?.options || []);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(
    Array.isArray(initialData?.correctAnswer) 
      ? initialData?.correctAnswer 
      : initialData?.correctAnswer 
        ? [initialData.correctAnswer] 
        : []
  );
  const [newOption, setNewOption] = useState('');
  
  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: initialData?.content || '',
      type: initialData?.type || 'single-choice',
      points: initialData?.points || 1,
      category: initialData?.category || '',
    },
  });
  
  const questionType = form.watch('type');

  // Reset options when question type changes
  useEffect(() => {
    if (questionType === 'short-answer' || questionType === 'fill-blank') {
      setOptions([]);
    }
  }, [questionType]);
  
  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };
  
  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    
    // Also remove from correct answers if it's there
    setCorrectAnswers(correctAnswers.filter(ca => ca !== options[index]));
  };
  
  const toggleCorrectAnswer = (option: string) => {
    if (questionType === 'single-choice') {
      setCorrectAnswers([option]);
    } else {
      if (correctAnswers.includes(option)) {
        setCorrectAnswers(correctAnswers.filter(ca => ca !== option));
      } else {
        setCorrectAnswers([...correctAnswers, option]);
      }
    }
  };
  
  const handleSubmit = (values: z.infer<typeof questionSchema>) => {
    if ((questionType === 'single-choice' || questionType === 'multiple-choice') && 
        (options.length < 2 || correctAnswers.length === 0)) {
      form.setError('type', { 
        message: 'Multiple choice questions must have at least 2 options and 1 correct answer' 
      });
      return;
    }
    
    const finalData = {
      ...values,
      options: (questionType === 'single-choice' || questionType === 'multiple-choice') ? options : undefined,
      correctAnswer: questionType === 'multiple-choice' ? correctAnswers : correctAnswers[0] || '',
      createdBy: initialData?.createdBy || 'current-user-id', // In a real app, this would be the current user's ID
    };
    
    onSubmit(finalData);
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Question' : 'Create New Question'}</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? 'Make changes to this question.' 
            : 'Add a new question to your question bank.'}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single-choice">Single Choice</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter your question here..."
                    {...field}
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {(questionType === 'single-choice' || questionType === 'multiple-choice') && (
            <div className="space-y-2">
              <FormLabel>Options</FormLabel>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add an option..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddOption} size="sm">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              
              <div className="space-y-2 mt-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                    <input 
                      type={questionType === 'single-choice' ? 'radio' : 'checkbox'}
                      checked={correctAnswers.includes(option)}
                      onChange={() => toggleCorrectAnswer(option)}
                      className="h-4 w-4"
                    />
                    <span className="flex-1">{option}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {options.length === 0 && (
                  <p className="text-sm text-muted-foreground">No options added yet.</p>
                )}
              </div>
            </div>
          )}
          
          {(questionType === 'fill-blank' || questionType === 'short-answer') && (
            <FormItem>
              <FormLabel>Correct Answer</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the correct answer..."
                  value={correctAnswers[0] || ''}
                  onChange={(e) => setCorrectAnswers([e.target.value])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mathematics, Science, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1" 
                      {...field} 
                      min={1}
                      max={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Create'} Question
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

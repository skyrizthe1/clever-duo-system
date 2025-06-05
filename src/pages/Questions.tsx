
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { createQuestion, deleteQuestion, getQuestions, Question, updateQuestion } from '@/services/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionForm } from '@/components/QuestionForm';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { QuestionDialog } from '@/components/QuestionDialog';
import { Dialog } from '@/components/ui/dialog';
import { ExcelImportExport } from '@/components/ExcelImportExport';

const Questions = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });
  
  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question created successfully');
      setIsFormDialogOpen(false);
    },
    onError: (error) => {
      console.error('Create question error:', error);
      toast.error('Failed to create question');
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Question> }) => 
      updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question updated successfully');
      setIsFormDialogOpen(false);
    },
    onError: (error) => {
      console.error('Update question error:', error);
      toast.error('Failed to update question');
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question deleted successfully');
    },
    onError: (error) => {
      console.error('Delete question error:', error);
      toast.error('Failed to delete question');
    }
  });
  
  const handleCreateQuestion = (data: Omit<Question, 'id'>) => {
    createMutation.mutate(data);
  };
  
  const handleUpdateQuestion = (data: Partial<Question>) => {
    if (selectedQuestion) {
      updateMutation.mutate({ id: selectedQuestion.id, data });
    }
  };
  
  const handleDeleteQuestion = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  const openQuestionDialog = (question: Question) => {
    setSelectedQuestion(question);
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (question: Question) => {
    setSelectedQuestion(question);
    setIsFormDialogOpen(true);
  };
  
  const handleCreateNewQuestion = () => {
    setSelectedQuestion(null);
    setIsFormDialogOpen(true);
  };
  
  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['questions'] });
  };
  
  const filteredQuestions = questions.filter(q => {
    let matches = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter && q.type !== filter) {
      matches = false;
    }
    return matches;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Question Management</h1>
          <div className="flex gap-2">
            <Button onClick={handleCreateNewQuestion}>
              <Plus className="mr-2 h-4 w-4" /> New Question
            </Button>
            <ExcelImportExport 
              onImportSuccess={handleImportSuccess}
              questions={questions}
            />
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Question Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter(null)}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('single-choice')}>
                Single Choice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('multiple-choice')}>
                Multiple Choice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('fill-blank')}>
                Fill in the Blank
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('short-answer')}>
                Short Answer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-10">
            <p>Loading questions...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
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
                  </div>
                  <CardTitle className="text-md mt-2">{question.content.length > 60 ? `${question.content.substring(0, 60)}...` : question.content}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  {question.type !== 'short-answer' && question.options && (
                    <div className="text-sm text-muted-foreground">
                      <p>Options: {question.options.length}</p>
                    </div>
                  )}
                  <div className="text-sm mt-1">
                    <span className="font-semibold">Category:</span> {question.category}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <Button variant="ghost" size="sm" onClick={() => openQuestionDialog(question)}>
                    Preview
                  </Button>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(question)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteQuestion(question.id)}>
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-muted rounded-md">
            <p className="text-xl mb-2">No questions found</p>
            <p className="text-muted-foreground mb-4">
              {filter ? 'No questions match your filter criteria.' : 'Add your first question to get started.'}
            </p>
            <Button onClick={handleCreateNewQuestion}>Create Question</Button>
          </div>
        )}
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedQuestion && (
          <QuestionDialog question={selectedQuestion} />
        )}
      </Dialog>
      
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <QuestionForm 
          onSubmit={selectedQuestion ? handleUpdateQuestion : handleCreateQuestion}
          initialData={selectedQuestion || undefined}
          onCancel={() => setIsFormDialogOpen(false)}
          isEditing={!!selectedQuestion}
        />
      </Dialog>
    </div>
  );
};

export default Questions;

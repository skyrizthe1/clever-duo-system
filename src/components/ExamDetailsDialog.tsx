
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, User } from 'lucide-react';
import { Exam, Question } from '@/services/api';
import { QuestionSelector } from './QuestionSelector';

interface ExamDetailsDialogProps {
  exam: Exam | null;
  questions?: Question[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartExam?: () => void;
  isCreating?: boolean;
  isEditing?: boolean;
  onCreateExam?: (examData: any) => void;
  onUpdateExam?: (examData: any) => void;
  onCloseCreate?: () => void;
  onCloseEdit?: () => void;
  editingExam?: any;
}

export function ExamDetailsDialog({ 
  exam, 
  questions = [],
  open, 
  onOpenChange, 
  onStartExam,
  isCreating = false,
  isEditing = false,
  onCreateExam,
  onUpdateExam,
  onCloseCreate,
  onCloseEdit,
  editingExam
}: ExamDetailsDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    start_time: '',
    end_time: '',
    published: false,
    questions: [] as string[]
  });

  // Initialize form data when editing or creating
  React.useEffect(() => {
    if (isEditing && editingExam) {
      setFormData({
        title: editingExam.title || '',
        description: editingExam.description || '',
        duration: editingExam.duration || 60,
        start_time: editingExam.start_time ? new Date(editingExam.start_time).toISOString().slice(0, 16) : '',
        end_time: editingExam.end_time ? new Date(editingExam.end_time).toISOString().slice(0, 16) : '',
        published: editingExam.published || false,
        questions: editingExam.questions || []
      });
    } else if (isCreating) {
      setFormData({
        title: '',
        description: '',
        duration: 60,
        start_time: '',
        end_time: '',
        published: false,
        questions: []
      });
    }
  }, [isEditing, editingExam, isCreating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      alert('Please select at least one question for the exam.');
      return;
    }
    
    if (isCreating && onCreateExam) {
      onCreateExam(formData);
    } else if (isEditing && onUpdateExam) {
      onUpdateExam(formData);
    }
  };

  const handleClose = () => {
    if (isCreating && onCloseCreate) {
      onCloseCreate();
    } else if (isEditing && onCloseEdit) {
      onCloseEdit();
    } else {
      onOpenChange(false);
    }
  };

  const handleQuestionSelectionChange = (questionIds: string[]) => {
    setFormData(prev => ({ ...prev, questions: questionIds }));
  };

  // If we're creating or editing, show the form
  if (isCreating || isEditing) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Exam' : 'Edit Exam'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Fill in the details to create a new exam.' : 'Update the exam details.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div>
              <QuestionSelector
                selectedQuestions={formData.questions}
                onSelectionChange={handleQuestionSelectionChange}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isCreating ? 'Create Exam' : 'Update Exam'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Show exam details view
  if (!exam) return null;

  const now = new Date();
  const isOngoing = new Date(exam.start_time) <= now && new Date(exam.end_time) >= now;
  const isUpcoming = new Date(exam.start_time) > now;
  const isCompleted = new Date(exam.end_time) < now;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{exam.title}</DialogTitle>
          <DialogDescription>
            {exam.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {isOngoing && <Badge className="bg-green-100 text-green-800">Live Now</Badge>}
            {isUpcoming && <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>}
            {isCompleted && <Badge className="bg-gray-100 text-gray-800">Completed</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Start Time</p>
                <p className="text-blue-700">{new Date(exam.start_time).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">End Time</p>
                <p className="text-green-700">{new Date(exam.end_time).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Duration</p>
                <p className="text-purple-700">{exam.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Questions</p>
                <p className="text-orange-700">{exam.questions.length} questions</p>
              </div>
            </div>
          </div>

          {isOngoing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Exam Instructions</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Make sure you have a stable internet connection</li>
                <li>• Do not switch tabs or leave the exam window</li>
                <li>• You will be warned if you attempt to switch tabs</li>
                <li>• Submit your answers before the time runs out</li>
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isOngoing && onStartExam && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  onStartExam();
                  onOpenChange(false);
                }}
              >
                Start Exam
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

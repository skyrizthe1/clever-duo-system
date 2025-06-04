import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

interface ExamDetailsDialogProps {
  exam: any;
  questions: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCreating: boolean;
  isEditing: boolean;
  onCreateExam: (examData: any) => void;
  onUpdateExam: (examData: any) => void;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  editingExam: any;
}

export const ExamDetailsDialog: React.FC<ExamDetailsDialogProps> = ({
  exam,
  questions,
  open,
  onOpenChange,
  isCreating,
  isEditing,
  onCreateExam,
  onUpdateExam,
  onCloseCreate,
  onCloseEdit,
  editingExam
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [published, setPublished] = useState<boolean>(false);

  useEffect(() => {
    if (exam) {
      setTitle(exam.title || '');
      setDescription(exam.description || '');
      setDuration(exam.duration || 60);
      setStartTime(exam.start_time ? new Date(exam.start_time) : undefined);
      setEndTime(exam.end_time ? new Date(exam.end_time) : undefined);
      setSelectedQuestions(exam.questions || []);
      setPublished(exam.published || false);
    } else {
      setTitle('');
      setDescription('');
      setDuration(60);
      setStartTime(undefined);
      setEndTime(undefined);
      setSelectedQuestions([]);
      setPublished(false);
    }
  }, [exam]);

  const handleSubmit = () => {
    const examData = {
      title,
      description,
      duration,
      start_time: startTime,
      end_time: endTime,
      questions: selectedQuestions,
      published,
    };

    if (isCreating) {
      onCreateExam(examData);
      onOpenChange(false);
      onCloseCreate();
    } else if (isEditing) {
      onUpdateExam(examData);
      onOpenChange(false);
      onCloseEdit();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (isCreating) {
      onCloseCreate();
    } else if (isEditing) {
      onCloseEdit();
    }
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions((prevSelected) => {
      if (prevSelected.includes(questionId)) {
        return prevSelected.filter((id) => id !== questionId);
      } else {
        return [...prevSelected, questionId];
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%]">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Create Exam' : isEditing ? 'Edit Exam' : 'Exam Details'}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Create a new exam by filling out the details below.'
              : isEditing
                ? 'Edit the exam details below. Click save when you\'re done.'
                : 'View exam details.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={!isCreating && !isEditing}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              disabled={!isCreating && !isEditing}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              value={String(duration)}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="col-span-3"
              disabled={!isCreating && !isEditing}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_time" className="text-right">
              Start Time
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 flex justify-start text-left font-normal",
                    !startTime && "text-muted-foreground"
                  )}
                  disabled={!isCreating && !isEditing}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startTime ? format(startTime, "PPP p") : <span>Pick a date and time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startTime}
                  onSelect={setStartTime}
                  disabled={(!isCreating && !isEditing) || undefined}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_time" className="text-right">
              End Time
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 flex justify-start text-left font-normal",
                    !endTime && "text-muted-foreground"
                  )}
                  disabled={!isCreating && !isEditing}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endTime ? format(endTime, "PPP p") : <span>Pick a date and time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endTime}
                  onSelect={setEndTime}
                  disabled={(!isCreating && !isEditing) || undefined}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2">Questions</Label>
            <div className="col-span-3 space-y-2">
              <p className="text-sm text-muted-foreground">Select questions for the exam:</p>
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <ScrollArea className="h-[200px] w-full rounded-md border">
                    <div className="p-4">
                      {questions.map((question) => (
                        <div key={question.id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`question-${question.id}`}
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => handleQuestionSelect(question.id)}
                            disabled={!isCreating && !isEditing}
                          />
                          <Label htmlFor={`question-${question.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {question.content.length > 50 ? `${question.content.substring(0, 50)}...` : question.content}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {(isCreating || isEditing) && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="published" className="text-right">
                Publish
              </Label>
              <div className="col-span-3 flex items-center">
                <Checkbox
                  id="published"
                  checked={published}
                  onCheckedChange={(checked) => setPublished(!!checked)}
                  disabled={!isCreating && !isEditing}
                />
                <Label htmlFor="published" className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Make this exam public
                </Label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {(isCreating || isEditing) && (
            <Button type="submit" onClick={handleSubmit}>
              {isCreating ? 'Create' : 'Update'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

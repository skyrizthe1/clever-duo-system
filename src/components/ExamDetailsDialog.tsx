
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, User } from 'lucide-react';
import { Exam } from '@/services/api';

interface ExamDetailsDialogProps {
  exam: Exam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamDetailsDialog({ exam, open, onOpenChange }: ExamDetailsDialogProps) {
  if (!exam) return null;

  const now = new Date();
  const isOngoing = new Date(exam.startTime) <= now && new Date(exam.endTime) >= now;
  const isUpcoming = new Date(exam.startTime) > now;
  const isCompleted = new Date(exam.endTime) < now;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{exam.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {isOngoing && <Badge className="bg-green-100 text-green-800">Live Now</Badge>}
            {isUpcoming && <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>}
            {isCompleted && <Badge className="bg-gray-100 text-gray-800">Completed</Badge>}
          </div>

          <p className="text-gray-600 text-lg">{exam.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Start Time</p>
                <p className="text-blue-700">{new Date(exam.startTime).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">End Time</p>
                <p className="text-green-700">{new Date(exam.endTime).toLocaleString()}</p>
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
            {isOngoing && (
              <Button className="bg-green-600 hover:bg-green-700">
                Start Exam
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

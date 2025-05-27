
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, Clock, User } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/services/api';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onStatusChange && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
                    Mark as To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'inprogress')}>
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'review')}>
                    Mark as Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>
                    Mark as Done
                  </DropdownMenuItem>
                </>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {task.description && (
          <p className="text-gray-600 mb-3">{task.description}</p>
        )}
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {formatDate(task.created_at)}</span>
          </div>
          
          {task.due_date && (
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${isOverdue ? 'text-red-500' : ''}`} />
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                Due: {formatDate(task.due_date)}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}
          
          {task.assigned_to && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Assigned to: {task.assigned_to}</span>
            </div>
          )}
        </div>
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

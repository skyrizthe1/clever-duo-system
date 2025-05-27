
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, updateTask, deleteTask } from '@/services/api';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    await deleteTask(task.id);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleStatusChange = async (status: Task['status']) => {
    await updateTask(task.id, { status });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  // Map status to color
  const getStatusColor = () => {
    switch (task.status) {
      case 'todo': return 'bg-task-todo';
      case 'inprogress': return 'bg-task-inprogress';
      case 'review': return 'bg-task-review';
      case 'done': return 'bg-task-done';
      default: return 'bg-gray-500';
    }
  };

  // Map priority to color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'low': return 'bg-priority-low text-gray-800';
      case 'medium': return 'bg-priority-medium text-gray-800';
      case 'high': return 'bg-priority-high text-gray-800';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusLabel = () => {
    switch (task.status) {
      case 'todo': return 'To Do';
      case 'inprogress': return 'In Progress';
      case 'review': return 'In Review';
      case 'done': return 'Done';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="w-full h-full animate-fade-in">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <h3 className="font-semibold text-md line-clamp-1">{task.title}</h3>
          </div>
          <Badge className={`mt-2 ${getPriorityColor()}`} variant="outline">
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {task.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            Due: {format(task.dueDate, 'MMM d, yyyy')}
          </div>
        )}
        
        <div className="w-full mt-3 border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">{getStatusLabel()}</span>
            <select
              className="text-xs border px-1 py-0.5 rounded bg-transparent"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

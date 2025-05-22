
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task, TaskStatus, createTask, getTasks, updateTask } from '@/services/api';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Filter, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  // Handle creating a new task
  const handleCreateTask = async (data: any) => {
    await createTask({
      ...data,
      assignedTo: undefined,
    });
    setIsFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  // Handle updating a task
  const handleUpdateTask = async (data: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  };

  // Open edit form
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === null || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: [],
    inprogress: [],
    review: [],
    done: []
  };

  filteredTasks.forEach(task => {
    tasksByStatus[task.status].push(task);
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground flex items-center">
            <Filter className="mr-1 h-4 w-4" />
            Status:
          </span>
          <Tabs 
            defaultValue={filterStatus || "all"}
            onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="inprogress">In Progress</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-1 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Task boards */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* To Do Column */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-task-todo mr-2"></div>
              <h3 className="font-semibold">To Do</h3>
              <span className="text-xs bg-muted ml-2 px-2 py-1 rounded-full">
                {tasksByStatus.todo.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.todo.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))}
              {tasksByStatus.todo.length === 0 && (
                <div className="text-center py-6 px-4 border border-dashed rounded-lg text-muted-foreground text-sm">
                  No tasks to do
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-task-inprogress mr-2"></div>
              <h3 className="font-semibold">In Progress</h3>
              <span className="text-xs bg-muted ml-2 px-2 py-1 rounded-full">
                {tasksByStatus.inprogress.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.inprogress.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))}
              {tasksByStatus.inprogress.length === 0 && (
                <div className="text-center py-6 px-4 border border-dashed rounded-lg text-muted-foreground text-sm">
                  No tasks in progress
                </div>
              )}
            </div>
          </div>
          
          {/* Review Column */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-task-review mr-2"></div>
              <h3 className="font-semibold">In Review</h3>
              <span className="text-xs bg-muted ml-2 px-2 py-1 rounded-full">
                {tasksByStatus.review.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.review.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))}
              {tasksByStatus.review.length === 0 && (
                <div className="text-center py-6 px-4 border border-dashed rounded-lg text-muted-foreground text-sm">
                  No tasks in review
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-task-done mr-2"></div>
              <h3 className="font-semibold">Done</h3>
              <span className="text-xs bg-muted ml-2 px-2 py-1 rounded-full">
                {tasksByStatus.done.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.done.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))}
              {tasksByStatus.done.length === 0 && (
                <div className="text-center py-6 px-4 border border-dashed rounded-lg text-muted-foreground text-sm">
                  No completed tasks
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task forms */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateTask}
      />
      
      {editingTask && (
        <TaskForm
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSubmit={handleUpdateTask}
          defaultValues={editingTask}
          isEditing
        />
      )}
    </div>
  );
}

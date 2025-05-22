
// Mock API service that simulates backend functionality
import { toast } from "sonner";

// Types
export type TaskStatus = "todo" | "inprogress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  dueDate?: Date;
  tags: string[];
  assignedTo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Mock backend data
let tasks: Task[] = [
  {
    id: "1",
    title: "Create user authentication system",
    description: "Implement login, signup, and password reset functionality",
    status: "todo",
    priority: "high",
    createdAt: new Date(2025, 4, 15),
    dueDate: new Date(2025, 5, 1),
    tags: ["authentication", "security"]
  },
  {
    id: "2",
    title: "Design dashboard layout",
    description: "Create wireframes and implement responsive dashboard",
    status: "inprogress",
    priority: "medium",
    createdAt: new Date(2025, 4, 10),
    dueDate: new Date(2025, 4, 25),
    tags: ["design", "frontend"]
  },
  {
    id: "3",
    title: "Implement task filtering",
    description: "Add ability to filter tasks by status, priority, and tags",
    status: "review",
    priority: "medium",
    createdAt: new Date(2025, 4, 5),
    tags: ["frontend", "filters"]
  },
  {
    id: "4",
    title: "Set up database schema",
    description: "Design and implement database schema for tasks and users",
    status: "done",
    priority: "high",
    createdAt: new Date(2025, 4, 1),
    tags: ["database", "backend"]
  }
];

let users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com"
  }
];

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export async function getTasks(): Promise<Task[]> {
  await delay(500); // Simulate network delay
  return [...tasks];
}

export async function getUsers(): Promise<User[]> {
  await delay(300);
  return [...users];
}

export async function createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
  await delay(500);
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  
  tasks = [...tasks, newTask];
  toast.success("Task created successfully");
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  await delay(400);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    toast.error("Task not found");
    throw new Error("Task not found");
  }
  
  const updatedTask = { ...tasks[taskIndex], ...updates };
  tasks = [...tasks.slice(0, taskIndex), updatedTask, ...tasks.slice(taskIndex + 1)];
  
  toast.success("Task updated successfully");
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  await delay(400);
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    toast.error("Task not found");
    throw new Error("Task not found");
  }
  
  tasks = [...tasks.slice(0, taskIndex), ...tasks.slice(taskIndex + 1)];
  toast.success("Task deleted successfully");
}

// Authentication mock
let currentUser: User | null = users[0]; // Auto logged in for demo

export async function login(email: string, password: string): Promise<User> {
  await delay(800);
  const user = users.find(u => u.email === email);
  
  if (!user) {
    toast.error("Invalid credentials");
    throw new Error("Invalid credentials");
  }
  
  // In a real app, we would validate the password here
  currentUser = user;
  toast.success(`Welcome back, ${user.name}!`);
  return user;
}

export async function logout(): Promise<void> {
  await delay(300);
  currentUser = null;
  toast.info("Logged out successfully");
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(300);
  return currentUser;
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, logout } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, MessageSquare, BookOpen, BarChart3 } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              ExamPortal
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/forum" 
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Forum</span>
              </Link>
              <Link 
                to="/chat" 
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Link>
              {currentUser.role === 'student' && (
                <>
                  <Link 
                    to="/my-exams" 
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>My Exams</span>
                  </Link>
                  <Link 
                    to="/results" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Results
                  </Link>
                </>
              )}
              {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                <>
                  <Link 
                    to="/exams" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Exams
                  </Link>
                  <Link 
                    to="/questions" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Questions
                  </Link>
                  <Link 
                    to="/grading" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Grading
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                    {currentUser.slogan && (
                      <p className="text-xs text-muted-foreground italic">
                        "{currentUser.slogan}"
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

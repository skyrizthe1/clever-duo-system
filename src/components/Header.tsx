
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, getCurrentUser, logout } from '@/services/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function Header() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">E</span>
          </div>
          <h1 className="text-xl font-bold">Exam Portal</h1>
        </div>
        
        {currentUser && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary">Dashboard</Link>
            
            {/* Admin and Teacher Navigation */}
            {(currentUser.role === 'admin' || currentUser.role === 'teacher') && (
              <>
                <Link to="/questions" className="text-gray-700 hover:text-primary">Questions</Link>
                <Link to="/exams" className="text-gray-700 hover:text-primary">Exams</Link>
              </>
            )}
            
            {/* Admin-only Navigation */}
            {currentUser.role === 'admin' && (
              <Link to="/users" className="text-gray-700 hover:text-primary">Users</Link>
            )}
            
            {/* Student Navigation */}
            {currentUser.role === 'student' && (
              <Link to="/my-exams" className="text-gray-700 hover:text-primary">My Exams</Link>
            )}
          </nav>
        )}
        
        <div className="flex items-center gap-4">
          {currentUser && (
            <>
              <span className="hidden md:inline-block text-sm text-muted-foreground">
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {currentUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                    </div>
                  </div>
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

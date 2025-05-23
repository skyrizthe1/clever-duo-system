
import React from 'react';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getExams, getCurrentUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const MyExams = () => {
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });
  
  // Only published exams are visible to students
  const publishedExams = exams.filter(exam => exam.published);
  
  // Sort exams by start time
  const sortedExams = [...publishedExams].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  const now = new Date();
  
  // Categorize exams
  const upcomingExams = sortedExams.filter(
    exam => new Date(exam.startTime) > now
  );
  
  const ongoingExams = sortedExams.filter(
    exam => new Date(exam.startTime) <= now && new Date(exam.endTime) >= now
  );
  
  const pastExams = sortedExams.filter(
    exam => new Date(exam.endTime) < now
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Exams</h1>
        
        {ongoingExams.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Ongoing Exams</h2>
            <div className="space-y-4">
              {ongoingExams.map((exam) => (
                <Card key={exam.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{exam.title}</CardTitle>
                      <Badge variant="outline" className="bg-green-100 text-green-800">Ongoing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{exam.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Time Remaining</p>
                        <p className="font-medium">
                          {Math.floor((new Date(exam.endTime).getTime() - now.getTime()) / (1000 * 60))} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Questions</p>
                        <p className="font-medium">{exam.questions.length}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Start Exam</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
        
        {upcomingExams.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Exams</h2>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{exam.title}</CardTitle>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">Upcoming</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{exam.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Starts</p>
                        <p>{new Date(exam.startTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p>{exam.duration} minutes</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
        
        {pastExams.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Completed Exams</h2>
            <div className="space-y-4">
              {pastExams.map((exam) => (
                <Card key={exam.id} className="opacity-80">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{exam.title}</CardTitle>
                      <Badge variant="outline" className="bg-gray-100">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p>{new Date(exam.startTime).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p>Not graded</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Results</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
        
        {!ongoingExams.length && !upcomingExams.length && !pastExams.length && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No exams found</h3>
            <p className="text-gray-500 mt-1">
              You don't have any exams assigned yet
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyExams;

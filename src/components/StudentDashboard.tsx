
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExams } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

export function StudentDashboard() {
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Exams</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingExams.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastExams.length}</div>
          </CardContent>
        </Card>
      </div>
      
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
            {upcomingExams.slice(0, 3).map((exam) => (
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
            {pastExams.slice(0, 2).map((exam) => (
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
    </div>
  );
}

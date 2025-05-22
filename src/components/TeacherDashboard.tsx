
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExams, getQuestions } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock } from 'lucide-react';

export function TeacherDashboard() {
  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });
  
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Manage Questions</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Exams</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Published: {exams.filter(e => e.published).length}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Manage Exams</Button>
          </CardFooter>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader>
            <CardTitle className="text-md">Create Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Add a new question to the question bank</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader>
            <CardTitle className="text-md">Create Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Schedule and set up a new examination</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader>
            <CardTitle className="text-md">Grade Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Review and grade pending exam submissions</p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Exams</h2>
      {exams.length > 0 ? (
        <div className="space-y-4">
          {exams.slice(0, 3).map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{exam.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p>{new Date(exam.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End</p>
                    <p>{new Date(exam.endTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p>{exam.duration} min</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">Edit</Button>
                {exam.published ? (
                  <Button variant="secondary" size="sm">Unpublish</Button>
                ) : (
                  <Button size="sm">Publish</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No exams scheduled yet.</p>
      )}
    </div>
  );
}

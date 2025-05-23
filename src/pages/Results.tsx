
import React from 'react';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getExams, getCurrentUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Results = () => {
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });
  
  // Filter to only get completed exams
  const now = new Date();
  const completedExams = exams.filter(exam => 
    exam.published && new Date(exam.endTime) < now
  );
  
  // Mock some results data since our API doesn't have real results yet
  const mockResults = completedExams.map(exam => ({
    examId: exam.id,
    examTitle: exam.title,
    score: Math.floor(Math.random() * 100),
    totalPoints: 100,
    completedDate: exam.endTime,
    status: Math.random() > 0.3 ? 'graded' : 'pending'
  }));
  
  // Stats for the charts
  const chartData = mockResults.map(result => ({
    name: result.examTitle.substring(0, 15) + (result.examTitle.length > 15 ? '...' : ''),
    score: result.score,
    average: 70 // Mock average score
  }));
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Results</h1>
        
        {mockResults.length > 0 ? (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" name="Your Score" />
                    <Bar dataKey="average" fill="#82ca9d" name="Class Average" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockResults.map((result) => (
                      <TableRow key={result.examId}>
                        <TableCell className="font-medium">{result.examTitle}</TableCell>
                        <TableCell>{new Date(result.completedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {result.status === 'graded' ? 
                            `${result.score}/${result.totalPoints}` : 
                            'Pending'
                          }
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.status === 'graded' ? 'Graded' : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No results yet</h3>
            <p className="text-gray-500 mt-1">
              You haven't completed any exams or none have been graded yet
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Results;

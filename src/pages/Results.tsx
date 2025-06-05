
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getExams, getCurrentUser, getExamSubmissions } from '@/services/api';
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
import { ExamResultsDialog } from '@/components/ExamResultsDialog';

const Results = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: getExamSubmissions
  });
  
  // Filter to only get completed exams with submissions
  const completedExamsWithResults = submissions.map(submission => {
    const exam = exams.find(e => e.id === submission.exam_id);
    return exam ? {
      ...exam,
      submission: submission,
      score: submission.score || 0,
      status: submission.graded ? 'graded' : 'pending'
    } : null;
  }).filter(Boolean);
  
  // Stats for the charts
  const chartData = completedExamsWithResults.map(result => ({
    name: result.title.substring(0, 15) + (result.title.length > 15 ? '...' : ''),
    score: result.score,
    average: 70 // Mock average score
  }));

  const handleViewDetails = (result) => {
    setSelectedExam(result);
    setSelectedSubmission(result.submission);
    setResultsOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Results</h1>
        
        {completedExamsWithResults.length > 0 ? (
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
                    {completedExamsWithResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.title}</TableCell>
                        <TableCell>{new Date(result.submission.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {result.status === 'graded' ? 
                            `${result.score}/${result.submission.total_points || 100}` : 
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
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(result)}>
                            View Details
                          </Button>
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

        <ExamResultsDialog
          exam={selectedExam}
          submission={selectedSubmission}
          open={resultsOpen}
          onOpenChange={setResultsOpen}
        />
      </main>
    </div>
  );
};

export default Results;

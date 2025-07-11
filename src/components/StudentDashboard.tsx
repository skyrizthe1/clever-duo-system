
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExams, getQuestions, getExamSubmissions } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { ExamDetailsDialog } from '@/components/ExamDetailsDialog';
import { ExamResultsDialog } from '@/components/ExamResultsDialog';
import { ExamTaking } from '@/components/ExamTaking';

export function StudentDashboard() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [examTakingOpen, setExamTakingOpen] = useState(false);

  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: getExams
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: getExamSubmissions
  });
  
  const publishedExams = exams.filter(exam => exam.published);
  const sortedExams = [...publishedExams].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  
  const now = new Date();
  
  // Check if exam has been submitted by current user
  const hasSubmission = (examId: string) => {
    return submissions.some(sub => sub.exam_id === examId);
  };
  
  const upcomingExams = sortedExams.filter(
    exam => new Date(exam.start_time) > now && !hasSubmission(exam.id)
  );
  
  const ongoingExams = sortedExams.filter(
    exam => new Date(exam.start_time) <= now && 
           new Date(exam.end_time) >= now && 
           !hasSubmission(exam.id)
  );
  
  const pastExams = sortedExams.filter(
    exam => (new Date(exam.end_time) < now || hasSubmission(exam.id))
  );

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setExamTakingOpen(true);
  };

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setDetailsOpen(true);
  };

  const handleViewResults = (exam) => {
    setSelectedExam(exam);
    setResultsOpen(true);
  };

  const handleExamSubmit = (answers) => {
    console.log('Exam submitted:', answers);
    // Here you would typically send the answers to the backend
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Exams</CardTitle>
            <AlertCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{ongoingExams.length}</div>
            <p className="text-xs text-green-600 mt-1">Available Now</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Upcoming Exams</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{upcomingExams.length}</div>
            <p className="text-xs text-blue-600 mt-1">Scheduled</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Completed Exams</CardTitle>
            <Award className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{pastExams.length}</div>
            <p className="text-xs text-purple-600 mt-1">Finished</p>
          </CardContent>
        </Card>
      </div>
      
      {ongoingExams.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Active Exams</h2>
          <div className="space-y-4">
            {ongoingExams.map((exam) => (
              <Card key={exam.id} className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-800">{exam.title}</CardTitle>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-3">{exam.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Time Remaining</p>
                        <p className="font-bold text-green-800">
                          {Math.floor((new Date(exam.end_time).getTime() - now.getTime()) / (1000 * 60))} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Questions</p>
                        <p className="font-bold text-green-800">{exam.questions.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => handleStartExam(exam)}
                  >
                    Start Exam
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {upcomingExams.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Upcoming Exams</h2>
          <div className="space-y-4">
            {upcomingExams.slice(0, 3).map((exam) => (
              <Card key={exam.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800">{exam.title}</CardTitle>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      <Calendar className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{exam.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Starts</p>
                        <p className="text-gray-700 font-medium">{new Date(exam.start_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Duration</p>
                        <p className="text-gray-700 font-medium">{exam.duration} minutes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                    onClick={() => handleViewDetails(exam)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {pastExams.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-6 bg-gradient-to-r from-purple-600 to-gray-600 bg-clip-text text-transparent">Completed Exams</h2>
          <div className="space-y-4">
            {pastExams.slice(0, 2).map((exam) => (
              <Card key={exam.id} className="bg-gray-50/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-700">{exam.title}</CardTitle>
                    <Badge variant="outline" className="bg-gray-100 border-gray-300">
                      <Award className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Date</p>
                        <p className="text-gray-600">{new Date(exam.start_time).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Score</p>
                        <p className="text-gray-600">85/100</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800"
                    onClick={() => handleViewResults(exam)}
                  >
                    View Results
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {!ongoingExams.length && !upcomingExams.length && !pastExams.length && (
        <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No exams available</h3>
          <p className="text-gray-500">
            You don't have any exams assigned yet. Check back later for new assignments.
          </p>
        </div>
      )}

      <ExamDetailsDialog
        exam={selectedExam}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ExamResultsDialog
        exam={selectedExam}
        open={resultsOpen}
        onOpenChange={setResultsOpen}
      />

      <ExamTaking
        exam={selectedExam}
        questions={questions}
        open={examTakingOpen}
        onOpenChange={setExamTakingOpen}
        onSubmit={handleExamSubmit}
      />
    </div>
  );
}


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUp, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Question, createQuestion, getCurrentUser } from '@/services/api';

interface ExcelImportExportProps {
  onImportSuccess: () => void;
  questions: Question[];
}

export function ExcelImportExport({ onImportSuccess, questions }: ExcelImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const currentUser = await getCurrentUser();
      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const questionData: any = row;
          
          // Map Excel columns to question format
          const question = {
            type: questionData.type || questionData.Type || 'single-choice',
            content: questionData.content || questionData.Question || questionData.question || '',
            options: questionData.options ? 
              (typeof questionData.options === 'string' ? 
                questionData.options.split(',').map(opt => opt.trim()) : 
                questionData.options) : 
              (questionData.Options ? 
                questionData.Options.split(',').map(opt => opt.trim()) : 
                []),
            correctAnswer: questionData.correctAnswer || questionData.CorrectAnswer || questionData.correct_answer || '',
            points: parseInt(questionData.points || questionData.Points || '1'),
            category: questionData.category || questionData.Category || 'General',
            createdBy: currentUser.id
          };

          // Validate required fields
          if (!question.content) {
            console.warn('Skipping row with missing content:', questionData);
            errorCount++;
            continue;
          }

          await createQuestion(question);
          successCount++;
        } catch (error) {
          console.error('Error creating question:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} questions`);
        onImportSuccess();
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} questions`);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import Excel file');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = questions.map(question => ({
        Type: question.type,
        Question: question.content,
        Options: question.options ? question.options.join(', ') : '',
        CorrectAnswer: Array.isArray(question.correctAnswer) ? 
          question.correctAnswer.join(', ') : 
          question.correctAnswer,
        Points: question.points,
        Category: question.category
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
      
      XLSX.writeFile(workbook, 'questions-bank.xlsx');
      toast.success('Questions exported to Excel successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export questions');
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative">
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImportExcel}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isImporting}
        />
        <Button variant="outline" disabled={isImporting}>
          <FileUp className="mr-2 h-4 w-4" />
          {isImporting ? 'Importing...' : 'Import Excel'}
        </Button>
      </div>
      
      <Button variant="outline" onClick={exportToExcel}>
        <FileDown className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}

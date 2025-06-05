
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, FileDown, Download, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createQuestion, Question } from '@/services/api';
import * as XLSX from 'xlsx';

interface ExcelImportExportProps {
  questions: Question[];
  onImportSuccess: () => void;
}

export const ExcelImportExport: React.FC<ExcelImportExportProps> = ({ 
  questions, 
  onImportSuccess 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToExcel = () => {
    try {
      setIsExporting(true);
      
      // Prepare data for Excel export
      const exportData = questions.map((question, index) => ({
        'Question Number': index + 1,
        'Type': question.type,
        'Category': question.category,
        'Points': question.points,
        'Content': question.content,
        'Option 1': question.options?.[0] || '',
        'Option 2': question.options?.[1] || '',
        'Option 3': question.options?.[2] || '',
        'Option 4': question.options?.[3] || '',
        'Option 5': question.options?.[4] || '',
        'Correct Answer': Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.join(', ') 
          : question.correctAnswer
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Question Number
        { wch: 20 }, // Type
        { wch: 15 }, // Category
        { wch: 10 }, // Points
        { wch: 50 }, // Content
        { wch: 30 }, // Option 1
        { wch: 30 }, // Option 2
        { wch: 30 }, // Option 3
        { wch: 30 }, // Option 4
        { wch: 30 }, // Option 5
        { wch: 30 }  // Correct Answer
      ];
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

      // Generate filename with current date
      const today = new Date().toISOString().split('T')[0];
      const filename = `questions-export-${today}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Export successful",
        description: `${questions.length} questions exported to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export questions to Excel",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportFromExcel(file);
    }
  };

  const handleImportFromExcel = async (file: File) => {
    try {
      setIsImporting(true);
      
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      // Find header indices
      const headers = data[0];
      const getColumnIndex = (possibleNames: string[]) => {
        for (const name of possibleNames) {
          const index = headers.findIndex((header: string) => 
            header && header.toString().toLowerCase().includes(name.toLowerCase())
          );
          if (index !== -1) return index;
        }
        return -1;
      };

      const typeIndex = getColumnIndex(['type']);
      const categoryIndex = getColumnIndex(['category']);
      const pointsIndex = getColumnIndex(['points']);
      const contentIndex = getColumnIndex(['content', 'question']);
      const correctAnswerIndex = getColumnIndex(['correct answer', 'answer']);
      
      const optionIndices = [
        getColumnIndex(['option 1', 'option1', 'choice 1']),
        getColumnIndex(['option 2', 'option2', 'choice 2']),
        getColumnIndex(['option 3', 'option3', 'choice 3']),
        getColumnIndex(['option 4', 'option4', 'choice 4']),
        getColumnIndex(['option 5', 'option5', 'choice 5'])
      ];

      // Validate required columns
      if (typeIndex === -1 || categoryIndex === -1 || contentIndex === -1 || correctAnswerIndex === -1) {
        throw new Error('Required columns missing. Please ensure your Excel file has: Type, Category, Content, and Correct Answer columns');
      }

      let successCount = 0;
      let errorCount = 0;
      
      // Process each data row
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        try {
          // Skip empty rows
          if (!row || row.length === 0 || !row[contentIndex]) {
            continue;
          }

          const type = row[typeIndex]?.toString().toLowerCase().replace(/\s+/g, '-');
          const category = row[categoryIndex]?.toString() || 'General';
          const points = parseInt(row[pointsIndex]?.toString()) || 1;
          const content = row[contentIndex]?.toString().trim();
          const correctAnswerStr = row[correctAnswerIndex]?.toString().trim();

          // Validate question type
          const validTypes = ['single-choice', 'multiple-choice', 'fill-blank', 'short-answer'];
          if (!validTypes.includes(type)) {
            console.warn(`Invalid question type "${type}" in row ${i + 1}, skipping`);
            errorCount++;
            continue;
          }

          // Extract options for choice questions
          let options: string[] | undefined;
          if (type === 'single-choice' || type === 'multiple-choice') {
            options = optionIndices
              .map(index => index !== -1 ? row[index]?.toString().trim() : '')
              .filter(option => option && option.length > 0);
            
            if (options.length === 0) {
              console.warn(`No options found for choice question in row ${i + 1}, skipping`);
              errorCount++;
              continue;
            }
          }

          // Process correct answer
          let correctAnswer: string | string[];
          if (type === 'multiple-choice' && correctAnswerStr.includes(',')) {
            correctAnswer = correctAnswerStr.split(',').map(s => s.trim());
          } else {
            correctAnswer = correctAnswerStr;
          }

          // Create question object
          const questionData: Omit<Question, 'id'> = {
            type: type as Question['type'],
            content,
            options,
            correctAnswer,
            points,
            category,
            createdBy: 'imported' // This will be overridden by the API
          };

          // Import the question
          await createQuestion(questionData);
          successCount++;
          
        } catch (rowError) {
          console.error(`Error processing row ${i + 1}:`, rowError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        onImportSuccess();
        toast({
          title: "Import completed",
          description: `Successfully imported ${successCount} questions${errorCount > 0 ? `. ${errorCount} questions failed to import.` : ''}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "No questions were successfully imported. Please check your Excel file format.",
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import questions from Excel",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    try {
      // Create template data
      const templateData = [
        {
          'Type': 'single-choice',
          'Category': 'Math',
          'Points': 1,
          'Content': 'What is 2 + 2?',
          'Option 1': '3',
          'Option 2': '4',
          'Option 3': '5',
          'Option 4': '6',
          'Option 5': '',
          'Correct Answer': '4'
        },
        {
          'Type': 'multiple-choice',
          'Category': 'Science',
          'Points': 2,
          'Content': 'Which of the following are planets?',
          'Option 1': 'Earth',
          'Option 2': 'Mars',
          'Option 3': 'Sun',
          'Option 4': 'Venus',
          'Option 5': 'Moon',
          'Correct Answer': 'Earth, Mars, Venus'
        },
        {
          'Type': 'fill-blank',
          'Category': 'History',
          'Points': 1,
          'Content': 'World War II ended in ____.',
          'Option 1': '',
          'Option 2': '',
          'Option 3': '',
          'Option 4': '',
          'Option 5': '',
          'Correct Answer': '1945'
        },
        {
          'Type': 'short-answer',
          'Category': 'Literature',
          'Points': 3,
          'Content': 'Explain the main theme of Romeo and Juliet.',
          'Option 1': '',
          'Option 2': '',
          'Option 3': '',
          'Option 4': '',
          'Option 5': '',
          'Correct Answer': 'Love and tragedy'
        }
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Type
        { wch: 15 }, // Category
        { wch: 10 }, // Points
        { wch: 50 }, // Content
        { wch: 30 }, // Option 1
        { wch: 30 }, // Option 2
        { wch: 30 }, // Option 3
        { wch: 30 }, // Option 4
        { wch: 30 }, // Option 5
        { wch: 30 }  // Correct Answer
      ];
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      // Download template
      XLSX.writeFile(workbook, 'questions-template.xlsx');

      toast({
        title: "Template downloaded",
        description: "Excel template downloaded successfully",
      });
    } catch (error) {
      console.error('Template download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download template",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Questions from Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-import">Upload Excel File</Label>
            <Input
              id="excel-import"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={isImporting}
            />
            <p className="text-sm text-muted-foreground">
              Upload an Excel file (.xlsx or .xls) with questions. Required columns: Type, Category, Content, Correct Answer
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Excel Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Export Questions to Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleExportToExcel}
            disabled={questions.length === 0 || isExporting}
            className="w-full"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : `Export ${questions.length} Questions to Excel`}
          </Button>
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              No questions available to export
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

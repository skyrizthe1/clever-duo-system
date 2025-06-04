
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { Question } from '@/services/api';
import * as XLSX from 'xlsx';

interface QuestionImportExportProps {
  questions: Question[];
  onImport: (questions: Omit<Question, 'id'>[]) => void;
}

export function QuestionImportExport({ questions, onImport }: QuestionImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (fileExtension === 'json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (Array.isArray(data)) {
              onImport(data);
              toast.success(`Successfully imported ${data.length} questions`);
            } else {
              toast.error('Invalid JSON format. Expected an array of questions.');
            }
          } catch (error) {
            toast.error('Failed to parse JSON file');
          }
        };
        reader.readAsText(file);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const importedQuestions = jsonData.map((row: any) => ({
              type: row.type || 'single-choice',
              content: row.content || row.question || '',
              options: row.options ? row.options.split('|') : [],
              correctAnswer: row.correctAnswer || row.correct_answer || '',
              points: parseInt(row.points) || 1,
              category: row.category || 'General',
              createdBy: 'imported'
            }));
            
            onImport(importedQuestions);
            toast.success(`Successfully imported ${importedQuestions.length} questions from Excel`);
          } catch (error) {
            toast.error('Failed to parse Excel file');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error('Unsupported file format. Please use JSON or Excel files.');
      }
    } catch (error) {
      toast.error('Failed to import file');
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = questions.map(q => ({
        id: q.id,
        type: q.type,
        content: q.content,
        options: Array.isArray(q.options) ? q.options.join('|') : '',
        correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join('|') : q.correctAnswer,
        points: q.points,
        category: q.category,
        createdBy: q.createdBy
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questions');
      
      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, `questions-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Questions exported to Excel successfully');
    } catch (error) {
      toast.error('Failed to export questions');
    }
  };

  const exportToJSON = () => {
    try {
      const exportData = questions.map(q => ({
        type: q.type,
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        category: q.category
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `questions-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Questions exported to JSON successfully');
    } catch (error) {
      toast.error('Failed to export questions');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.xlsx,.xls"
        style={{ display: 'none' }}
      />
      <Button variant="outline" onClick={handleImportClick}>
        <FileUp className="mr-2 h-4 w-4" /> Import
      </Button>
      <Button variant="outline" onClick={exportToExcel}>
        <FileDown className="mr-2 h-4 w-4" /> Export Excel
      </Button>
      <Button variant="outline" onClick={exportToJSON}>
        <FileDown className="mr-2 h-4 w-4" /> Export JSON
      </Button>
    </div>
  );
}

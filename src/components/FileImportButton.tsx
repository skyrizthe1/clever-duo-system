
import React, { useRef } from 'react';
import { Button } from './ui/button';
import { FileUp } from 'lucide-react';
import { toast } from 'sonner';

interface FileImportButtonProps {
  onImport: (data: any) => void;
  acceptedFileTypes?: string;
}

export function FileImportButton({ onImport, acceptedFileTypes = ".json,.xlsx,.xls,.csv" }: FileImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onImport(data);
          toast.success('Successfully imported questions');
        } catch (error) {
          toast.error('Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    } else if (['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      toast.error('Excel and CSV imports require backend processing');
      // In a real application, you would send this to your backend for processing
      // For now, we'll show an error message
    }
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        style={{ display: 'none' }}
      />
      <Button variant="outline" onClick={handleClick}>
        <FileUp className="mr-2 h-4 w-4" /> Import
      </Button>
    </>
  );
}


import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseAntiCheatingProps {
  isExamActive: boolean;
  onViolation?: () => void;
}

export function useAntiCheating({ isExamActive, onViolation }: UseAntiCheatingProps) {
  const [violations, setViolations] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    if (!isExamActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        setViolations(prev => prev + 1);
        toast.error('⚠️ Warning: You switched tabs! This has been recorded.', {
          duration: 5000,
        });
        onViolation?.();
      } else {
        setIsTabActive(true);
        toast.info('Welcome back to the exam.', {
          duration: 3000,
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the exam? Your progress will be lost.';
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common cheating shortcuts
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 't')) ||
        (e.altKey && e.key === 'Tab') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        toast.error('This action is not allowed during the exam!');
        setViolations(prev => prev + 1);
        onViolation?.();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled during the exam!');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isExamActive, onViolation]);

  return {
    violations,
    isTabActive,
    resetViolations: () => setViolations(0)
  };
}

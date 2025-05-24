
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings, Clock, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ExamSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamSettingsDialog({ open, onOpenChange }: ExamSettingsDialogProps) {
  const [settings, setSettings] = useState({
    defaultDuration: 60,
    allowLateSubmissions: false,
    showResultsImmediately: true,
    enableAntiCheating: true,
    maxAttempts: 3,
    passingScore: 70,
    shuffleQuestions: true,
    showCorrectAnswers: false,
    enableProctoring: false
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    toast.success('Exam settings updated successfully');
    onOpenChange(false);
  };

  const handleInputChange = (name: string, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Exam Settings
          </DialogTitle>
          <DialogDescription>
            Configure system-wide exam settings and policies
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Timing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={settings.defaultDuration}
                    onChange={(e) => handleInputChange('defaultDuration', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label htmlFor="allowLateSubmissions">Allow Late Submissions</Label>
                  <Switch
                    id="allowLateSubmissions"
                    checked={settings.allowLateSubmissions}
                    onCheckedChange={(checked) => handleInputChange('allowLateSubmissions', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Eye className="h-5 w-5 mr-2 text-green-600" />
                Results & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showResultsImmediately">Show Results Immediately</Label>
                <Switch
                  id="showResultsImmediately"
                  checked={settings.showResultsImmediately}
                  onCheckedChange={(checked) => handleInputChange('showResultsImmediately', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                <Switch
                  id="showCorrectAnswers"
                  checked={settings.showCorrectAnswers}
                  onCheckedChange={(checked) => handleInputChange('showCorrectAnswers', checked)}
                />
              </div>
              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.passingScore}
                  onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Security & Anti-Cheating
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableAntiCheating">Enable Anti-Cheating</Label>
                <Switch
                  id="enableAntiCheating"
                  checked={settings.enableAntiCheating}
                  onCheckedChange={(checked) => handleInputChange('enableAntiCheating', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                <Switch
                  id="shuffleQuestions"
                  checked={settings.shuffleQuestions}
                  onCheckedChange={(checked) => handleInputChange('shuffleQuestions', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enableProctoring">Enable Proctoring</Label>
                <Switch
                  id="enableProctoring"
                  checked={settings.enableProctoring}
                  onCheckedChange={(checked) => handleInputChange('enableProctoring', checked)}
                />
              </div>
              <div>
                <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  value={settings.maxAttempts}
                  onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

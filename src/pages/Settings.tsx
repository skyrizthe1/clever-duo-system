
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ExamSettingsDialog } from '@/components/ExamSettingsDialog';
import { UserManagementDialog } from '@/components/UserManagementDialog';
import { PasswordRecoveryAdmin } from '@/components/PasswordRecoveryAdmin';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Bell,
  Moon,
  Monitor,
  Sun,
  Key,
  Database,
  Mail
} from 'lucide-react';

const Settings = () => {
  const [examSettingsOpen, setExamSettingsOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [passwordRecoveryOpen, setPasswordRecoveryOpen] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ExamPlatform',
    siteDescription: 'Educational examination platform',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    darkMode: false
  });

  const handleSaveGeneralSettings = () => {
    // In a real app, this would save to backend
    toast.success('General settings saved successfully');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-gray-600 text-lg">
              Configure your platform settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General Settings */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-blue-600" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic platform configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="registrationEnabled">Enable Registration</Label>
                  <Switch
                    id="registrationEnabled"
                    checked={generalSettings.registrationEnabled}
                    onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
                  />
                </div>
                <Button onClick={handleSaveGeneralSettings} className="w-full">
                  Save General Settings
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive email updates</p>
                  </div>
                  <Switch
                    checked={generalSettings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Dark Mode</Label>
                    <p className="text-xs text-gray-500">Switch to dark theme</p>
                  </div>
                  <Switch
                    checked={generalSettings.darkMode}
                    onCheckedChange={(checked) => handleInputChange('darkMode', checked)}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Light</span>
                  <Switch checked={generalSettings.darkMode} />
                  <span className="text-sm text-gray-600">Dark</span>
                  <Moon className="h-4 w-4 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Advanced platform configuration and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50"
                    onClick={() => setExamSettingsOpen(true)}
                  >
                    <SettingsIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Exam Settings</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-green-50"
                    onClick={() => setUserManagementOpen(true)}
                  >
                    <Users className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">User Management</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-orange-50"
                    onClick={() => setPasswordRecoveryOpen(true)}
                  >
                    <Key className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium">Password Recovery</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-purple-50"
                    onClick={() => toast.info('Database backup feature coming soon')}
                  >
                    <Database className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Database Backup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ExamSettingsDialog
        open={examSettingsOpen}
        onOpenChange={setExamSettingsOpen}
      />
      
      <UserManagementDialog
        open={userManagementOpen}
        onOpenChange={setUserManagementOpen}
      />

      <PasswordRecoveryAdmin
        open={passwordRecoveryOpen}
        onOpenChange={setPasswordRecoveryOpen}
      />
    </div>
  );
};

export default Settings;


import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/api';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Lock, User, Monitor, Shield, Mail } from 'lucide-react';

export default function Settings() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [gradeNotifications, setGradeNotifications] = useState(true);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 tracking-tight leading-tight">
            Settings
          </h1>
          <p className="text-gray-700 text-lg">
            Manage your account preferences and system settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
            <TabsTrigger value="profile" className="flex items-center space-x-2 py-3">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 py-3">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2 py-3">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2 py-3">
              <Monitor className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={currentUser.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={currentUser.email} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Personal Slogan</Label>
                  <Input id="slogan" placeholder="Enter your personal slogan" defaultValue={currentUser.slogan || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={currentUser.role} disabled className="bg-gray-100" />
                </div>
                <Button className="w-full md:w-auto">Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Exam Reminders</Label>
                    <p className="text-sm text-gray-600">Get reminded about upcoming exams</p>
                  </div>
                  <Switch checked={examReminders} onCheckedChange={setExamReminders} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Grade Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified when grades are available</p>
                  </div>
                  <Switch checked={gradeNotifications} onCheckedChange={setGradeNotifications} />
                </div>
                
                <Button className="w-full md:w-auto">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button className="w-full md:w-auto">Update Password</Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Login Sessions</Label>
                    <p className="text-sm text-gray-600">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Theme & Display</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Theme Preference</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer border-2 hover:border-blue-500 transition-colors">
                      <CardContent className="p-4 text-center">
                        <div className="w-full h-20 bg-white border rounded mb-2"></div>
                        <p className="font-medium">Light</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer border-2 hover:border-blue-500 transition-colors">
                      <CardContent className="p-4 text-center">
                        <div className="w-full h-20 bg-gray-900 border rounded mb-2"></div>
                        <p className="font-medium">Dark</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer border-2 border-blue-500 bg-blue-50 transition-colors">
                      <CardContent className="p-4 text-center">
                        <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 border rounded mb-2"></div>
                        <p className="font-medium">Auto</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Compact Mode</Label>
                    <p className="text-sm text-gray-600">Use a more compact interface layout</p>
                  </div>
                  <Switch />
                </div>
                
                <Button className="w-full md:w-auto">Save Appearance</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

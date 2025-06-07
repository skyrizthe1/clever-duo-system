
import React, { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile, uploadAvatar } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, User, MapPin, Phone, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const Profile = () => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    slogan: '',
    phone: '',
    location: '',
    social_links: {} as Record<string, string>,
  });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    examReminders: true,
    gradeNotifications: true,
    systemUpdates: false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    showProfileToOthers: true,
    allowDataCollection: true,
    shareActivityWithTeachers: true,
  });

  React.useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        slogan: currentUser.slogan || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        social_links: currentUser.social_links || {},
      });
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: any) => updateProfile(currentUser!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated successfully');
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) => uploadAvatar(userId, file),
    onSuccess: (avatarUrl) => {
      updateProfileMutation.mutate({ avatar: avatarUrl });
    }
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      uploadAvatarMutation.mutate({ userId: currentUser.id, file });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value }
    }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    toast.success('Password changed successfully');
    setIsChangePasswordOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const saveNotificationSettings = () => {
    toast.success('Notification settings updated');
    setIsNotificationsOpen(false);
  };

  const savePrivacySettings = () => {
    toast.success('Privacy settings updated');
    setIsPrivacyOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadAvatarMutation.isPending}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{currentUser?.name}</h3>
                      <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                      <p className="text-sm text-muted-foreground capitalize">{currentUser?.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={profileData.name} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={currentUser?.email || ''} readOnly />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan</Label>
                    <Input 
                      id="slogan" 
                      name="slogan"
                      placeholder="Your personal motto or slogan"
                      value={profileData.slogan} 
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={profileData.bio} 
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone" 
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          value={profileData.phone} 
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="location" 
                          name="location"
                          placeholder="City, Country"
                          value={profileData.location} 
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Social Links</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['twitter', 'linkedin', 'github', 'website'].map((platform) => (
                        <div key={platform} className="space-y-2">
                          <Label htmlFor={platform} className="capitalize">{platform}</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id={platform}
                              placeholder={`Your ${platform} URL`}
                              value={profileData.social_links[platform] || ''} 
                              onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-4"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsNotificationsOpen(true)}
                >
                  Notification Settings
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsPrivacyOpen(true)}
                >
                  Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Change Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage how you receive notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about your account activity
                </p>
              </div>
              <Switch 
                id="email-notifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={() => handleNotificationToggle('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="exam-reminders">Exam Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notifications before your exams start
                </p>
              </div>
              <Switch 
                id="exam-reminders"
                checked={notificationSettings.examReminders}
                onCheckedChange={() => handleNotificationToggle('examReminders')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="grade-notifications">Grade Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Be notified when your grades are available
                </p>
              </div>
              <Switch 
                id="grade-notifications"
                checked={notificationSettings.gradeNotifications}
                onCheckedChange={() => handleNotificationToggle('gradeNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about system changes
                </p>
              </div>
              <Switch 
                id="system-updates"
                checked={notificationSettings.systemUpdates}
                onCheckedChange={() => handleNotificationToggle('systemUpdates')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveNotificationSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <AlertDialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Privacy Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Manage your privacy preferences and data sharing options.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-profile">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other users to see your profile information
                </p>
              </div>
              <Switch 
                id="show-profile"
                checked={privacySettings.showProfileToOthers}
                onCheckedChange={() => handlePrivacyToggle('showProfileToOthers')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-collection">Data Collection</Label>
                <p className="text-sm text-muted-foreground">
                  Allow us to collect usage data to improve our services
                </p>
              </div>
              <Switch 
                id="data-collection"
                checked={privacySettings.allowDataCollection}
                onCheckedChange={() => handlePrivacyToggle('allowDataCollection')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-activity">Share Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Allow teachers to view your learning activity
                </p>
              </div>
              <Switch 
                id="share-activity"
                checked={privacySettings.shareActivityWithTeachers}
                onCheckedChange={() => handlePrivacyToggle('shareActivityWithTeachers')}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={savePrivacySettings}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;

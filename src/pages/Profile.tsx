
import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile, uploadAvatar } from '@/services/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Edit3, 
  Save, 
  X,
  UserCircle,
  Quote,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Calendar
} from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    slogan: '',
    phone: '',
    location: '',
    social_links: {
      github: '',
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser
  });

  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        slogan: currentUser.slogan || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        social_links: {
          github: currentUser.social_links?.github || '',
          linkedin: currentUser.social_links?.linkedin || '',
          twitter: currentUser.social_links?.twitter || '',
          website: currentUser.social_links?.website || ''
        }
      });
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('social_')) {
      const socialField = field.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      await updateProfile(currentUser.id, {
        ...formData,
        email: currentUser.email,
        role: currentUser.role,
        id: currentUser.id
      });
      
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        slogan: currentUser.slogan || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        social_links: {
          github: currentUser.social_links?.github || '',
          linkedin: currentUser.social_links?.linkedin || '',
          twitter: currentUser.social_links?.twitter || '',
          website: currentUser.social_links?.website || ''
        }
      });
    }
    setIsEditing(false);
    setPreviewUrl(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(currentUser.id, file);
      await updateProfile(currentUser.id, {
        ...currentUser,
        avatar: avatarUrl
      });
      
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile picture updated successfully');
      setPreviewUrl(null);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Please log in to view your profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                {/* Avatar Section */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                    <AvatarImage 
                      src={previewUrl || currentUser.avatar} 
                      alt={currentUser.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="absolute bottom-2 right-2 rounded-full h-10 w-10 p-0 bg-white shadow-lg hover:bg-gray-50 text-gray-700"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                          Choose a new profile picture. Supported formats: JPG, PNG, GIF (max 5MB)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          ref={fileInputRef}
                        />
                        {previewUrl && (
                          <div className="flex justify-center">
                            <Avatar className="h-24 w-24">
                              <AvatarImage src={previewUrl} alt="Preview" />
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{currentUser.name}</h1>
                      <p className="text-gray-600">{currentUser.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`px-3 py-1 ${getRoleColor(currentUser.role)}`}>
                        {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                      </Badge>
                      {!isEditing ? (
                        <Button 
                          onClick={() => setIsEditing(true)} 
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSave} 
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline">
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to discard your changes? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancel}>
                                  Discard Changes
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {currentUser.slogan && (
                    <div className="flex items-center gap-2 text-gray-600 italic">
                      <Quote className="h-4 w-4" />
                      <span>"{currentUser.slogan}"</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{currentUser.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{currentUser.email}</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{currentUser.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter your location"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{currentUser.location || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slogan">Personal Slogan</Label>
                    {isEditing ? (
                      <Input
                        id="slogan"
                        value={formData.slogan}
                        onChange={(e) => handleInputChange('slogan', e.target.value)}
                        placeholder="Enter a personal slogan or motto"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Quote className="h-4 w-4 text-gray-500" />
                        <span className="italic">{currentUser.slogan || 'No slogan set'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Biography</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <div className="mt-1">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {currentUser.bio || 'No biography provided.'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Social Links */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Connect your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(formData.social_links).map(([platform, url]) => (
                    <div key={platform}>
                      <Label htmlFor={`social_${platform}`} className="capitalize">
                        {platform === 'website' ? 'Website' : platform}
                      </Label>
                      {isEditing ? (
                        <Input
                          id={`social_${platform}`}
                          value={url}
                          onChange={(e) => handleInputChange(`social_${platform}`, e.target.value)}
                          placeholder={`Your ${platform} URL`}
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          {getSocialIcon(platform)}
                          {url ? (
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              {url}
                            </a>
                          ) : (
                            <span className="text-gray-500">Not provided</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role</span>
                    <Badge className={getRoleColor(currentUser.role)}>
                      {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>Recent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
}

export function ProfilePictureUpload({ currentAvatarUrl, onAvatarChange }: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Here you would normally upload to your storage service
      // For now, we'll simulate the upload and use the preview URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAvatarChange(objectUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setPreviewUrl(undefined);
    onAvatarChange('');
    toast.success('Profile picture removed');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg">Profile Picture</h3>
            <p className="text-sm text-gray-600">Upload a photo to personalize your account</p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <Button disabled={uploading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </div>
            
            {previewUrl && (
              <Button variant="outline" onClick={removeAvatar}>
                Remove
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Recommended: Square image, at least 300x300px<br />
            Max file size: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Save, Upload, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Key, Lock, Eye, EyeOff, Film, Trash2, Loader2 } from 'lucide-react';
import { Settings, SocialMediaLink } from '@/types';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Admin credentials state
  const [credsEmail, setCredsEmail] = useState('');
  const [credsPassword, setCredsPassword] = useState('');
  const [credsConfirmPassword, setCredsConfirmPassword] = useState('');
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [showCredsPassword, setShowCredsPassword] = useState(false);
  const [showCredsConfirmPassword, setShowCredsConfirmPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAdminCredentials();
  }, []);

  const fetchAdminCredentials = async () => {
    try {
      const res = await fetch('/api/admin/credentials', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setCredsEmail(result.data.email);
      }
    } catch (error) {
      console.error('Error fetching admin credentials:', error);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credsEmail || !credsPassword) {
      toast.error('Email and password are required');
      return;
    }
    if (credsPassword !== credsConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdatingCreds(true);
    const toastId = toast.loading('Updating admin login credentials...');
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ email: credsEmail, password: credsPassword }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Credentials updated successfully!', { id: toastId });
        setCredsPassword('');
        setCredsConfirmPassword('');
      } else {
        toast.error(result.error || 'Failed to update credentials', { id: toastId });
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast.error('Network error. Failed to update credentials.', { id: toastId });
    } finally {
      setUpdatingCreds(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
      } else {
        toast.error(result.error || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Network error. Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    const toastId = toast.loading('Saving website settings...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Settings saved successfully!', { id: toastId });
        fetchSettings();
      } else {
        toast.error(result.error || 'Failed to save settings', { id: toastId });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Network error. Failed to save settings.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Video file size exceeds 50MB limit');
      return;
    }

    // Validate type
    if (file.type !== 'video/mp4') {
      toast.error('Only MP4 videos are supported');
      return;
    }

    setUploadingVideo(true);
    const toastId = toast.loading('Uploading video to Backblaze B2...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success && result.data) {
        setSettings(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            heroVideo: {
              fileKey: result.data.fileKey,
              url: result.data.url
            }
          };
        });
        toast.success('Video uploaded successfully!', { id: toastId });
      } else {
        toast.error(result.error || 'Failed to upload video', { id: toastId });
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Network error. Failed to upload video.', { id: toastId });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleRemoveVideo = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      heroVideo: undefined
    });
    toast.success('Custom hero video removed (remember to save settings)');
  };

  const updateContactInfo = (field: keyof NonNullable<typeof settings>['contactInfo'], value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      contactInfo: {
        ...settings.contactInfo!,
        [field]: value,
      },
    });
  };

  const updateSocialMedia = (index: number, field: keyof SocialMediaLink, value: string) => {
    if (!settings) return;
    const newSocialMedia = [...settings.socialMedia];
    newSocialMedia[index] = {
      ...newSocialMedia[index],
      [field]: value,
    };
    setSettings({
      ...settings,
      socialMedia: newSocialMedia,
    });
  };

  const updateOperatingHours = (day: keyof NonNullable<typeof settings>['operatingHours'], value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      operatingHours: {
        ...settings.operatingHours!,
        [day]: value,
      },
    });
  };

  const updateMembershipFees = (period: keyof NonNullable<typeof settings>['membershipFees'], value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      membershipFees: {
        ...settings.membershipFees!,
        [period]: value,
      },
    });
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">No settings found.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Club Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Club Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Name
              </label>
              <input
                type="text"
                value={settings.clubName}
                onChange={(e) => setSettings({ ...settings, clubName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Our History
              </label>
              <textarea
                rows={4}
                value={settings.history || ''}
                onChange={(e) => setSettings({ ...settings, history: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent font-medium text-slate-700"
                placeholder="Describe the history of your club..."
              />
            </div>
          </div>
        </div>

        {/* Hero Section settings (Video Upload) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Film className="w-5 h-5 mr-2 text-primary-sunset" />
            Hero Section Background Video
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Upload a background MP4 video for the landing page Hero section. The video will be stored securely on Backblaze B2 and streamed back on the homepage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className={`cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-350 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 transition-colors ${uploadingVideo ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingVideo ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                ) : (
                  <Upload className="w-4 h-4 text-slate-500" />
                )}
                <span>{uploadingVideo ? 'Uploading...' : 'Choose MP4 Video'}</span>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={uploadingVideo}
                />
              </label>

              {settings.heroVideo && (
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="flex items-center space-x-2 px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Custom Video</span>
                </button>
              )}
            </div>

            {settings.heroVideo ? (
              <div className="mt-4 border border-gray-150 rounded-xl overflow-hidden bg-slate-50 max-w-lg">
                <div className="p-3 border-b border-gray-150 flex items-center justify-between bg-white">
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-xs" title={settings.heroVideo.fileKey}>
                    File: {settings.heroVideo.fileKey.split('/').pop()}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full font-bold">
                    Active (Unsaved)
                  </span>
                </div>
                <video
                  src={settings.heroVideo.url}
                  controls
                  className="w-full h-56 object-cover bg-black"
                />
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span className="text-xs font-medium">No custom hero video uploaded. Using default video.</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-primary-sunset" />
            Contact Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <textarea
                rows={2}
                value={settings.contactInfo.address}
                onChange={(e) => updateContactInfo('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings.contactInfo.phone}
                  onChange={(e) => updateContactInfo('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={settings.contactInfo.email}
                  onChange={(e) => updateContactInfo('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Social Media Links</h2>
          
          <div className="space-y-4">
            {settings.socialMedia.map((social, index) => (
              <div key={social.platform} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {social.platform === 'Facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                  {social.platform === 'Instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                  {social.platform === 'Twitter' && <Twitter className="w-5 h-5 text-sky-500" />}
                  {social.platform === 'YouTube' && <Youtube className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                    placeholder={`${social.platform} URL`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Operating Hours</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.operatingHours).map(([day, hours]) => (
              <div key={day}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {day}
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => updateOperatingHours(day as keyof typeof settings.operatingHours, e.target.value)}
                  placeholder="e.g., 09:00 - 17:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Membership Fees */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Membership Fees</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly (£)
              </label>
              <input
                type="number"
                value={settings.membershipFees.monthly}
                onChange={(e) => updateMembershipFees('monthly', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quarterly (£)
              </label>
              <input
                type="number"
                value={settings.membershipFees.quarterly}
                onChange={(e) => updateMembershipFees('quarterly', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yearly (£)
              </label>
              <input
                type="number"
                value={settings.membershipFees.yearly}
                onChange={(e) => updateMembershipFees('yearly', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Admin Login Credentials Reset Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8 border border-gray-150">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Key className="w-5 h-5 mr-2 text-primary-sunset" />
          Admin Login Credentials
        </h2>
        
        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Login Email (Username) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                required
                value={credsEmail}
                onChange={(e) => setCredsEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent font-semibold text-slate-700"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showCredsPassword ? "text" : "password"}
                  required
                  value={credsPassword}
                  onChange={(e) => setCredsPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowCredsPassword(!showCredsPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCredsPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showCredsConfirmPassword ? "text" : "password"}
                  required
                  value={credsConfirmPassword}
                  onChange={(e) => setCredsConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowCredsConfirmPassword(!showCredsConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCredsConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-650" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-655" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingCreds || !credsEmail || !credsPassword || !credsConfirmPassword}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{updatingCreds ? 'Updating...' : 'Update Admin Credentials'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

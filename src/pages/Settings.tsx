import { useState, useRef, useEffect } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import AudixTopbar from '@/components/AudixTopbar';
import UserAvatar from '@/components/UserAvatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Bell,
  Palette,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '@/services/api';

const Settings = () => {
  const { user } = useCustomAuth();
  const { userProfile, isLoading, refetch } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem('userProfileImage')
  );
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    country: '',
    // Preferences
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showRecentActivity: true
    }
  });

  // Additional state for loading and errors
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);

  // Fetch complete user profile data
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data.user) {
        const userData = response.data.user;
        
        // Format date for input field
        const formatDateForInput = (dateString: string | Date | null) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        const profileData = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          location: userData.location || userData.country || '',
          website: userData.website || '',
          dateOfBirth: formatDateForInput(userData.dateOfBirth),
          gender: userData.gender || 'prefer-not-to-say',
          country: userData.country || '',
          theme: userData.preferences?.theme || 'dark',
          language: userData.preferences?.language || 'en',
          notifications: {
            email: userData.preferences?.notifications?.email ?? true,
            push: userData.preferences?.notifications?.push ?? true,
            marketing: userData.preferences?.notifications?.marketing ?? false
          },
          privacy: {
            profileVisibility: userData.preferences?.privacy?.profileVisibility || 'public',
            showRecentActivity: userData.preferences?.privacy?.showRecentActivity ?? true
          }
        };

        setFormData(profileData);
        setOriginalData(profileData);
        
        // Update profile image if available
        if (userData.picture) {
          setProfileImage(userData.picture);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setProfileError(error.message || 'Failed to load profile data');
      toast.error('Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Update form data when userProfile changes (fallback)
  useEffect(() => {
    if (userProfile && !originalData) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
      }));
    }
  }, [userProfile, originalData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setProfileImage(imageData);
        // Save to localStorage immediately for instant UI updates
        localStorage.setItem('userProfileImage', imageData);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare profile data for API
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        country: formData.country,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone : null,
        bio: formData.bio || null,
        website: formData.website && formData.website.trim() !== '' ? formData.website : null,
        location: formData.location || null,
      };

      // Prepare preferences data for API
      const preferencesData = {
        theme: formData.theme,
        language: formData.language,
        notifications: formData.notifications,
        privacy: formData.privacy
      };

      // Update profile
      const profileResponse = await apiService.updateProfile(profileData);
      if (!profileResponse.success) {
        throw new Error(profileResponse.message || 'Failed to update profile');
      }

      // Update preferences
      const preferencesResponse = await apiService.updatePreferences(preferencesData);
      if (!preferencesResponse.success) {
        throw new Error(preferencesResponse.message || 'Failed to update preferences');
      }

      // Update original data to reflect saved state
      setOriginalData({ ...formData });
      
      toast.success('Settings saved successfully!');
      setIsEditing(false);
      
      // Refresh user profile data
      await fetchUserProfile();
      refetch();
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Handle cancel - reset form to original data
  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  if (isLoading || isLoadingProfile) {
    return (
      <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
        <AudixTopbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading settings...</p>
          </div>
        </div>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
        <AudixTopbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Settings</h2>
            <p className="text-zinc-400 mb-4">{profileError}</p>
            <button
              onClick={fetchUserProfile}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <p className="text-zinc-400">Manage your account and preferences</p>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">Profile Information</h2>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>

                    {/* Profile Picture */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden relative">
                          {(profileImage || user?.picture) && (
                            <img
                              src={profileImage || user?.picture}
                              alt="Profile"
                              className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                              onError={(e) => {
                                e.currentTarget.style.opacity = '0';
                              }}
                              loading="lazy"
                            />
                          )}
                          {/* Fallback icon - always present but only visible when image fails or doesn't exist */}
                          <div className={`absolute inset-0 flex items-center justify-center ${(profileImage || user?.picture) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out`}>
                            <User className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Camera className="w-4 h-4 text-white" />
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {formData.firstName} {formData.lastName}
                        </h3>
                        <p className="text-zinc-400">{formData.email}</p>
                        {isEditing && (
                          <div className="mt-2 space-y-1">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              <Upload className="w-4 h-4" />
                              Upload new photo
                            </button>
                            {(profileImage || localStorage.getItem('userProfileImage')) && (
                              <button
                                onClick={() => {
                                  setProfileImage(null);
                                  localStorage.removeItem('userProfileImage');
                                  toast.success('Profile picture removed!');
                                }}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove photo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white">
                            {formData.firstName || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white">
                            {formData.lastName || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-zinc-400">
                          {formData.email}
                          <span className="ml-2 text-xs text-zinc-500">(Cannot be changed)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white">
                            {formData.phone || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter your location"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white">
                            {formData.location || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Date of Birth
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white">
                            {formData.dateOfBirth || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Gender
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="prefer-not-to-say">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white">
                            {formData.gender === 'prefer-not-to-say' ? 'Prefer not to say' : 
                             formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white min-h-[100px]">
                          {formData.bio || 'No bio provided'}
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="https://your-website.com"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-zinc-700/30 border border-zinc-600/50 rounded-lg text-white">
                          {formData.website ? (
                            <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              {formData.website}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Account Settings</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Account Type</h3>
                            <p className="text-zinc-400 text-sm">Your current subscription plan</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                              Free Plan
                            </span>
                            <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all duration-200">
                              Upgrade to Premium
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                            <p className="text-zinc-400 text-sm">Add an extra layer of security to your account</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Enable 2FA
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Change Password</h3>
                            <p className="text-zinc-400 text-sm">Update your account password</p>
                          </div>
                          <button className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors">
                            Change Password
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-red-400 font-medium">Delete Account</h3>
                            <p className="text-zinc-400 text-sm">Permanently delete your account and all data</p>
                          </div>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Notification Preferences</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Email Notifications</h3>
                            <p className="text-zinc-400 text-sm">Receive updates via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.notifications.email}
                              onChange={(e) => handleNestedInputChange('notifications', 'email', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Push Notifications</h3>
                            <p className="text-zinc-400 text-sm">Receive push notifications in your browser</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.notifications.push}
                              onChange={(e) => handleNestedInputChange('notifications', 'push', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Marketing Communications</h3>
                            <p className="text-zinc-400 text-sm">Receive promotional emails and updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.notifications.marketing}
                              onChange={(e) => handleNestedInputChange('notifications', 'marketing', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Privacy Settings</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium mb-2">Profile Visibility</h3>
                          <p className="text-zinc-400 text-sm mb-4">Choose who can see your profile</p>
                          <div className="space-y-2">
                            {['public', 'friends', 'private'].map((option) => (
                              <label key={option} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="profileVisibility"
                                  value={option}
                                  checked={formData.privacy.profileVisibility === option}
                                  onChange={(e) => handleNestedInputChange('privacy', 'profileVisibility', e.target.value)}
                                  className="w-4 h-4 text-green-600 bg-zinc-700 border-zinc-600 focus:ring-green-500"
                                />
                                <span className="text-white capitalize">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Show Recent Activity</h3>
                            <p className="text-zinc-400 text-sm">Let others see your recent listening activity</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.privacy.showRecentActivity}
                              onChange={(e) => handleNestedInputChange('privacy', 'showRecentActivity', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Appearance Settings</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium mb-2">Theme</h3>
                          <p className="text-zinc-400 text-sm mb-4">Choose your preferred theme</p>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'light', label: 'Light', preview: 'bg-white border-2' },
                              { value: 'dark', label: 'Dark', preview: 'bg-zinc-900 border-2' },
                              { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-white to-zinc-900 border-2' }
                            ].map((theme) => (
                              <label key={theme.value} className="cursor-pointer">
                                <input
                                  type="radio"
                                  name="theme"
                                  value={theme.value}
                                  checked={formData.theme === theme.value}
                                  onChange={(e) => handleInputChange('theme', e.target.value)}
                                  className="sr-only peer"
                                />
                                <div className={`p-4 rounded-lg border-2 transition-all peer-checked:border-green-500 peer-checked:bg-green-500/10 ${theme.preview} hover:border-zinc-500`}>
                                  <div className="text-center">
                                    <div className={`w-full h-8 rounded mb-2 ${theme.preview}`}></div>
                                    <span className="text-white text-sm font-medium">{theme.label}</span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 border border-zinc-600/50 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium mb-2">Language</h3>
                          <p className="text-zinc-400 text-sm mb-4">Select your preferred language</p>
                          <select
                            value={formData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="it">Italiano</option>
                            <option value="pt">Português</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default Settings;

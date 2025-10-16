import { useState, useRef, useEffect } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import AudixTopbar from '@/components/AudixTopbar';
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
  Globe,
  Upload,
  Trash2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '@/services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const Settings = () => {
  // Pro-styled toast helpers
  const showSuccessToast = (title: string, description?: string) => {
    toast.custom((t) => (
      <div className={`pointer-events-auto w-full max-w-sm ${t.visible ? 'animate-in fade-in zoom-in-95' : 'animate-out fade-out zoom-out-95'} rounded-xl border border-emerald-500/30 bg-zinc-900/90 backdrop-blur-md shadow-lg shadow-emerald-900/20 p-4`}> 
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-400"><path fill="currentColor" d="M9.00039 16.2L4.80039 12L3.40039 13.4L9.00039 19L21.0004 7.00001L19.6004 5.60001L9.00039 16.2Z"></path></svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium leading-snug">{title}</p>
            {description && <p className="text-zinc-400 text-sm mt-0.5">{description}</p>}
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      </div>
    ));
  };

  const showErrorToast = (title: string, description?: string) => {
    toast.custom((t) => (
      <div className={`pointer-events-auto w-full max-w-sm ${t.visible ? 'animate-in fade-in zoom-in-95' : 'animate-out fade-out zoom-out-95'} rounded-xl border border-red-500/30 bg-zinc-900/90 backdrop-blur-md shadow-lg shadow-red-900/20 p-4`}> 
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-400"><path fill="currentColor" d="M11 7h2v6h-2V7zm0 8h2v2h-2v-2zM1 21h22L12 2 1 21z"></path></svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium leading-snug">{title}</p>
            {description && <p className="text-zinc-400 text-sm mt-0.5">{description}</p>}
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      </div>
    ));
  };
  const navigate = useNavigate();
  const { user, updateUser } = useCustomAuth();
  const { userProfile, isLoading, refetch } = useUserProfile();
  const accountType = (user as any)?.accountType || (userProfile as any)?.accountType || 'free';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const location = useLocation();
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
  // Invoices removed from Account tab UI; keep state only if used elsewhere
  // Change Password UI state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  // Inline loading for notification toggles
  const [updatingNotifications, setUpdatingNotifications] = useState<{ email: boolean; push: boolean }>({ email: false, push: false });
  // Inline loading for appearance
  const [updatingTheme, setUpdatingTheme] = useState(false);
  const [updatingLanguage, setUpdatingLanguage] = useState(false);

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

  // Sync tab from URL on mount and when query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['profile','account','notifications','artist'].includes(tab)) {
      setActiveTab(tab);
    } else if (tab === 'appearance') {
      // Redirect legacy links to account tab
      navigate('/settings?tab=account', { replace: true });
    }
  }, [location.search, navigate]);

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
    setFormData(prev => {
      const parentValue = (prev as any)[parent] || {};
      return {
        ...prev,
        [parent]: {
          ...parentValue,
          [field]: value
        }
      } as any;
    });
  };

  const handleToggleNotification = async (field: 'email' | 'push', value: boolean) => {
    const previous = formData.notifications;
    const nextNotifications = { ...previous, [field]: value };
    // Optimistic update
    setFormData(prev => ({ ...prev, notifications: nextNotifications }));
    try {
      // For push notifications, request permission first when enabling
      if (field === 'push' && value) {
        try {
          if ('Notification' in window) {
            if (Notification.permission === 'default') {
              const perm = await Notification.requestPermission();
              if (perm !== 'granted') {
                throw new Error('Browser notification permission denied');
              }
            } else if (Notification.permission !== 'granted') {
              throw new Error('Browser notification permission denied');
            }
          }
        } catch (permErr: any) {
          setFormData(prev => ({ ...prev, notifications: previous }));
          showErrorToast('Permission required', 'Enable notifications in your browser settings.');
          return;
        }
      }

      setUpdatingNotifications(prev => ({ ...prev, [field]: true }));
      const resp = await apiService.updatePreferences({
        theme: formData.theme,
        language: formData.language,
        notifications: nextNotifications,
        privacy: formData.privacy
      });
      if (!resp?.success) throw new Error(resp?.message || 'Failed to update preferences');
      const friendly = field === 'email' ? 'Email notifications' : 'Push notifications';
      showSuccessToast('Preference updated', `${friendly} ${value ? 'enabled' : 'disabled'}.`);
    } catch (e: any) {
      // Revert on failure
      setFormData(prev => ({ ...prev, notifications: previous }));
      showErrorToast('Update failed', e?.message || 'Failed to update preference.');
    }
    finally {
      setUpdatingNotifications(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleThemeChange = async (value: 'light' | 'dark' | 'auto') => {
    const previous = formData.theme;
    setFormData(prev => ({ ...prev, theme: value }));
    try {
      setUpdatingTheme(true);
      const resp = await apiService.updatePreferences({
        theme: value,
        language: formData.language,
        notifications: formData.notifications,
        privacy: formData.privacy
      });
      if (!resp?.success) throw new Error(resp?.message || 'Failed to update theme');
      showSuccessToast('Theme updated', `${value.charAt(0).toUpperCase() + value.slice(1)} theme applied.`);
    } catch (e: any) {
      setFormData(prev => ({ ...prev, theme: previous }));
      showErrorToast('Update failed', e?.message || 'Failed to update theme.');
    } finally {
      setUpdatingTheme(false);
    }
  };

  const handleLanguageChange = async (value: string) => {
    const previous = formData.language;
    setFormData(prev => ({ ...prev, language: value }));
    try {
      setUpdatingLanguage(true);
      const resp = await apiService.updatePreferences({
        theme: formData.theme,
        language: value,
        notifications: formData.notifications,
        privacy: formData.privacy
      });
      if (!resp?.success) throw new Error(resp?.message || 'Failed to update language');
      showSuccessToast('Language updated', `${value.toUpperCase()} applied.`);
    } catch (e: any) {
      setFormData(prev => ({ ...prev, language: previous }));
      showErrorToast('Update failed', e?.message || 'Failed to update language.');
    } finally {
      setUpdatingLanguage(false);
    }
  };

  const validateNewPassword = (pwd: string): string | null => {
    if (!pwd || pwd.length < 8) return 'Must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Must include at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Must include at least one lowercase letter';
    if (!/\d/.test(pwd)) return 'Must include at least one number';
    if (!/[@$!%*?&]/.test(pwd)) return 'Must include at least one special character (@$!%*?&)';
    return null;
  };

  const handleChangePassword = async () => {
    if (isChangingPassword) return;
    const errors: any = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    const pwdErr = validateNewPassword(passwordForm.newPassword);
    if (pwdErr) errors.newPassword = pwdErr;
    if (!passwordForm.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    if (!errors.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsChangingPassword(true);
      const resp: any = await (apiService as any).changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      if (!resp?.success) throw new Error(resp?.message || 'Failed to change password');
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      setShowPasswordForm(false);
    } catch (e: any) {
      console.error('Change password error:', e);
      toast.error(e?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
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
      // If profile image changed locally, persist to backend first
      if (profileImage !== (user?.picture || null)) {
        try {
          const picResp = await apiService.updateProfilePicture(profileImage);
          if (!picResp.success) {
            throw new Error(picResp.message || 'Failed to update profile picture');
          }
          // Update auth user context to reflect new picture globally
          if (user) {
            const newUserData = { ...(user as any), picture: (picResp as any)?.data?.picture ?? (profileImage || undefined) } as any;
            updateUser(newUserData);
          }
          // Store latest in localStorage for immediate UI usage
          if (profileImage) {
            localStorage.setItem('userProfileImage', profileImage);
          } else {
            localStorage.removeItem('userProfileImage');
          }
        } catch (e: any) {
          toast.error(e.message || 'Failed to update profile picture');
        }
      }

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

  const cancelPremium = async () => {
    try {
      const resp = await apiService.updateSubscription({ accountType: 'free', subscriptionExpires: null });
      if (!(resp as any)?.success) {
        throw new Error((resp as any)?.message || 'Failed to cancel premium');
      }
      if (user) {
        updateUser({ ...(user as any), accountType: 'free' } as any);
      }
      const mongoUserRaw = localStorage.getItem('mongoUser');
      if (mongoUserRaw) {
        try {
          const mongoUser = JSON.parse(mongoUserRaw);
          mongoUser.accountType = 'free';
          localStorage.setItem('mongoUser', JSON.stringify(mongoUser));
        } catch {}
      }
      toast.success('Premium cancelled. You are on Free plan.');
      await fetchUserProfile();
      refetch();
    } catch (e: any) {
      console.error('Cancel premium error:', e);
      toast.error(e?.message || 'Failed to cancel premium');
    }
  };

  const handleCancelPremiumClick = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel Premium? You will lose Premium benefits immediately.');
    if (!confirmed) return;
    await cancelPremium();
  };

  

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
          {/* Header (back only) */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/settings-menu')}
                  className="p-2 rounded-lg hover:bg-zinc-700/60 transition-colors text-zinc-300"
                  aria-label="Back to settings menu"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
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
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white tracking-tight">Profile Information</h2>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>

                    {/* Profile Picture */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden relative border border-zinc-800 bg-zinc-900">
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
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
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
                        <h3 className="text-lg font-medium text-white">
                          {formData.firstName} {formData.lastName}
                        </h3>
                        <p className="text-zinc-500">{formData.email}</p>
                        {isEditing && (
                          <div className="mt-2 space-y-1">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm"
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
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                            {formData.firstName || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                            {formData.lastName || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
                          {formData.email}
                          <span className="ml-2 text-xs text-zinc-500">(Cannot be changed)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                            {formData.phone || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                            placeholder="Enter your location"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                            {formData.location || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Date of Birth
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                            {formData.dateOfBirth || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          Gender
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                          >
                            <option value="prefer-not-to-say">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                            {formData.gender === 'prefer-not-to-say' ? 'Prefer not to say' : 
                             formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 min-h-[100px]">
                          {formData.bio || 'No bio provided'}
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                          placeholder="https://your-website.com"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                          {formData.website ? (
                            <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white">
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

                {/* Artist Tab */}
                {activeTab === 'artist' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white tracking-tight">Artist Settings</h2>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Artist Profile</h3>
                          <p className="text-zinc-500 text-sm">Manage your public artist details</p>
                        </div>
                        <button onClick={() => navigate('/artist')} className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors">Open Artist Dashboard</button>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Uploads</h3>
                          <p className="text-zinc-500 text-sm">Upload tracks, cover art, and manage releases</p>
                        </div>
                        <button onClick={() => navigate('/artist')} className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors">Go to Uploads</button>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Earnings & Payouts</h3>
                          <p className="text-zinc-500 text-sm">View earnings and manage payout details</p>
                        </div>
                        <button onClick={() => navigate('/artist')} className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors">Manage Payouts</button>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Switch back to Listener</h3>
                          <p className="text-zinc-500 text-sm">Disable artist features and use a normal account</p>
                        </div>
                        <button
                          onClick={async () => {
                            const Swal = (window as any).Swal || (await import('sweetalert2')).default;
                            const r = await Swal.fire({
                              title: 'Switch to Listener?',
                              text: 'You can switch back to artist later from Settings.',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'Yes, switch',
                              cancelButtonText: 'Cancel',
                              confirmButtonColor: '#ef4444',
                              background: '#0a0a0a',
                              color: '#e5e5e5'
                            });
                            if (!r.isConfirmed) return;
                            try {
                              const api = (await import('@/services/api')).default;
                              await api.setArtistStatus(false);
                              await Swal.fire({ title: 'Switched to Listener', icon: 'success', confirmButtonColor: '#10b981', background: '#0a0a0a', color: '#e5e5e5' });
                              navigate('/settings-menu');
                              window.location.reload();
                            } catch (e) {
                              await Swal.fire({ title: 'Failed to switch', icon: 'error', background: '#0a0a0a', color: '#e5e5e5' });
                            }
                          }}
                          className="px-4 py-2 rounded-md border border-red-700 text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          Switch to Listener
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white tracking-tight">Account Settings</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Account Type</h3>
                            <p className="text-zinc-500 text-sm">Your current subscription plan</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium border border-zinc-700 text-zinc-300">
                              {accountType === 'premium' ? 'Premium' : 'Free'}
                            </span>
                            {accountType !== 'premium' ? (
                              <button onClick={() => navigate('/premium')} className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-700 to-gray-800 hover:from-emerald-600 hover:to-gray-700 text-white font-semibold border border-emerald-600/40 hover:border-emerald-500/60 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95 group relative overflow-hidden">
                                <div className="absolute inset-0 -top-1 -left-1 w-[calc(100%+8px)] h-[calc(100%+8px)] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
                                <span className="relative z-10">Upgrade to Premium</span>
                              </button>
                            ) : (
                              <button onClick={handleCancelPremiumClick} className="px-4 py-2 rounded-md border border-red-700 text-red-400 hover:bg-red-900/20 transition-colors">
                                Cancel Premium
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      

                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">Change Password</h3>
                            <p className="text-zinc-500 text-sm">Update your account password</p>
                          </div>
                          <button
                            onClick={() => setShowPasswordForm(v => !v)}
                            className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors"
                          >
                            {showPasswordForm ? 'Hide' : 'Change Password'}
                          </button>
                        </div>

                        {showPasswordForm && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-zinc-400 mb-2">Current Password</label>
                              <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                                placeholder="Enter current password"
                                autoComplete="current-password"
                              />
                              {passwordErrors.currentPassword && (
                                <p className="mt-1 text-sm text-red-400">{passwordErrors.currentPassword}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-400 mb-2">New Password</label>
                              <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                                placeholder="Enter new password"
                                autoComplete="new-password"
                              />
                              {passwordErrors.newPassword && (
                                <p className="mt-1 text-sm text-red-400">{passwordErrors.newPassword}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-400 mb-2">Confirm New Password</label>
                              <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                              />
                              {passwordErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword}</p>
                              )}
                            </div>

                            <div className="md:col-span-2 flex items-center gap-3 mt-2">
                              <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg"
                              >
                                {isChangingPassword ? 'Updating...' : 'Update Password'}
                              </button>
                              <button
                                onClick={() => {
                                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                  setPasswordErrors({});
                                  setShowPasswordForm(false);
                                }}
                                disabled={isChangingPassword}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-red-900/20 border border-red-900/40 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-red-400 font-medium">Delete Account</h3>
                            <p className="text-zinc-500 text-sm">Permanently delete your account and all data</p>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                const Swal = (window as any).Swal;
                                if (!Swal) {
                                  const confirmText = prompt('Type DELETE to confirm account deletion (this deactivates your account)');
                                  if (confirmText !== 'DELETE') return;
                                  const resp: any = await apiService.deleteAccount({ confirmDeletion: 'DELETE' });
                                  if (!resp?.success) throw new Error(resp?.message || 'Failed to delete account');
                                  toast.success('Account deactivated. Logging out...');
                                  await apiService.logout();
                                  navigate('/login');
                                  return;
                                }

                                const result = await Swal.fire({
                                  title: 'Delete Account',
                                  html: '<p class="text-sm text-zinc-400">This will permanently delete your account and all data. Type <b>DELETE</b> to confirm.</p>',
                                  input: 'text',
                                  inputAttributes: { autocapitalize: 'off', placeholder: 'Type DELETE' },
                                  inputValidator: (value: string) => {
                                    if (value !== 'DELETE') return 'Please type DELETE to confirm';
                                    return null as any;
                                  },
                                  showCancelButton: true,
                                  confirmButtonText: 'Yes, delete',
                                  cancelButtonText: 'Cancel',
                                  confirmButtonColor: '#dc2626',
                                  focusCancel: true,
                                  reverseButtons: true,
                                  icon: 'warning',
                                });

                                if (!result.isConfirmed) return;

                                const resp: any = await apiService.deleteAccount({ confirmDeletion: 'DELETE' });
                                if (!resp?.success) throw new Error(resp?.message || 'Failed to delete account');
                                toast.success('Account deactivated. Logging out...');
                                await apiService.logout();
                                navigate('/login');
                              } catch (e: any) {
                                toast.error(e?.message || 'Failed to delete account');
                              }
                            }}
                            className="px-4 py-2 rounded-md border border-red-700 text-red-400 hover:bg-red-900/20 transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>

                      {/* Payment Invoices section removed as requested */}
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
                              onChange={(e) => handleToggleNotification('email', e.target.checked)}
                              disabled={updatingNotifications.email}
                              className="sr-only peer"
                            />
                            <div className={`w-11 h-6 ${updatingNotifications.email ? 'opacity-60' : ''} bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600`}></div>
                          </label>
                          {updatingNotifications.email && (
                            <span className="ml-3 text-xs text-zinc-400">Saving...</span>
                          )}
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
                              onChange={(e) => handleToggleNotification('push', e.target.checked)}
                              disabled={updatingNotifications.push}
                              className="sr-only peer"
                            />
                            <div className={`w-11 h-6 ${updatingNotifications.push ? 'opacity-60' : ''} bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600`}></div>
                          </label>
                          {updatingNotifications.push && (
                            <span className="ml-3 text-xs text-zinc-400">Saving...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab removed as requested */}

                {/* Appearance Tab removed */}

              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default Settings;

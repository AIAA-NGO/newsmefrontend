import { useState, useEffect } from "react";
import { 
  fetchCurrentUser, 
  updateUser, 
  changePassword, 
  uploadProfileImage 
} from "../../services/api";
import { FaUser, FaLock, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const AccountPage = () => {
  const [user, setUser] = useState({});
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState({ 
    current: '', 
    new: '', 
    confirm: '' 
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('/default-profile.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [additionalDetails, setAdditionalDetails] = useState({
    bio: '',
    phone: '',
    address: '',
    website: '',
    socialMedia: {
      twitter: '',
      linkedin: '',
      github: ''
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchCurrentUser();
        
        if (error) {
          setError(error.message);
          return;
        }

        if (data) {
          setUser(data);
          setForm({
            name: data.fullName || '',
            email: data.email || '',
            username: data.username || ''
          });
          
          setPreviewImage(data.profileImage || '/default-profile.png');
          
          if (data.additionalDetails) {
            setAdditionalDetails(data.additionalDetails);
          }
        }
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedData = { 
        ...form,
        additionalDetails
      };

      // First upload image if changed
      if (profileImage) {
        const { data: uploadData, error: uploadError } = await uploadProfileImage(
          user.id, 
          profileImage
        );
        
        if (uploadError) {
          throw new Error(uploadError.message);
        }
        
        updatedData.profileImage = uploadData.url;
        setPreviewImage(uploadData.url);
      }

      // Then update user data
      const { error: updateError } = await updateUser(
        user.id, 
        updatedData
      );
      
      if (updateError) {
        throw new Error(updateError.message);
      }

      setUser(updatedData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setEdit(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      return setError("New passwords do not match");
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await changePassword(user.id, {
        oldPassword: passwordData.current,
        newPassword: passwordData.new
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError(err.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMediaChange = (platform, value) => {
    setAdditionalDetails(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  if (loading && !user.id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-4 md:mt-10 bg-white rounded-lg shadow-md">
      {/* Notification Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {success}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
        >
          <FaUser className="inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
        >
          <FaLock className="inline mr-2" />
          Password
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 font-medium ${activeTab === 'social' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
        >
          <FaTwitter className="inline mr-2" />
          Social Media
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-gray-200"
                />
                {edit && (
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                    <label className="cursor-pointer">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfileImage(file);
                            setPreviewImage(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow space-y-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  disabled={!edit}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  disabled
                  value={form.username}
                  className="border border-gray-300 rounded-md p-2 w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  disabled
                  value={form.email}
                  className="border border-gray-300 rounded-md p-2 w-full bg-gray-100"
                />
              </div>
            </div>
          </div>

          {edit && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={additionalDetails.bio}
                  onChange={(e) => setAdditionalDetails({...additionalDetails, bio: e.target.value})}
                  rows="3"
                  className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={additionalDetails.phone}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, phone: e.target.value})}
                    className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    value={additionalDetails.website}
                    onChange={(e) => setAdditionalDetails({...additionalDetails, website: e.target.value})}
                    className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={additionalDetails.address}
                  onChange={(e) => setAdditionalDetails({...additionalDetails, address: e.target.value})}
                  rows="2"
                  className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {edit ? (
              <>
                <button
                  onClick={() => {
                    setEdit(false);
                    setForm({
                      name: user.fullName || '',
                      email: user.email || '',
                      username: user.username || ''
                    });
                    setAdditionalDetails(user.additionalDetails || {
                      bio: '',
                      phone: '',
                      address: '',
                      website: '',
                      socialMedia: {
                        twitter: '',
                        linkedin: '',
                        github: ''
                      }
                    });
                    setPreviewImage(user.profileImage || '/default-profile.png');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter current password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500 pl-10"
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter new password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500 pl-10"
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters with at least one number and one special character</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500 pl-10"
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleChangePassword}
              disabled={loading || !passwordData.current || !passwordData.new || !passwordData.confirm}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <FaTwitter className="text-blue-400" />
              </span>
              <input
                type="text"
                value={additionalDetails.socialMedia.twitter}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <FaLinkedin className="text-blue-600" />
              </span>
              <input
                type="text"
                value={additionalDetails.socialMedia.linkedin}
                onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <FaGithub className="text-gray-800" />
              </span>
              <input
                type="text"
                value={additionalDetails.socialMedia.github}
                onChange={(e) => handleSocialMediaChange('github', e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="username"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Social Profiles'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
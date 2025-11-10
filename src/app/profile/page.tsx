'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Settings, { translations } from '@/components/Settings';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  // Load language
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);

    const handleLanguageChange = () => {
      const newLang = localStorage.getItem('lang') || 'en';
      setLang(newLang);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // Translation function
  const t = (key: string): string => {
    return translations[lang as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({ name: user.name, phone: user.phone || '' });
    }
    setLoading(false);
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await updateProfile(formData.name, formData.phone);
      setMessage({ type: 'success', text: t('profileUpdatedSuccessfully') || 'Profile updated successfully!' });
      setEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: t('failedToUpdateProfile') || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="text-center text-gray-600">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl">🚴</span>
              <h1 className="text-2xl font-bold">BikeMarket</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                {t('home')}
              </Link>
              <Link href="/catalog" className="text-gray-700 hover:text-blue-600">
                {t('catalog')}
              </Link>
              <Link href="/sell" className="text-gray-700 hover:text-blue-600">
                {t('sell')}
              </Link>
              <Settings />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl">
                👤
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('accountType') || 'Account Type'}: <span className="font-semibold capitalize">{user?.user_type}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {t('memberSince') || 'Member since'} {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                {t('logout') || 'Logout'}
              </button>
            </div>

            {/* Seller Stats */}
            {user?.user_type === 'business' && (
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">42</p>
                  <p className="text-gray-600">Active Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">4.8★</p>
                  <p className="text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">€12,450</p>
                  <p className="text-gray-600">Total Sales</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-4 px-6 font-semibold border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {t('personalInfo') || 'Personal Info'}
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`flex-1 py-4 px-6 font-semibold border-b-2 transition-colors ${
                    activeTab === 'listings'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {t('myListings') || 'My Listings'}
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex-1 py-4 px-6 font-semibold border-b-2 transition-colors ${
                    activeTab === 'favorites'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {t('favorites') || 'Favorites'}
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 py-4 px-6 font-semibold border-b-2 transition-colors ${
                    activeTab === 'messages'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {t('messages') || 'Messages'}
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Personal Info Tab */}
              {activeTab === 'info' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('personalInformation') || 'Personal Information'}</h2>

                  {message && (
                    <div
                      className={`mb-4 p-4 rounded-lg ${
                        message.type === 'success'
                          ? 'bg-green-100 text-green-700 border border-green-400'
                          : 'bg-red-100 text-red-700 border border-red-400'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  {!editing ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 text-sm">{t('fullName') || 'Full Name'}</p>
                        <p className="text-gray-900 font-semibold">{user?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">{t('email') || 'Email'}</p>
                        <p className="text-gray-900 font-semibold">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">{t('phone') || 'Phone'}</p>
                        <p className="text-gray-900 font-semibold">{user?.phone || t('notProvided') || 'Not provided'}</p>
                      </div>
                      <button
                        onClick={() => setEditing(true)}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                      >
                        {t('editProfile') || 'Edit Profile'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                      <div>
                        <label className="block text-gray-600 text-sm mb-2">{t('fullName') || 'Full Name'}</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-2">{t('phone') || 'Phone'}</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                          {t('saveChanges') || 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                          {t('cancel') || 'Cancel'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* My Listings Tab */}
              {activeTab === 'listings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{t('myListings') || 'My Listings'}</h2>
                    <Link
                      href="/sell"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                    >
                      {t('createNewListing') || 'Create New Listing'}
                    </Link>
                  </div>
                  <div className="text-center py-12 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">{t('noListingsYet') || "You don't have any listings yet"}</p>
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('favoritedListings') || 'Favorited Listings'}</h2>
                  <div className="text-center py-12 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">{t('noFavoritesYet') || "You haven't favorited any listings yet"}</p>
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('messages') || 'Messages'}</h2>
                  <div className="text-center py-12 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">{t('noMessages') || 'No messages yet'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

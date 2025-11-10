'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
import Settings, { translations } from '@/components/Settings';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const { isAuthenticated, user } = useAuth();
  const [lang, setLang] = useState('en');

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

  const t = (key: string): string => {
    return translations[lang as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🚴</span>
              <h1 className="text-2xl font-bold">BikeMarket</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">{t('home')}</Link>
              <Link href="/catalog" className="text-gray-700 hover:text-blue-600">{t('catalog')}</Link>
              <Link href="/sell" className="text-gray-700 hover:text-blue-600">{t('sell')}</Link>
              <Settings />
              {isAuthenticated ? (
                <Link href="/profile" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  👤 {user?.name || t('profile')}
                </Link>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">{t('login')}</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <RegisterForm />
        </div>
      </main>
    </>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Settings, { translations } from '@/components/Settings';
import PhotoUploader from '@/components/PhotoUploader';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SellPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [lang, setLang] = useState('en');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const brands = ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Merida', 'Cube', 'Canyon', 'Orbea', 'Bianchi'];

  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    year: '',
    price: '',
    description: '',
    photos: [] as any[],
  });

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);

    const handleLangChange = () => {
      const newLang = localStorage.getItem('lang') || 'en';
      setLang(newLang);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = (key: string) => translations[lang as keyof typeof translations][key as keyof typeof translations.en] || key;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handlePublish = async () => {
    // Validate form
    if (!formData.brand || !formData.year || !formData.price || !formData.description) {
      setError(t('allFieldsRequired') || 'All fields are required');
      return;
    }

    if (formData.photos.length === 0) {
      setError(t('photosRequired') || 'At least one photo is required');
      return;
    }

    setLoading(true);
    try {
      // Check authentication
      if (!isAuthenticated || !user) {
        setError('You must be logged in to create a listing');
        router.push('/login');
        return;
      }

      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        router.push('/login');
        return;
      }

      console.log('Publishing listing with token:', token.substring(0, 20) + '...');

      // Create FormData for multipart upload
      const data = new FormData();
      data.append('brand', formData.brand);
      data.append('model', formData.brand); // Use brand as model if not separately provided
      data.append('year', String(formData.year)); // Ensure year is string for Zod validation
      data.append('price', String(formData.price)); // Ensure price is string for Zod validation
      data.append('description', formData.description);

      // Add photos
      formData.photos.forEach((photo) => {
        console.log('Adding photo:', photo.file.name);
        data.append('photos', photo.file);
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('Sending to:', apiUrl + '/listings');

      const response = await fetch(`${apiUrl}/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error('Error response text:', text);
        }
        throw new Error(errorMessage);
      }

      const result = (await response.json()) as any;
      console.log('Server response:', result);

      const listingId = result.id || result.listing?.id;
      if (!listingId) {
        throw new Error('No listing ID returned from server');
      }

      // Success - redirect to listing
      router.push(`/listing?id=${listingId}`);
    } catch (err) {
      const errorMsg = (err as any).message || 'Error creating listing';
      console.error('Publish error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/sell" className="text-blue-600 font-medium">{t('sell')}</Link>
              <Settings />
              {isAuthenticated ? (
                <Link href="/profile" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  👤 {user?.name || t('profile')}
                </Link>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">{t('login')}</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>{t('basicInfo')}</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>{t('details')}</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>{t('photos')}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6">
            {step === 1 && t('basicInfo')}
            {step === 2 && t('details')}
            {step === 3 && t('photos')}
          </h2>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('brand')} *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  <option value="">{t('selectBrand')}</option>
                  {brands.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('year')} *</label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  <option value="">{t('selectYear')}</option>
                  {[2025, 2024, 2023, 2022, 2021, 2020].map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <button onClick={() => setStep(2)} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {t('next')} →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('priceEuro')} *</label>
                <input
                  type="number"
                  placeholder="2500"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('description')} *</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder={t('describeBike')}
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">← {t('back')}</button>
                <button onClick={() => setStep(3)} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t('next')} →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📸 {t('photoRequirements')}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ {t('minimum6Photos') || 'Minimum 6 photos'}</li>
                  <li>✓ {t('fullBikeLeft') || 'Full bike from left side'}</li>
                  <li>✓ {t('fullBikeRight') || 'Full bike from right side'}</li>
                  <li>✓ {t('dragToReorder') || 'Drag to reorder'}</li>
                </ul>
              </div>

              <PhotoUploader photos={formData.photos} setPhotos={(photos) => handleInputChange('photos', photos)} />

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">← {t('back')}</button>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Publishing...' : `✓ ${t('publish')}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

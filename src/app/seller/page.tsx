'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { useAuth } from '@/contexts/AuthContext';
import Settings from '@/components/Settings';
import { translations } from '@/components/Settings';

function SellerContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const { user, isAuthenticated } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [sellerListings, setSellerListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState('');
  const [langLoaded, setLangLoaded] = useState(false);

  // Load language
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);
    setLangLoaded(true);

    const handleLanguageChange = () => {
      const newLang = localStorage.getItem('lang') || 'en';
      setLang(newLang);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // Translation function
  const t = (key: string): string => {
    const currentLang = lang && langLoaded ? lang : 'en';
    const translated = (translations as any)[currentLang]?.[key] || (translations as any)['en']?.[key] || key;
    return translated;
  };

  // Load seller data and listings
  useEffect(() => {
    if (!userId) {
      setError('No seller ID provided');
      setLoading(false);
      return;
    }

    const fetchSellerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch seller details
        const sellerResponse = (await api.getUser(userId)) as any;
        setSeller(sellerResponse.user || sellerResponse);

        // Fetch seller's listings
        try {
          const listingsResponse = (await api.getListings({ limit: 100 })) as any;
          const allListings = listingsResponse.listings || [];
          const sellerListingsList = allListings.filter((listing: any) => listing.user_id === userId);
          setSellerListings(sellerListingsList);
        } catch (err) {
          console.error('Error fetching seller listings:', err);
          setSellerListings([]);
        }
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError('Failed to load seller profile');
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [userId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </main>
    );
  }

  if (error || !seller) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-red-600 mb-4">{error || t('sellerNotFound') || 'Seller not found'}</p>
          <Link href="/catalog" className="text-blue-600 hover:underline">
            {t('backToCatalog')}
          </Link>
        </div>
      </main>
    );
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Seller Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {seller.full_name || seller.name || 'Anonymous Seller'}
              </h1>
              {seller.created_at && (
                <p className="text-gray-600 mb-4">
                  📅 {t('memberSince')} {new Date(seller.created_at).toLocaleDateString(lang)}
                </p>
              )}

              {/* Contact Methods */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3">{t('contactMethods') || 'Contact Methods'}</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Phone */}
                  {seller.phone && (
                    <a
                      href={`tel:${seller.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                      title={`Call: ${seller.phone}`}
                    >
                      <span className="text-lg">☎️</span>
                      <span className="text-sm font-medium">{t('phone') || 'Phone'}</span>
                    </a>
                  )}

                  {/* Telegram */}
                  {seller.telegram && (
                    <a
                      href={`https://t.me/${seller.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                      title={`Telegram: ${seller.telegram}`}
                    >
                      <span className="text-lg">✈️</span>
                      <span className="text-sm font-medium">{t('telegram') || 'Telegram'}</span>
                    </a>
                  )}

                  {/* WhatsApp */}
                  {seller.whatsapp && (
                    <a
                      href={`https://wa.me/${seller.whatsapp.replace(/[^\d+]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                      title={`WhatsApp: ${seller.whatsapp}`}
                    >
                      <span className="text-lg">💬</span>
                      <span className="text-sm font-medium">{t('whatsapp') || 'WhatsApp'}</span>
                    </a>
                  )}

                  {/* Email */}
                  {seller.email && (
                    <a
                      href={`mailto:${seller.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
                      title={`Email: ${seller.email}`}
                    >
                      <span className="text-lg">📧</span>
                      <span className="text-sm font-medium">{t('email') || 'Email'}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {sellerListings.length}
                </p>
                <p className="text-gray-600 text-sm">
                  {t('activeListings') || 'Active Listings'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-500">★ 4.8</p>
                <p className="text-gray-600 text-sm">
                  {t('rating') || 'Rating'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">98%</p>
                <p className="text-gray-600 text-sm">
                  {t('positive') || 'Positive Feedback'}
                </p>
              </div>
            </div>
          </div>

          {/* Seller's Listings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('activeListing') || 'Active Listings'} ({sellerListings.length})
            </h2>

            {sellerListings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">
                  {t('noListings') || 'This seller has no active listings'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sellerListings.map((listing: any) => {
                  const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos || [];
                  const mainPhoto = photos[0] ? getImageUrl(photos[0]) : '/placeholder-bike.jpg';

                  return (
                    <Link
                      key={listing.id}
                      href={`/listing?id=${listing.id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                    >
                      {/* Photo */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={mainPhoto}
                          alt={listing.model_name}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                        <span className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          €{listing.price}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2">
                          {listing.model_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {listing.description?.substring(0, 80)}...
                        </p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {listing.condition && listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                          </span>
                          {listing.created_at && (
                            <span>
                              {new Date(listing.created_at).toLocaleDateString(lang)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function SellerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SellerContent />
    </Suspense>
  );
}

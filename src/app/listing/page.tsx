'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { useAuth } from '@/contexts/AuthContext';
import Settings from '@/components/Settings';
import { translations } from '@/components/Settings';

function ListingContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [lang, setLang] = useState('en');

  // Load language
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);

    // Listen for language changes
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

  // Load listing
  useEffect(() => {
    if (!listingId) {
      setError('No listing ID provided');
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await api.getListing(listingId)) as any;
        setListing(response.listing);

        // Check if favorited
        const favorites = localStorage.getItem('favorites') || '[]';
        const favList = JSON.parse(favorites);
        setIsFavorited(favList.includes(listingId));
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleFavorite = () => {
    const favorites = localStorage.getItem('favorites') || '[]';
    let favList = JSON.parse(favorites);

    if (isFavorited) {
      favList = favList.filter((id: string) => id !== listingId);
    } else {
      favList.push(listingId);
    }

    localStorage.setItem('favorites', JSON.stringify(favList));
    setIsFavorited(!isFavorited);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-red-600 mb-4">{error || 'Listing not found'}</p>
          <Link href="/catalog" className="text-blue-600 hover:underline">
            Back to Catalog
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
              <Link href="/sell" className="text-gray-700 hover:text-blue-600">
                {t('sell')}
              </Link>
              <Settings />
              {isAuthenticated ? (
                <Link href="/profile" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Profile
                </Link>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Gallery */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {listing.photos && (typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos).length > 0 ? (
              <div className="bg-gray-300 flex items-center justify-center h-96 overflow-hidden">
                <img
                  src={getImageUrl((typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos)[0].url)}
                  alt={listing.model_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-gray-300 flex items-center justify-center h-96 text-6xl">
                🚴
              </div>
            )}
            {listing.photos && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {(typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos).map((photo: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg cursor-pointer hover:opacity-75 flex items-center justify-center text-3xl">
                    {photo.url ? (
                      <img src={getImageUrl(photo.url)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      '🖼️'
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Price */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {listing.model_name}
                </h1>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    €{listing.price}
                  </span>
                  <span className="text-gray-500">{listing.currency}</span>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y">
                  <div>
                    <p className="text-gray-600 text-sm">Condition</p>
                    <p className="font-semibold text-gray-900">{listing.condition}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Year</p>
                    <p className="font-semibold text-gray-900">{listing.year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Material</p>
                    <p className="font-semibold text-gray-900">{listing.material || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Type</p>
                    <p className="font-semibold text-gray-900">{listing.type}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {/* Location */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <p className="text-gray-700">{listing.location}</p>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-semibold">{listing.condition}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold">{listing.type}</span>
                  </div>
                  {listing.material && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Material</span>
                      <span className="font-semibold">{listing.material}</span>
                    </div>
                  )}
                  {listing.year && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Year</span>
                      <span className="font-semibold">{listing.year}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-semibold">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Seller Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seller</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{listing.seller_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">⭐ 4.8 (42 reviews)</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-2">
                  View Seller Profile
                </button>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  💬 Contact Seller
                </button>
                <button
                  onClick={handleFavorite}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isFavorited
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
                </button>
                {isAuthenticated && user?.user_type === 'individual' && (
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    🛒 Buy Now
                  </button>
                )}
              </div>

              {/* Share */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Share</h3>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm">
                    f
                  </button>
                  <button className="flex-1 bg-sky-400 hover:bg-sky-500 text-white py-2 rounded-lg text-sm">
                    𝕏
                  </button>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm">
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-yellow-900 mb-3">Safety Tips</h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>✓ Meet in public places</li>
                  <li>✓ Check item before payment</li>
                  <li>✓ Use BikeMarket payment</li>
                  <li>✓ Report suspicious activity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Listings */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gray-300 h-40 flex items-center justify-center text-4xl">🚴</div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">Similar Bike {i}</h3>
                    <p className="text-sm text-gray-600">2023 • Good condition</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">€1,200</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ListingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <ListingContent />
    </Suspense>
  );
}

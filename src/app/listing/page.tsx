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
  const [lang, setLang] = useState('');
  const [langLoaded, setLangLoaded] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  // Load language
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);
    setLangLoaded(true);

    // Listen for language changes
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem('lang') || 'en';
      console.log('Language changed to:', newLang);
      setLang(newLang);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // Force re-render when language changes
  useEffect(() => {
    // This dependency will cause re-render when lang changes
  }, [lang, langLoaded]);

  // Translation function
  const t = (key: string): string => {
    // Make sure lang is set correctly - use 'en' as fallback if lang not loaded yet
    const currentLang = lang && langLoaded ? lang : 'en';
    const translated = (translations as any)[currentLang]?.[key] || (translations as any)['en']?.[key] || key;
    return translated;
  };

  // Translate condition values
  const getConditionTranslation = (condition: string): string => {
    const conditionMap: {[key: string]: string} = {
      'used': 'used',
      'new': 'new',
      'like-new': 'likeNew',
      'damaged': 'damaged'
    };
    return t(conditionMap[condition.toLowerCase()] || condition);
  };

  // Translate type values
  const getTypeTranslation = (type: string): string => {
    const typeMap: {[key: string]: string} = {
      'road': 'road',
      'road bike': 'road',
      'mountain bike': 'mountain_bike',
      'mountain': 'mountain_bike',
      'gravel': 'gravel',
      'hybrid': 'hybrid',
      'bmx': 'bmx',
      'kids': 'kids'
    };
    return t(typeMap[type.toLowerCase()] || type);
  };

  // Format seller name (e.g., "Sergei Martonov" → "Sergei M.")
  const formatSellerName = (fullName: string): string => {
    if (!fullName) return 'Anonymous';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
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

  // Handle contact seller - redirect to messages
  const handleContactSeller = () => {
    if (!isAuthenticated) {
      alert('Please login to contact seller');
      return;
    }
    // Redirect to messages page with seller user_id
    window.location.href = `/messages?seller_id=${listing.user_id}`;
  };

  // Handle buy now - redirect to checkout
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Please login to buy');
      return;
    }
    // Redirect to checkout with listing_id
    window.location.href = `/checkout?listing_id=${listingId}`;
  };

  // Handle share on Facebook
  const handleShareFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  // Handle share on X (Twitter)
  const handleShareX = () => {
    const url = window.location.href;
    const text = `Check out this ${listing.model_name} on BikeMarket!`;
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  };

  // Handle share on WhatsApp
  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out this ${listing.model_name} on BikeMarket! ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Navigate to previous photo
  const handlePrevPhoto = () => {
    if (!listing.photos) return;
    const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos;
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  // Navigate to next photo
  const handleNextPhoto = () => {
    if (!listing.photos) return;
    const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  // Handle touch start for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // Handle touch end for swipe
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Swipe left (more than 50px) = next photo
    if (diff > 50) {
      handleNextPhoto();
    }
    // Swipe right (more than 50px) = previous photo
    else if (diff < -50) {
      handlePrevPhoto();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">{t('loadingListing')}</p>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-red-600 mb-4">{error || t('listingNotFound') || 'Listing not found'}</p>
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
              <Link href="/sell" className="text-gray-700 hover:text-blue-600">
                {t('sell')}
              </Link>
              <Settings />
              {isAuthenticated ? (
                <Link href="/profile" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  {t('profile')}
                </Link>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {t('login')}
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
              <div
                className="bg-gray-300 flex items-center justify-center h-96 overflow-hidden relative group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={getImageUrl((typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos)[selectedPhotoIndex].url)}
                  alt={listing.model_name}
                  className="w-full h-full object-cover"
                />

                {/* Left arrow button */}
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous photo"
                >
                  ←
                </button>

                {/* Right arrow button */}
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next photo"
                >
                  →
                </button>

                {/* Photo counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedPhotoIndex + 1} / {(typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos).length}
                </div>
              </div>
            ) : (
              <div className="bg-gray-300 flex items-center justify-center h-96 text-6xl">
                🚴
              </div>
            )}
            {listing.photos && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {(typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos).map((photo: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg cursor-pointer hover:opacity-75 flex items-center justify-center text-3xl transition-all ${
                      selectedPhotoIndex === idx ? 'ring-2 ring-blue-500' : 'bg-gray-200'
                    }`}
                  >
                    {photo.url ? (
                      <img src={getImageUrl(photo.url)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
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
                    <p className="text-gray-600 text-sm">{t('condition')}</p>
                    <p className="font-semibold text-gray-900">{getConditionTranslation(listing.condition)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{t('year')}</p>
                    <p className="font-semibold text-gray-900">{listing.year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{t('material')}</p>
                    <p className="font-semibold text-gray-900">{listing.material || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{t('type')}</p>
                    <p className="font-semibold text-gray-900">{getTypeTranslation(listing.type)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('description')}</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {/* Location */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('location')}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <p className="text-gray-700">{listing.location}</p>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('specifications')}</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('condition')}</span>
                    <span className="font-semibold">{getConditionTranslation(listing.condition)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('type')}</span>
                    <span className="font-semibold">{getTypeTranslation(listing.type)}</span>
                  </div>
                  {listing.material && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{t('material')}</span>
                      <span className="font-semibold">{listing.material}</span>
                    </div>
                  )}
                  {listing.year && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{t('year')}</span>
                      <span className="font-semibold">{listing.year}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('posted')}</span>
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('seller')}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formatSellerName(listing.seller_name)}</p>
                    <p className="text-sm text-gray-500">⭐ 4.8 (42 reviews)</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-2">
                  {t('viewSellerProfile')}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
                <button
                  onClick={handleContactSeller}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  💬 {t('contactSeller')}
                </button>
                <button
                  onClick={handleFavorite}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isFavorited
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {isFavorited ? `❤️ ${t('favorited')}` : `🤍 ${t('addToFavorites')}`}
                </button>
                {isAuthenticated && user?.user_type === 'individual' && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    🛒 {t('buyNow')}
                  </button>
                )}
              </div>

              {/* Share */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('share')}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareFacebook}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                    title="Share on Facebook"
                  >
                    f
                  </button>
                  <button
                    onClick={handleShareX}
                    className="flex-1 bg-sky-400 hover:bg-sky-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                    title="Share on X"
                  >
                    𝕏
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                    title="Share on WhatsApp"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                    title="Copy link"
                  >
                    🔗
                  </button>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-yellow-900 mb-3">{t('safetyTips')}</h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>✓ {t('meetInPublic')}</li>
                  <li>✓ {t('checkBeforePayment')}</li>
                  <li>✓ {t('useBikeMarketPayment')}</li>
                  <li>✓ {t('reportSuspicious')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Listings */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('relatedListings')}</h2>
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

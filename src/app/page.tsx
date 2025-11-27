'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Settings, { translations } from '@/components/Settings';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';


// Category keys that will be translated using t() function
const CATEGORY_KEYS = ['all', 'roadBikes', 'mountainBikes', 'gravelBikes', 'components', 'parts'];
const BRANDS = ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Merida', 'Cube', 'Canyon', 'Orbea', 'Bianchi'];

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'oldest';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [lang, setLang] = useState('');
  const [langLoaded, setLangLoaded] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [latestListings, setLatestListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);
    setLangLoaded(true);

    const handleLangChange = () => {
      const newLang = localStorage.getItem('lang') || 'en';
      setLang(newLang);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Fetch latest listings
  useEffect(() => {
    const fetchLatestListings = async () => {
      try {
        setListingsLoading(true);
        const response = (await api.getListings({ limit: 8 })) as any;
        setLatestListings(response.listings || []);
        setListingsError(null);
      } catch (err) {
        console.error('Error fetching latest listings:', err);
        setListingsError((err as any).message || 'Failed to load listings');
        setLatestListings([]);
      } finally {
        setListingsLoading(false);
      }
    };
    fetchLatestListings();
  }, []);

  const t = (key: string) => {
    const currentLang = lang && langLoaded ? lang : 'en';
    return (translations as any)[currentLang][key as keyof typeof translations.en] || key;
  };

  // Fetch listings based on search query
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = (await api.getListings({
          ...(searchQuery.trim() && { search: searchQuery }),
          limit: 50,
        })) as any;

        let listings = response.listings || [];

        // Sort listings
        listings.sort((a: any, b: any) => {
          const priceA = parseInt(a.price) || 0;
          const priceB = parseInt(b.price) || 0;
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();

          switch (sortBy) {
            case 'price_asc':
              return priceA - priceB;
            case 'price_desc':
              return priceB - priceA;
            case 'newest':
              return dateB - dateA;
            case 'oldest':
              return dateA - dateB;
            default:
              return 0;
          }
        });

        setSearchResults(listings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if search results are being shown
    if (showSearchResults) {
      fetchListings();
    }
  }, [searchQuery, sortBy, showSearchResults]);

  // Handle search initiation
  const handleSearch = () => {
    setShowSearchResults(true);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🚴</span>
              <h1 className="text-2xl font-bold dark:text-white">BikeMarket</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 font-medium dark:text-blue-400">{t('home')}</Link>
              <Link href="/catalog" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">{t('catalog')}</Link>
              <Link href="/sell" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">{t('sell')}</Link>
              <Settings />
              {isAuthenticated ? (
                <Link href="/profile" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors dark:bg-green-700 dark:hover:bg-green-800">
                  👤 {user?.name || t('profile')}
                </Link>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors dark:bg-blue-700 dark:hover:bg-blue-800">{t('login')}</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`${!showSearchResults ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900' : 'bg-white dark:bg-gray-800'} text-white transition-colors py-20`}>
        <div className={`max-w-7xl mx-auto px-4 ${!showSearchResults ? 'text-center' : ''}`}>
          {!showSearchResults && (
            <>
              <h2 className="text-5xl font-bold mb-4">{t('hero_title') || 'Find Your Perfect Bike'}</h2>
              <p className="text-xl mb-8 opacity-90">{t('hero_subtitle') || 'Buy and sell bikes, components, and parts in Estonia'}</p>
            </>
          )}
          <div className={`flex gap-4 ${!showSearchResults ? 'justify-center max-w-2xl mx-auto' : 'justify-between items-center'}`}>
            <input
              type="text"
              placeholder={t('search_placeholder') || 'Search for bikes, brands, models...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className={`flex-1 px-4 py-3 rounded-lg ${showSearchResults ? 'text-gray-800 dark:text-gray-900' : 'text-gray-800 dark:text-gray-900'}`}
            />
            <button
              onClick={handleSearch}
              className={`px-8 py-3 font-bold rounded-lg transition-colors cursor-pointer ${
                showSearchResults
                  ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
              }`}
            >
              {t('search') || 'Search'}
            </button>
          </div>

          {/* Sort Options - Show only when search results are displayed */}
          {showSearchResults && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{t('sort_by') || 'Sort by'}:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('price_asc')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'price_asc'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  💰 {t('cheapest_first') || 'Cheapest First'}
                </button>
                <button
                  onClick={() => setSortBy('price_desc')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'price_desc'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  💰 {t('most_expensive_first') || 'Most Expensive First'}
                </button>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  ✨ {t('newest_first') || 'Newest First'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Results Section */}
      {showSearchResults && (
        <section className="bg-gray-50 dark:bg-gray-900 py-12 border-b dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {searchQuery.trim()
                ? `${t('search_results') || 'Search Results'}: "${searchQuery}"`
                : t('all_listings') || 'All Listings'}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('loading') || 'Loading listings...'}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery.trim()
                    ? `${t('no_results_found') || 'No results found'} "${searchQuery}"`
                    : t('no_listings_available') || 'No listings available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((listing: any) => {
                  const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos || [];
                  const firstPhoto = photos.length > 0 ? photos[0] : null;
                  const description = listing.description ? listing.description.substring(0, 100) + (listing.description.length > 100 ? '...' : '') : '';

                  return (
                    <Link
                      key={listing.id}
                      href={`/listing?id=${listing.id}`}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border dark:border-gray-700"
                    >
                      {firstPhoto ? (
                        <div className="relative bg-gray-200 h-40 overflow-hidden">
                          <img
                            src={getImageUrl(firstPhoto.url)}
                            alt={listing.model_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center h-40 text-4xl">🚴</div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg dark:text-white">{listing.model_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{listing.year} • {listing.condition}</p>
                        {description && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">{description}</p>
                        )}
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">€{listing.price}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">{listing.location}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className={`${showSearchResults ? 'hidden' : ''} max-w-7xl mx-auto px-4 py-12`}>
        {/* Categories Section */}
        <div className="mb-12">
          <section className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 dark:text-white">{t('browse_categories') || 'Browse by Category'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORY_KEYS.map(catKey => (
                <button
                  key={catKey}
                  className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                >
                  {t(catKey)}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Brands Section */}
        <div className="mb-12">
          <section className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 dark:text-white">{t('popular_brands') || 'Popular Brands'}</h2>
            <div className="flex flex-wrap gap-4">
              {BRANDS.map(brand => (
                <button
                  key={brand}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
                >
                  {brand}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Latest Listings */}
        <div className="mb-12">
          <section className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold dark:text-white">{t('latest_listings') || 'Latest Listings'}</h2>
              <Link href="/catalog" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                {t('view_all') || 'View all'} →
              </Link>
            </div>

            {listingsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('loading') || 'Loading listings...'}</p>
              </div>
            ) : latestListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('no_listings_yet') || 'No listings yet. Create first!'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestListings.slice(0, 8).map(listing => {
                  const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos || [];
                  const firstPhoto = photos.length > 0 ? photos[0] : null;

                  return (
                    <Link
                      key={listing.id}
                      href={`/listing?id=${listing.id}`}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border dark:border-gray-600"
                    >
                      {firstPhoto ? (
                        <div className="relative bg-gray-200 h-40 overflow-hidden">
                          <img
                            src={getImageUrl(firstPhoto.url)}
                            alt={listing.model_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-200 dark:bg-gray-600 h-40 flex items-center justify-center text-5xl">🚴</div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg dark:text-white">{listing.model_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{listing.year} • {listing.condition}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">€{listing.price}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-500">{listing.location}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* How It Works */}
        <div className="mt-12 mb-12">
          <section className="py-12 px-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">{t('how_it_works') || 'How It Works'}</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">1. {t('search') || 'Search'}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('search_desc') || 'Find the perfect bike using our advanced filters'}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">2. {t('connect') || 'Connect'}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('connect_desc') || 'Message the seller and arrange a viewing'}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">3. {t('buy') || 'Buy'}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('buy_desc') || 'Complete the transaction safely and ride away!'}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">BikeMarket</h3>
            <p className="text-gray-400">{t('marketplace_tagline') || "Estonia's leading bicycle marketplace"}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t('for_buyers') || 'For Buyers'}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">{t('browse_bikes') || 'Browse Bikes'}</a></li>
              <li><a href="#" className="hover:text-white">{t('how_to_buy') || 'How to Buy'}</a></li>
              <li><a href="#" className="hover:text-white">{t('safety_tips') || 'Safety Tips'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t('for_sellers') || 'For Sellers'}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">{t('create_listing') || 'Create Listing'}</a></li>
              <li><a href="#" className="hover:text-white">{t('pricing') || 'Pricing'}</a></li>
              <li><a href="#" className="hover:text-white">{t('business_accounts') || 'Business Accounts'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t('support') || 'Support'}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">{t('faq') || 'FAQ'}</a></li>
              <li><a href="#" className="hover:text-white">{t('contact_us') || 'Contact Us'}</a></li>
              <li><a href="#" className="hover:text-white">{t('terms_of_service') || 'Terms of Service'}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>{t('copyrightText')}</p>
        </div>
      </footer>

      {/* Advertisement Space */}
      <div className="bg-yellow-100 dark:bg-yellow-900 border-t-2 border-yellow-400 py-2 px-4 text-center text-sm">
        {t('adSpace')}
        <span className="ml-4 text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">{t('hideAdUsers')}</span>
      </div>
    </div>
  );
}

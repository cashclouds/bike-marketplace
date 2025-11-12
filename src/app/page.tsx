'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Settings, { translations } from '@/components/Settings';
import EditableBlock from '@/components/EditableBlock';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuth } from '@/contexts/AuthContext';

const SAMPLE_LISTINGS = [
  { id: 1, brand: 'Trek', model: 'Domane SL 5', year: 2023, price: 2500, location: 'Tallinn', condition: 'Excellent', category: 'Road Bike' },
  { id: 2, brand: 'Giant', model: 'TCR Advanced', year: 2024, price: 3200, location: 'Tartu', condition: 'New', category: 'Road Bike' },
  { id: 3, brand: 'Specialized', model: 'Stumpjumper', year: 2022, price: 2800, location: 'Tallinn', condition: 'Good', category: 'Mountain Bike' },
  { id: 4, brand: 'Cannondale', model: 'SuperSix EVO', year: 2023, price: 4500, location: 'Parnu', condition: 'Excellent', category: 'Road Bike' },
  { id: 5, brand: 'Scott', model: 'Spark RC 900', year: 2024, price: 5200, location: 'Tallinn', condition: 'New', category: 'Mountain Bike' },
  { id: 6, brand: 'Canyon', model: 'Grail CF SL 7', year: 2023, price: 2900, location: 'Tallinn', condition: 'Excellent', category: 'Gravel Bike' },
];

const CATEGORIES = ['All', 'Road Bikes', 'Mountain Bikes', 'Gravel Bikes', 'Components', 'Parts'];
const BRANDS = ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Merida', 'Cube', 'Canyon', 'Orbea', 'Bianchi'];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [lang, setLang] = useState('en');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to catalog with search parameter
      const params = new URLSearchParams({ search: searchQuery });
      window.location.href = `/catalog?${params.toString()}`;
    }
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">{t('hero_title') || 'Find Your Perfect Bike'}</h2>
          <p className="text-xl mb-8 opacity-90">{t('hero_subtitle') || 'Buy and sell bikes, components, and parts in Estonia'}</p>
          <div className="flex gap-4 justify-center max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={t('search_placeholder') || 'Search for bikes, brands, models...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 dark:text-gray-900"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors cursor-pointer"
            >
              {t('search') || 'Search'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories Section */}
        <EditableBlock id="section-categories" defaultWidth="100%">
          <section className="mb-12 p-4 bg-white dark:bg-gray-800 rounded-lg h-full">
            <h2 className="text-3xl font-bold mb-6 dark:text-white no-drag">{t('browse_categories') || 'Browse by Category'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 no-drag">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
        </EditableBlock>

        {/* Brands Section */}
        <EditableBlock id="section-brands" defaultWidth="100%">
          <section className="mb-12 p-4 bg-white dark:bg-gray-800 rounded-lg h-full">
            <h2 className="text-3xl font-bold mb-6 dark:text-white no-drag">{t('popular_brands') || 'Popular Brands'}</h2>
            <div className="flex flex-wrap gap-4 no-drag">
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
        </EditableBlock>

        {/* Latest Listings */}
        <EditableBlock id="section-listings" defaultWidth="100%">
          <section className="p-4 bg-white dark:bg-gray-800 rounded-lg h-full">
            <div className="flex justify-between items-center mb-6 no-drag">
              <h2 className="text-3xl font-bold dark:text-white">{t('latest_listings') || 'Latest Listings'}</h2>
              <Link href="/catalog" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                {t('view_all') || 'View all'} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-drag">
              {SAMPLE_LISTINGS.slice(0, 4).map(listing => (
                <div
                  key={listing.id}
                  onClick={() => setSelectedListing(listing)}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border dark:border-gray-600"
                >
                  <div className="bg-gray-200 dark:bg-gray-600 h-40 flex items-center justify-center text-5xl">🚴</div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg dark:text-white">{listing.brand} {listing.model}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{listing.year} • {listing.condition}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{listing.price}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-500">{listing.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </EditableBlock>

        {/* How It Works */}
        <EditableBlock id="section-howitworks" defaultWidth="100%">
          <section className="mt-12 py-12 px-4 bg-blue-50 dark:bg-gray-800 rounded-lg h-full">
            <h2 className="text-3xl font-bold mb-8 text-center dark:text-white no-drag">{t('how_it_works') || 'How It Works'}</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto no-drag">
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
        </EditableBlock>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">BikeMarket</h3>
            <p className="text-gray-400">Estonia's leading bicycle marketplace</p>
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
          <p>© 2024 BikeMarket. All rights reserved.</p>
        </div>
      </footer>

      {/* Advertisement Space */}
      <div className="bg-yellow-100 dark:bg-yellow-900 border-t-2 border-yellow-400 py-2 px-4 text-center text-sm">
        📢 Advertisement Space - This area is reserved for ads
        <span className="ml-4 text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">[Hide for logged-in users]</span>
      </div>
    </div>
  );
}

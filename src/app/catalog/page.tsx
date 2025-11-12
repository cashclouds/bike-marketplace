'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Settings, { translations } from '@/components/Settings';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { useAuth } from '@/contexts/AuthContext';

export default function CatalogPage() {
  const { isAuthenticated, user } = useAuth();
  const [lang, setLang] = useState('en');
  const [listings, setListings] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brand_id: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    minYear: '',
    maxYear: '',
    material: '',
    condition: '',
    location: '',
    search: '',
    wheelSize: '',
    frameSize: '',
  });

  // Load language and saved filters
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

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('catalogFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (err) {
        console.error('Error loading saved filters:', err);
      }
    }
  }, []);

  // Load brands and listings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch brands
        const brandsResponse = (await api.getBrands()) as any;
        setBrands(brandsResponse.brands || []);

        // Fetch listings
        const listingsResponse = (await api.getListings({
          ...(filters.brand_id && { brand_id: filters.brand_id }),
          ...(filters.type && { type: filters.type }),
          ...(filters.minPrice && { minPrice: parseInt(filters.minPrice) }),
          ...(filters.maxPrice && { maxPrice: parseInt(filters.maxPrice) }),
          ...(filters.year && { year: parseInt(filters.year) }),
          ...(filters.minYear && { minYear: parseInt(filters.minYear) }),
          ...(filters.maxYear && { maxYear: parseInt(filters.maxYear) }),
          ...(filters.material && { material: filters.material }),
          ...(filters.wheelSize && { wheelSize: filters.wheelSize }),
          ...(filters.frameSize && { frameSize: filters.frameSize }),
          ...(filters.condition && { condition: filters.condition }),
          ...(filters.location && { location: filters.location }),
          ...(filters.search && { search: filters.search }),
          limit: 20,
        })) as any;
        setListings(listingsResponse.listings || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const updatedFilters = {
        ...prev,
        [key]: value,
      };
      // Save filters to localStorage
      localStorage.setItem('catalogFilters', JSON.stringify(updatedFilters));
      return updatedFilters;
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      brand_id: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      year: '',
      minYear: '',
      maxYear: '',
      material: '',
      condition: '',
      location: '',
      search: '',
      wheelSize: '',
      frameSize: '',
    };
    setFilters(clearedFilters);
    // Remove filters from localStorage
    localStorage.removeItem('catalogFilters');
  };

  const t = (key: string) => (translations as any)[lang]?.[key as keyof typeof translations.en] || key;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl">🚴</span>
              <h1 className="text-2xl font-bold">BikeMarket</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">{t('home')}</Link>
              <Link href="/catalog" className="text-blue-600 font-medium">{t('catalog')}</Link>
              <Link href="/sell" className="text-gray-700 hover:text-blue-600">{t('sell')}</Link>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 max-h-[calc(100vh-150px)] overflow-y-auto">
              <h2 className="text-lg font-bold mb-6">{t('filters') || 'Filters'}</h2>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('brand') || 'Brand'}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.brand_id}
                  onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                >
                  <option value="">{t('allBrands') || 'All Brands'}</option>
                  {brands.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('type') || 'Type'}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Road Bike">Road Bike</option>
                  <option value="Mountain Bike">Mountain Bike</option>
                  <option value="Gravel Bike">Gravel Bike</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="BMX">BMX</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('priceRange') || 'Price (€)'}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Year Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('year') || 'Year'}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={filters.minYear}
                    onChange={(e) => handleFilterChange('minYear', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="To"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={filters.maxYear}
                    onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                  />
                </div>
              </div>

              {/* Material Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('material') || 'Frame Material'}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.material}
                  onChange={(e) => handleFilterChange('material', e.target.value)}
                >
                  <option value="">All Materials</option>
                  <option value="Aluminum">Aluminum</option>
                  <option value="Carbon">Carbon Fiber</option>
                  <option value="Steel">Steel</option>
                  <option value="Titanium">Titanium</option>
                </select>
              </div>

              {/* Wheel Size Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('wheelSize') || 'Wheel Size'}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.wheelSize}
                  onChange={(e) => handleFilterChange('wheelSize', e.target.value)}
                >
                  <option value="">All Sizes</option>
                  <option value="20">20"</option>
                  <option value="24">24"</option>
                  <option value="26">26"</option>
                  <option value="27.5">27.5"</option>
                  <option value="28">28"</option>
                  <option value="29">29"</option>
                </select>
              </div>

              {/* Frame Size Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('frameSize') || 'Frame Size'}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.frameSize}
                  onChange={(e) => handleFilterChange('frameSize', e.target.value)}
                >
                  <option value="">All Sizes</option>
                  <option value="XS">XS (Extra Small)</option>
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                  <option value="XL">XL (Extra Large)</option>
                  <option value="XXL">XXL (2XL)</option>
                </select>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('condition') || 'Condition'}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  <option value="">{t('allConditions') || 'All Conditions'}</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="used">Used</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('location') || 'Location'}</label>
                <input
                  type="text"
                  placeholder="City..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm active:bg-gray-400"
              >
                {t('clear') || 'Clear Filters'}
              </button>
            </div>
          </aside>

          <main className="flex-1">
            {/* Search and Quick Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{t('bicyclesForSale') || 'Bicycles for Sale'}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {listings.length} {t('listings') || 'listings'}
                  </p>
                </div>
              </div>

              {/* Search Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder={t('search_placeholder') || 'Search by model, brand...'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Search is automatically triggered by handleFilterChange
                    }
                  }}
                />
                <button
                  onClick={() => {
                    // Search is already triggered by handleFilterChange, but button provides visual feedback
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium active:bg-blue-800"
                >
                  🔍 {t('search') || 'Search'}
                </button>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('type', 'Road Bike')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    filters.type === 'Road Bike'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🚴 Road Bikes
                </button>
                <button
                  onClick={() => handleFilterChange('type', 'Mountain Bike')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    filters.type === 'Mountain Bike'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⛰️ Mountain Bikes
                </button>
                <button
                  onClick={() => handleFilterChange('condition', 'new')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    filters.condition === 'new'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✨ New
                </button>
                <button
                  onClick={() => handleClearFilters()}
                  className="px-4 py-2 rounded-lg font-medium transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                >
                  ↺ All Bikes
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No listings found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item: any) => {
                  const photos = typeof item.photos === 'string' ? JSON.parse(item.photos) : item.photos || [];
                  const firstPhoto = photos.length > 0 ? photos[0] : null;

                  return (
                    <Link
                      key={item.id}
                      href={`/listing?id=${item.id}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {firstPhoto ? (
                        <div className="relative bg-gray-200 h-48 overflow-hidden">
                          <img
                            src={getImageUrl(firstPhoto.url)}
                            alt={item.model_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-200 flex items-center justify-center h-48 text-6xl">🚴</div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg">
                          {item.model_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.year} • {item.condition}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-2xl font-bold text-blue-600">
                            €{item.price}
                          </span>
                          <span className="text-sm text-gray-500">{item.location}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
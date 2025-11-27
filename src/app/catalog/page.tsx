'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Settings, { translations } from '@/components/Settings';
import { api } from '@/lib/api';
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
    material: '',
    condition: '',
    location: '',
    search: '',
  });

  // Load language
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
          ...(filters.material && { material: filters.material }),
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
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      brand_id: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      year: '',
      material: '',
      condition: '',
      location: '',
      search: '',
    });
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
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{user?.name}</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">{t('profile')}</button>
                </div>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{t('login')}</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">{t('filters')}</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('brand')}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.brand_id}
                  onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                >
                  <option value="">{t('allBrands')}</option>
                  {brands.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('condition')}</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  <option value="">{t('allConditions')}</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="used">Used</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('priceRange')} (€)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('location')}</label>
                <input
                  type="text"
                  placeholder="City..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('clear')}
              </button>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-2xl font-bold">{t('bicyclesForSale')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {listings.length} {t('listings')}
              </p>
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
                {listings.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/listing?id=${item.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="bg-gray-200 flex items-center justify-center h-48 text-6xl">🚴</div>
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
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Settings, { translations } from '@/components/Settings';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');

        if (favIds.length === 0) {
          setFavorites([]);
          return;
        }

        // In a real app, you'd fetch these from the API
        // For now, we'll show placeholder listings
        const mockListings = [
          {
            id: '1',
            model_name: 'Trek Domane SL 5',
            type: 'Road Bike',
            price: 2500,
            year: 2023,
            condition: 'Excellent',
            location: 'Tallinn',
          },
          {
            id: '2',
            model_name: 'Giant TCR Advanced',
            type: 'Road Bike',
            price: 3200,
            year: 2024,
            condition: 'New',
            location: 'Tartu',
          },
        ];

        setFavorites(mockListings.filter((l) => favIds.includes(l.id)));
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, router]);

  const handleRemove = (listingId: string) => {
    setFavorites((prev) => prev.filter((l) => l.id !== listingId));
    const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updated = favIds.filter((id: string) => id !== listingId);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

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
              <Link href="/catalog" className="text-gray-700 hover:text-blue-600">
                Catalog
              </Link>
              <Link href="/sell" className="text-gray-700 hover:text-blue-600">
                Sell
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                Profile
              </Link>
              <Settings />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">❤️ Your Favorites</h1>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4 text-lg">You haven't favorited any listings yet</p>
              <Link href="/catalog" className="text-blue-600 hover:underline font-semibold">
                Browse listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative bg-gray-300 h-48 flex items-center justify-center text-4xl overflow-hidden">
                    🚴
                    <button
                      onClick={() => handleRemove(listing.id)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{listing.model_name}</h3>

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">{listing.type}</p>
                      <p className="text-sm text-gray-600">
                        {listing.year} • {listing.condition}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">€{listing.price}</span>
                      <span className="text-sm text-gray-500">📍 {listing.location}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/listing?id=${listing.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-center transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemove(listing.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {favorites.length > 0 && (
            <div className="mt-12 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">You have {favorites.length} favorited listing{favorites.length !== 1 ? 's' : ''}</h2>
              <p className="text-gray-600 mb-4">
                Manage your favorites and get notified when prices change or new similar listings are added.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                🔔 Enable Notifications
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

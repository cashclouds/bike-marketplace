'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Settings, { translations } from '@/components/Settings';

export default function MyListingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

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

    const fetchListings = async () => {
      try {
        setLoading(true);
        // This would need a specific endpoint for user's listings
        // const response = await api.getListings({ seller: true });
        // setListings(response.listings || []);
        setListings([]); // Placeholder
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [isAuthenticated, router]);

  const handleDelete = (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      // Call API to delete
      api.deleteListing(listingId);
    }
  };

  const handleMarkSold = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, status: 'sold' } : l
      )
    );
    // Call API to update
    api.updateListing(listingId, { status: 'sold' });
  };

  const filteredListings = listings.filter((l) => {
    if (filter === 'active') return l.status === 'active';
    if (filter === 'sold') return l.status === 'sold';
    return true;
  });

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <Link
              href="/sell"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              + Create New Listing
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{listings.filter((l) => l.status === 'active').length}</p>
              <p className="text-gray-600">Active Listings</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-green-600">{listings.filter((l) => l.status === 'sold').length}</p>
              <p className="text-gray-600">Sold</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">€12,450</p>
              <p className="text-gray-600">Total Sales</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b">
              {['active', 'sold', 'archived'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-4 px-6 font-semibold border-b-2 transition-colors capitalize ${
                    filter === tab
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {tab} ({listings.filter((l) => l.status === tab).length})
                </button>
              ))}
            </div>
          </div>

          {/* Listings Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No {filter} listings</p>
              <Link
                href="/sell"
                className="text-blue-600 hover:underline font-semibold"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Listing</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Posted</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((listing) => {
                    const photos = typeof listing.photos === 'string' ? JSON.parse(listing.photos) : listing.photos || [];
                    const firstPhoto = photos.length > 0 ? photos[0] : null;

                    return (
                    <tr key={listing.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {firstPhoto ? (
                            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-lg overflow-hidden">
                              <img src={firstPhoto.url} alt={listing.model_name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-lg">
                              🚴
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{listing.model_name}</p>
                            <p className="text-sm text-gray-600">{listing.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">€{listing.price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            listing.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : listing.status === 'sold'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {listing.views || 0} views
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/listing?id=${listing.id}`}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                          >
                            View
                          </Link>
                          <Link
                            href={`/edit-listing?id=${listing.id}`}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                          >
                            Edit
                          </Link>
                          {listing.status === 'active' && (
                            <button
                              onClick={() => handleMarkSold(listing.id)}
                              className="text-green-600 hover:text-green-700 font-semibold text-sm"
                            >
                              Mark Sold
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-700 font-semibold text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  createListing,
  getListings,
  updateListingStatus,
  deleteListing,
} from '../services/api';
import { getSchoolTheme } from '../config/schools';

const CATEGORIES = ['Books', 'Electronics', 'Fashion', 'Furniture', 'Kitchen', 'Others'];
const CONDITIONS = ['NEW', 'USED', 'FAIRLY_USED'];

const CONDITION_STYLES = {
  NEW: 'bg-green-100 text-green-700',
  USED: 'bg-gray-100 text-gray-700',
  FAIRLY_USED: 'bg-yellow-100 text-yellow-700',
};

export default function Marketplace() {
  const { user } = useAuth();
  const theme = getSchoolTheme(user?.school);

  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selling, setSelling] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books',
    condition: 'USED',
    location: '',
    contactPhone: user?.phone || '',
  });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async (cat = category, q = search) => {
    setLoading(true);
    setError('');
    try {
      const res = await getListings({
        category: cat || undefined,
        search: q || undefined,
      });
      setListings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('', '');
  }, []);

  const handleSell = async (e) => {
    e.preventDefault();
    setFormError('');

    const amount = Number(form.price);
    if (!amount || amount <= 0) {
      setFormError('Enter a valid price.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await createListing(data);
      setSelling(false);
      setForm({
        title: '',
        description: '',
        price: '',
        category: 'Books',
        condition: 'USED',
        location: '',
        contactPhone: user?.phone || '',
      });
      setImage(null);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateListingStatus(id, status);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await deleteListing(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link to="/app" className="text-sm" style={{ color: theme.primary }}>
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Student Marketplace</h1>
        </div>
        <button
          onClick={() => setSelling(true)}
          className="text-white text-sm font-medium rounded-lg px-4 py-2 cursor-pointer"
          style={{ backgroundColor: theme.primary }}
        >
          Sell Item
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-3 mb-4 text-sm flex gap-2">
        <span>⚠️</span>
        <span>
          <b>Safety first:</b> Never send money or pay ahead before seeing the item
          physically. Meet in a public place on campus and inspect the item before paying.
        </span>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && load()}
        placeholder="Search textbooks, phones, fans..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2"
        style={{ ['--tw-ring-color']: theme.primary }}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setCategory('');
            load('');
          }}
          className={`text-xs font-medium rounded-full px-3 py-1 cursor-pointer ${
            category === ''
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              load(c);
            }}
            className={`text-xs font-medium rounded-full px-3 py-1 cursor-pointer ${
              category === c
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}
      {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
      {!loading && listings.length === 0 && !error && (
        <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
          No items for sale here yet. Be the first to sell.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {listings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-4xl">
                📦
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <span
                  className={`text-xs font-bold rounded-full px-2 py-1 whitespace-nowrap ${
                    CONDITION_STYLES[item.condition] || 'bg-gray-100'
                  }`}
                >
                  {item.condition.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-lg font-bold mt-1" style={{ color: theme.primary }}>
                ₦{item.price}
              </p>
              <p className="text-sm text-gray-500">
                📍 {item.location} · {item.user?.name}
              </p>
              {item.status === 'RESERVED' && (
                <p className="text-xs text-yellow-600 font-medium mt-1">Reserved</p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {item.userId !== user?.id && (
                  <>
                    <a
                      href={`tel:${item.contactPhone}`}
                      className="text-sm text-white font-medium rounded-lg px-3 py-1.5 bg-green-600"
                    >
                      Call Seller
                    </a>
                    <Link
                      to={`/app/marketplace/${item.id}/messages`}
                      className="text-sm text-white font-medium rounded-lg px-3 py-1.5"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Message
                    </Link>
                  </>
                )}

                {item.userId === user?.id && (
                  <>
                    <Link
                      to={`/app/marketplace/${item.id}/messages`}
                      className="text-sm border rounded-lg px-3 py-1.5"
                      style={{ borderColor: theme.primary, color: theme.primary }}
                    >
                      View Messages
                    </Link>
                    {item.status === 'AVAILABLE' && (
                      <button
                        onClick={() => handleStatus(item.id, 'RESERVED')}
                        className="text-xs border rounded-lg px-3 py-1.5 cursor-pointer"
                        style={{ borderColor: theme.primary, color: theme.primary }}
                      >
                        Reserve
                      </button>
                    )}
                    {item.status !== 'SOLD' && (
                      <button
                        onClick={() => handleStatus(item.id, 'SOLD')}
                        className="text-xs border rounded-lg px-3 py-1.5 text-gray-600 cursor-pointer border-gray-300"
                      >
                        Mark Sold
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs border border-red-300 text-red-600 rounded-lg px-3 py-1.5 cursor-pointer"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Sell an Item</h2>
              <button
                onClick={() => setSelling(false)}
                className="text-gray-400 hover:text-gray-700 text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4 text-xs">
              ⚠️ Buyers have been warned never to pay before seeing items. Be ready to
              meet on campus for inspection.
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSell} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Engineering Mathematics textbook"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color']: theme.primary }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color']: theme.primary }}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  placeholder="2500"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pickup Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  placeholder="Mellanby Hall"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Edition, condition details, reason for selling..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0] || null)}
                  className="w-full text-sm text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white font-medium rounded-lg py-2 disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: theme.primary }}
              >
                {submitting ? 'Listing...' : 'List Item for Sale'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
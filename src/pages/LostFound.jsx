import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  reportLostFoundItem,
  getLostFoundItems,
  updateLostFoundStatus,
  deleteLostFoundItem,
} from '../services/api';
import { getSchoolTheme } from '../config/schools';

export default function LostFound() {
  const { user } = useAuth();
  const theme = getSchoolTheme(user?.school);

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reporting, setReporting] = useState(false);
  const [form, setForm] = useState({
    type: 'LOST',
    title: '',
    description: '',
    location: '',
    contactPhone: user?.phone || '',
  });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async (type = filter, q = search) => {
    setLoading(true);
    setError('');
    try {
      const res = await getLostFoundItems({
        type: type === 'ALL' ? undefined : type,
        search: q || undefined,
      });
      setItems(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('ALL', '');
  }, []);

  const switchFilter = (f) => {
    setFilter(f);
    load(f, search);
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setFormError('');

    if (form.title.trim().length < 3) {
      setFormError('Please give the item a short title.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await reportLostFoundItem(data);
      setReporting(false);
      setForm({ type: 'LOST', title: '', description: '', location: '', contactPhone: user?.phone || '' });
      setImage(null);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not report item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateLostFoundStatus(id, status);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteLostFoundItem(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/app" className="text-sm" style={{ color: theme.primary }}>← Back</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Lost & Found</h1>
        </div>
        <button
          onClick={() => setReporting(true)}
          className="text-white text-sm font-medium rounded-lg px-4 py-2 cursor-pointer"
          style={{ backgroundColor: theme.primary }}
        >
          Report Item
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'LOST', 'FOUND'].map((f) => (
          <button
            key={f}
            onClick={() => switchFilter(f)}
            className={`text-sm font-medium rounded-lg px-4 py-2 cursor-pointer ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'LOST' ? '😢 Lost' : '🎉 Found'}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && load()}
        placeholder="Search items or locations..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2"
        style={{ ['--tw-ring-color']: theme.primary }}
      />

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
      {!loading && items.length === 0 && !error && (
        <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
          Nothing here yet. Be the first to report.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <span
                  className={`text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${
                    item.type === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {item.type}
                </span>
              </div>
              {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
              <p className="text-sm text-gray-500 mt-2">
                📍 {item.location} · {item.user?.name} · {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <a
                  href={`tel:${item.contactPhone}`}
                  className="text-sm text-white font-medium rounded-lg px-4 py-2 bg-green-600"
                >
                  Call {item.contactPhone}
                </a>
                {item.userId === user?.id && (
                  <>
                    {item.status === 'OPEN' && item.type === 'FOUND' && (
                      <button
                        onClick={() => handleStatus(item.id, 'CLAIMED')}
                        className="text-sm border rounded-lg px-4 py-2 cursor-pointer"
                        style={{ borderColor: theme.primary, color: theme.primary }}
                      >
                        Mark Claimed
                      </button>
                    )}
                    {item.status === 'OPEN' && item.type === 'LOST' && (
                      <button
                        onClick={() => handleStatus(item.id, 'CLOSED')}
                        className="text-sm border rounded-lg px-4 py-2 cursor-pointer"
                        style={{ borderColor: theme.primary, color: theme.primary }}
                      >
                        Mark Found
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm border border-red-300 text-red-600 rounded-lg px-4 py-2 cursor-pointer"
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

      {reporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Report Item</h2>
              <button onClick={() => setReporting(false)} className="text-gray-400 hover:text-gray-700 text-xl cursor-pointer">
                ×
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{formError}</div>
            )}

            <form onSubmit={handleReport} className="space-y-4">
              <div className="flex gap-2">
                {['LOST', 'FOUND'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium cursor-pointer ${
                      form.type === t
                        ? t === 'LOST'
                          ? 'bg-red-600 text-white'
                          : 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    I {t === 'LOST' ? 'Lost' : 'Found'} Something
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Item Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Blue wallet, HP laptop charger..."
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
                  placeholder="Identifying details, when/where last seen..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  placeholder="Tedder Hall, UI / Agbowo park"
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
                <label className="block text-sm font-medium mb-1">Photo (optional)</label>
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
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
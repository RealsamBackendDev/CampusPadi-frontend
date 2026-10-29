import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchArtisans, createServiceRequest } from '../services/api';
import { getSchoolTheme } from '../config/schools';

export default function ArtisanSearch() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = getSchoolTheme(user?.school);

  const [artisans, setArtisans] = useState([]);
  const [skill, setSkill] = useState('');
  const [includeNearby, setIncludeNearby] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ category: '', description: '', location: '', budget: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const doSearch = async (searchSkill, nearby) => {
    setLoading(true);
    setError('');
    try {
      const res = await searchArtisans({ skill: searchSkill || undefined, includeNearby: nearby });
      setArtisans(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doSearch('', false);
  }, []);

  const openRequest = (artisan) => {
    setSelected(artisan);
    setForm({ category: artisan.skills[0] || '', description: '', location: '', budget: '' });
    setFormError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess(false);

    if (form.description.trim().length < 10) {
      setFormError('Please describe the problem in at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await createServiceRequest({
        category: form.category,
        description: form.description,
        location: form.location,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      setSuccess(true);
      setTimeout(() => setSelected(null), 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <span
            className="inline-block text-white text-xs font-bold rounded-full px-3 py-1 mb-1"
            style={{ backgroundColor: theme.primary }}
          >
            {theme.label}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Find an Artisan</h1>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">
          Log out
        </button>
      </header>

      <div className="flex gap-2 mb-4">
        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch(skill, includeNearby)}
          placeholder="What do you need? (plumbing, electrical...)"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
          style={{ ['--tw-ring-color']: theme.primary }}
        />
        <button
          onClick={() => doSearch(skill, includeNearby)}
          disabled={loading}
          className="text-white font-medium rounded-lg px-5 py-2 disabled:opacity-50"
          style={{ backgroundColor: theme.primary }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <input
          type="checkbox"
          checked={includeNearby}
          onChange={(e) => {
            setIncludeNearby(e.target.checked);
            doSearch(skill, e.target.checked);
          }}
        />
        Include artisans from nearby schools
      </label>

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {!loading && artisans.length === 0 && !error && (
        <p className="text-center text-gray-500 py-10">
          No verified artisans found{skill ? ` for "${skill}"` : ''} on your campus yet.
        </p>
      )}

      <div className="space-y-4">
        {artisans.map((artisan) => (
          <div key={artisan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{artisan.name}</h3>
                <p className="text-sm text-gray-500">📍 {artisan.location}</p>
              </div>
              <div className="text-right">
                <div className="text-amber-500 font-bold">★ {artisan.rating.toFixed(1)}</div>
                <div className="text-xs text-gray-400">{artisan.reviewCount} reviews</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {artisan.skills.map((s) => (
                <span key={s} className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            {artisan.bio && <p className="text-sm text-gray-600 mt-3">{artisan.bio}</p>}
            <button
              onClick={() => openRequest(artisan)}
              className="mt-4 text-white text-sm font-medium rounded-lg px-4 py-2"
              style={{ backgroundColor: theme.primary }}
            >
              Request Service
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Request {selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>

            {success ? (
              <div className="bg-green-50 text-green-700 rounded-lg p-4 text-sm">
                Request sent! {selected.name} will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">{formError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Service Type</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color']: theme.primary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Describe the problem</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    rows={3}
                    placeholder="My kitchen sink is blocked completely..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color']: theme.primary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                    placeholder="Agbowo"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color']: theme.primary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget (₦, optional)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="2000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color']: theme.primary }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white font-medium rounded-lg py-2 disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getDashboardStats,
  getAllArtisans,
  verifyArtisan,
  rejectArtisan,
  getPendingPrintShops,
  verifyPrintShop,
  getPendingVendors,
  verifyVendor,
  getPendingMaterials,
  approveMaterial,
  getPendingTutors,
  verifyTutor,
  getPendingAccommodations,
  verifyAccommodation,
} from '../services/api';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'artisans', label: 'Artisans' },
  { key: 'printshops', label: 'Print Shops' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'materials', label: 'Materials' },
  { key: 'tutors', label: 'Tutors' },
  { key: 'accommodations', label: 'Accommodations' },
];

const QUEUES = {
  printshops: { fetch: getPendingPrintShops, verify: verifyPrintShop },
  vendors: { fetch: getPendingVendors, verify: verifyVendor },
  materials: { fetch: getPendingMaterials, verify: approveMaterial },
  tutors: { fetch: getPendingTutors, verify: verifyTutor },
  accommodations: { fetch: getPendingAccommodations, verify: verifyAccommodation },
};

const extractList = (res) =>
  res.data.data ||
  res.data.artisans ||
  res.data.tutors ||
  res.data.materials ||
  res.data.accommodations ||
  res.data.vendors ||
  res.data.shops ||
  [];

const itemTitle = (item) =>
  item.name || item.title || item.course || item.topic || item.subject || 'Untitled';

const itemSub = (item) =>
  [item.phone, item.location, item.school, item.department, item.courseCode]
    .filter(Boolean)
    .join(' · ');

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    }
  };

  const loadArtisans = async (status) => {
    try {
      const res = await getAllArtisans(status ? { status } : {});
      setArtisans(res.data.artisans);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load artisans');
    }
  };

  const loadQueue = async (queue) => {
    try {
      const res = await queue.fetch();
      setItems(extractList(res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load queue');
      setItems([]);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const init = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadArtisans('pending')]);
      setLoading(false);
    };
    init();
  }, []);

  const switchTab = async (key) => {
    setTab(key);
    setActionMsg('');
    setError('');
    if (key === 'overview') loadStats();
    else if (key === 'artisans') loadArtisans('pending');
    else if (QUEUES[key]) {
      setItems([]);
      await loadQueue(QUEUES[key]);
    }
  };

  const runVerify = async (fn, id, successMsg, reloadFn) => {
    setActionMsg('');
    setError('');
    try {
      await fn(id);
      setActionMsg(successMsg);
      reloadFn();
      if (stats) loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleVerifyArtisan = (id) =>
    runVerify(verifyArtisan, id, 'Artisan verified', () => loadArtisans('pending'));
  const handleRejectArtisan = (id, name) => {
    const reason = window.prompt(`Why are you rejecting ${name}? (optional)`);
    if (reason === null) return;
    setActionMsg('');
    setError('');
    rejectArtisan(id, reason)
      .then(() => { setActionMsg('Artisan rejected'); loadArtisans('pending'); loadStats(); })
      .catch((err) => setError(err.response?.data?.message || 'Reject failed'));
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access denied</h1>
        <p className="text-gray-600">This area is restricted to administrators.</p>
        <Link to="/app" className="text-sm text-blue-600 block mt-4">← Back to app</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link to="/app" className="text-sm text-blue-600">← Back to app</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`text-sm font-medium rounded-lg px-4 py-2 ${
              tab === t.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionMsg && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4 text-sm">{actionMsg}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}

      {!loading && tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-3xl font-bold text-gray-900">{stats.users.totalStudents}</div>
              <div className="text-sm text-gray-500">Students</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-3xl font-bold text-gray-900">{stats.artisans.verified}</div>
              <div className="text-sm text-gray-500">
                Verified Artisans
                <span className="block text-xs text-yellow-600">{stats.artisans.pending} pending</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-3xl font-bold text-gray-900">{stats.requests.completed}</div>
              <div className="text-sm text-gray-500">
                Jobs Completed
                <span className="block text-xs text-blue-600">{stats.requests.pending} pending</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-3xl font-bold text-amber-500">★ {stats.reviews.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">{stats.reviews.total} reviews</div>
            </div>
          </div>

          <h2 className="font-bold text-gray-900 mb-3">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {stats.recentActivity.length === 0 && <p className="text-sm text-gray-500 p-5">No requests yet.</p>}
            {stats.recentActivity.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <span className="font-medium capitalize">{r.category}</span>
                  <span className="text-gray-500"> · {r.student?.name} ({r.student?.school})</span>
                  {r.artisan && <span className="text-gray-500"> → {r.artisan.name}</span>}
                </div>
                <span className="text-xs text-gray-400">{r.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && tab === 'artisans' && (
        <div className="space-y-3">
          {artisans.length === 0 && (
            <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
              No artisans waiting for verification. 🎉
            </p>
          )}
          {artisans.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{a.name}</h3>
                  <p className="text-sm text-gray-500">{a.phone} · 📍 {a.location}</p>
                  <p className="text-sm text-gray-500">Serves: {a.schools.join(', ')}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.skills.map((s) => (
                      <span key={s} className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1">
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleVerifyArtisan(a.id)} className="text-sm text-white font-medium rounded-lg px-4 py-2 bg-green-600">
                  Verify
                </button>
                <button onClick={() => handleRejectArtisan(a.id, a.name)} className="text-sm border border-red-300 text-red-600 rounded-lg px-4 py-2">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && QUEUES[tab] && (
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
              Nothing pending in this queue. 🎉
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900">{itemTitle(item)}</h3>
                {itemSub(item) && <p className="text-sm text-gray-500 mt-1">{itemSub(item)}</p>}
              </div>
              <button
                onClick={() => runVerify(QUEUES[tab].verify, item.id, 'Verified successfully', () => loadQueue(QUEUES[tab]))}
                className="text-sm text-white font-medium rounded-lg px-4 py-2 bg-green-600 whitespace-nowrap"
              >
                Verify
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getArtisanRequests,
  acceptRequest,
  startWork,
  completeRequest,
} from '../services/api';
import { getSchoolTheme } from '../config/schools';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = getSchoolTheme(user?.school);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(null);
  const [price, setPrice] = useState('');
  const [actionError, setActionError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getArtisanRequests({ status: 'PENDING,ACCEPTED,IN_PROGRESS,COMPLETED' });
      const list = res.data.data.filter((r) => r.status !== 'CANCELLED');
      setRequests(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.artisanProfile) {
      navigate('/app/artisan/register');
      return;
    }
    load();
  }, [user]);

  const handleAccept = async (id) => {
    setActionError('');
    try {
      await acceptRequest(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not accept');
    }
  };

  const handleStart = async (id) => {
    setActionError('');
    try {
      await startWork(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not start');
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setActionError('');
    const amount = Number(price);
    if (!amount || amount <= 0) {
      setActionError('Enter a valid price');
      return;
    }
    try {
      await completeRequest(completing.id, amount);
      setCompleting(null);
      setPrice('');
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not complete');
    }
  };

  const newRequests = requests.filter((r) => r.status === 'PENDING' && !r.artisan);
  const myJobs = requests.filter((r) => r.artisanId === user?.artisanProfile?.id && ['ACCEPTED', 'IN_PROGRESS'].includes(r.status));
  const recentDone = requests.filter((r) => r.status === 'COMPLETED').slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span
            className="inline-block text-white text-xs font-bold rounded-full px-3 py-1 mb-1"
            style={{ backgroundColor: theme.primary }}
          >
            {theme.short} Artisan
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Artisan Dashboard</h1>
          <p className="text-sm text-gray-500">
            ★ {user?.artisanProfile?.rating?.toFixed(1)} rating
          </p>
        </div>
        <Link to="/app" className="text-sm font-medium" style={{ color: theme.primary }}>
          Student Mode
        </Link>
      </div>

      {actionError && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{actionError}</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}
      {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}

      {!loading && (
        <>
          <section className="mb-8">
            <h2 className="font-bold text-gray-900 mb-3">New Requests</h2>
            {newRequests.length === 0 ? (
              <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-5">
                No new requests right now. New jobs from {theme.short} students will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {newRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize">{request.category}</h3>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          📍 {request.location} · 👤 {request.student.name} ({request.student.phone})
                        </p>
                        {request.budget != null && (
                          <p className="text-sm mt-1 font-medium">Budget: ₦{request.budget}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="mt-3 text-white text-sm font-medium rounded-lg px-4 py-2"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Accept Job
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mb-8">
            <h2 className="font-bold text-gray-900 mb-3">My Active Jobs</h2>
            {myJobs.length === 0 ? (
              <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-5">
                No active jobs. Accept a request above to start earning.
              </p>
            ) : (
              <div className="space-y-3">
                {myJobs.map((request) => (
                  <div key={request.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize">{request.category}</h3>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          👤 {request.student.name} · {request.student.phone}
                        </p>
                      </div>
                      <span className={`text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${STATUS_STYLES[request.status]}`}>
                        {request.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      {request.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleStart(request.id)}
                          className="text-sm border rounded-lg px-4 py-2"
                          style={{ borderColor: theme.primary, color: theme.primary }}
                        >
                          Start Work
                        </button>
                      )}
                      {request.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => {
                            setCompleting(request);
                            setPrice(request.budget ? String(request.budget) : '');
                            setActionError('');
                          }}
                          className="text-sm text-white font-medium rounded-lg px-4 py-2"
                          style={{ backgroundColor: theme.primary }}
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {recentDone.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 mb-3">Recently Completed</h2>
              <div className="space-y-2">
                {recentDone.map((request) => (
                  <div key={request.id} className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between text-sm">
                    <span className="capitalize text-gray-700">{request.category}</span>
                    <span className="font-medium">₦{request.price}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {completing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="font-bold text-lg mb-4">Complete Job</h2>
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Final Price (₦)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCompleting(null)}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white font-medium rounded-lg py-2"
                  style={{ backgroundColor: theme.primary }}
                >
                  Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
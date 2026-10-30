import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getMyRequests,
  cancelRequest,
  createReview,
  initializePayment,
} from '../services/api';
import { getSchoolTheme } from '../config/schools';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function MyRequests() {
  const { user } = useAuth();
  const theme = getSchoolTheme(user?.school);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyRequests();
      setRequests(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelRequest(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel');
    }
  };

  const handlePay = async (request) => {
    try {
      const res = await initializePayment({ serviceRequestId: request.id });
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      alert(err.response?.data?.message || 'Could not start payment');
    }
  };

  const openReview = (request) => {
    setReviewing(request);
    setRating(5);
    setComment('');
    setReviewError('');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await createReview({
        serviceRequestId: reviewing.id,
        rating: Number(rating),
        comment: comment || undefined,
      });
      setReviewing(null);
      load();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Review failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/app" className="text-sm" style={{ color: theme.primary }}>
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">My Requests</h1>
      </div>

      {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}
      {!loading && requests.length === 0 && !error && (
        <p className="text-center text-gray-500 py-10">
          No requests yet.{' '}
          <Link to="/app" style={{ color: theme.primary }}>
            Find an artisan
          </Link>
        </p>
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 capitalize">{request.category}</h3>
                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                <p className="text-sm text-gray-500 mt-2">📍 {request.location}</p>
                {request.artisan && (
                  <p className="text-sm mt-2">
                    <span className="text-gray-500">Artisan:</span>{' '}
                    <span className="font-medium">{request.artisan.name}</span>{' '}
                    <span className="text-gray-400">({request.artisan.phone})</span>
                  </p>
                )}
                {request.price != null && (
                  <p className="text-sm mt-1 font-medium">Price: ₦{request.price}</p>
                )}
              </div>
              <span
                className={`text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${
                  STATUS_STYLES[request.status] || 'bg-gray-100'
                }`}
              >
                {request.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {request.status === 'PENDING' && (
                <button
                  onClick={() => handleCancel(request.id)}
                  className="text-sm border border-gray-300 text-gray-600 rounded-lg px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {request.artisan &&
                ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(request.status) && (
                  <Link
                    to={`/app/requests/${request.id}/messages`}
                    className="text-sm border rounded-lg px-4 py-2"
                    style={{ borderColor: theme.primary, color: theme.primary }}
                  >
                    Message
                  </Link>
                )}

             {request.status === 'COMPLETED' && !request.paid && request.price != null && (
  request.priceApproved ? (
    <button
      onClick={() => handlePay(request)}
      className="text-sm text-white font-medium rounded-lg px-4 py-2 bg-green-600 cursor-pointer"
    >
      Pay ₦{request.price}
    </button>
  ) : (
    <>
      <div className="text-sm text-gray-700 self-center">
        Artisan quoted <b>₦{request.price}</b>
        {request.budget != null && (
          <span className="text-gray-400"> (budget ₦{request.budget})</span>
        )}
      </div>
      <button
        onClick={async () => { await approvePrice(request.id); load(); }}
        className="text-sm text-white font-medium rounded-lg px-4 py-2 bg-green-600 cursor-pointer"
      >
        Approve Price
      </button>
      <button
        onClick={async () => { await disputePrice(request.id); load(); }}
        className="text-sm border border-red-300 text-red-600 rounded-lg px-4 py-2 cursor-pointer"
      >
        Dispute
      </button>
    </>
  )
)}

              {request.status === 'COMPLETED' && !request.review && (
                <button
                  onClick={() => openReview(request)}
                  className="text-sm text-white font-medium rounded-lg px-4 py-2 cursor-pointer"
                  style={{ backgroundColor: theme.primary }}
                >
                  Rate {request.artisan?.name || 'artisan'}
                </button>
              )}

              {request.status === 'COMPLETED' && request.review && (
                <span className="text-sm text-amber-500 self-center">
                  ★ You rated {request.review.rating}/5
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">
              Review {reviewing.artisan?.name}
            </h2>
            {reviewError && (
              <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">
                {reviewError}
              </div>
            )}
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-2xl cursor-pointer ${
                        n <= rating ? 'text-amber-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Came quickly and fixed it perfectly..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color']: theme.primary }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewing(null)}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white font-medium rounded-lg py-2 cursor-pointer"
                  style={{ backgroundColor: theme.primary }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
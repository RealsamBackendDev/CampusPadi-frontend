import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/api';

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }
    verifyPayment(reference)
      .then(() => setStatus('success'))
      .catch(() => setStatus('failed'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
        {status === 'verifying' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Confirming payment...</h1>
            <p className="text-sm text-gray-500">Hold on, we're verifying with Paystack.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment successful!</h1>
            <p className="text-sm text-gray-500 mb-6">Your artisan has been paid. Thanks for using CampusPadi.</p>
            <Link to="/app/requests" className="text-white text-sm font-medium rounded-lg px-6 py-2 bg-green-600 inline-block">
              View My Requests
            </Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment not confirmed</h1>
            <p className="text-sm text-gray-500 mb-6">The payment could not be verified. If money left your account, contact support.</p>
            <Link to="/app/requests" className="text-sm text-blue-600">← Back to My Requests</Link>
          </>
        )}
      </div>
    </div>
  );
}
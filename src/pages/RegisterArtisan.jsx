import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerArtisan, uploadVerificationDoc } from '../services/api';
import { SCHOOLS } from '../config/schools';

export default function RegisterArtisan() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    skills: '',
    location: '',
    address: '',
    bio: '',
  });
  const [schools, setSchools] = useState([user?.school || 'UI']);
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSchool = (key) => {
    setSchools((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const skills = form.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (skills.length === 0) {
      setError('Add at least one skill (e.g. plumbing, tailoring)');
      return;
    }
    if (schools.length === 0) {
      setError('Select at least one school you serve');
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerArtisan({
        name: form.name,
        phone: form.phone,
        skills,
        schools,
        location: form.location,
        address: form.address || undefined,
        bio: form.bio || undefined,
      });

      if (document) {
        await uploadVerificationDoc(res.data.data.id, document);
      }

      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.artisanProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">You're already registered</h1>
        <p className="text-gray-600">
          Status:{' '}
          <span className={`font-medium ${user.artisanProfile.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
            {user.artisanProfile.isVerified ? 'Verified' : 'Pending verification'}
          </span>
        </p>
        <Link to="/app" className="text-sm text-blue-600 block mt-4">← Back to app</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Application received!</h1>
        <p className="text-gray-600">
          Our team will verify your details. Once approved, you'll start receiving
          job requests from students.
        </p>
        <Link to="/app" className="text-sm text-blue-600 block mt-4">← Back to app</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link to="/app" className="text-sm text-blue-600">← Back</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">Earn as an Artisan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Turn your handiwork into income. Register your skill and get job requests from students.
      </p>

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business / Your Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            required
            placeholder="plumbing, tiling, generator repair"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Which schools do you serve?</label>
          <div className="space-y-2">
            {Object.entries(SCHOOLS).map(([key, school]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={schools.includes(key)}
                  onChange={() => toggleSchool(key)}
                />
                {school.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Base Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            placeholder="Agbowo"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address (optional)</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Short Bio (optional)</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={2}
            placeholder="5 years experience, available for emergencies..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ID Document (optional, speeds up verification)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setDocument(e.target.files[0] || null)}
            className="w-full text-sm text-gray-600"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-medium rounded-lg py-2 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}
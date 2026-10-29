import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SCHOOLS } from '../config/schools';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    school: 'UI',
    department: '',
    studentId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <img src="/logo-2.jpg" alt="CampusPadi" className="w-24 h-24 mx-auto mb-4 object-contain" />

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Oluwaseun Adebayo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="08012345678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">School</label>
            <select
              name="school"
              value={form.school}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {Object.entries(SCHOOLS).map(([key, school]) => (
                <option key={key} value={key}>{school.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Computer Science"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Student ID (optional)</label>
            <input
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              placeholder="U2020/305"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white rounded-lg py-2 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
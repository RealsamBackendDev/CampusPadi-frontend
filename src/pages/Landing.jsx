import { useNavigate, Link } from 'react-router-dom';
import { SCHOOLS } from '../config/schools';

const FEATURES = [
  { icon: '🔧', title: 'Verified Artisans', text: 'Plumbers, electricians, and repairers vetted by students on your campus.' },
  { icon: '🍲', title: 'Campus Food', text: 'Order from campus bukas and canteens without the queue.' },
  { icon: '📚', title: 'Course Materials', text: 'Past questions and notes from seniors who actually passed.' },
  { icon: '🛡️', title: 'SafeWalk', text: 'Never walk home alone at night. Find walking buddies on your route.' },
  { icon: '🏠', title: 'Hostel Listings', text: 'Verified rooms near campus. No agent fraud.' },
  { icon: '🤝', title: 'Project Groups', text: 'Find teammates by skill and get rated for your contribution.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo-2.jpg" alt="CampusPadi" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-[#14532d]">
            CAMPUS<span className="text-[#f59e0b]">PADI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Log in
          </Link>
          <button
            onClick={() => navigate('/register')}
            className="bg-[#14532d] text-white text-sm font-medium rounded-lg px-4 py-2"
          >
            Get Started
          </button>
        </div>
      </header>

      <section className="text-center px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Campus Survival Companion</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Everything you need to survive campus life in Ibadan — verified artisans,
          cheap food, course materials, and safety in numbers. Built for your school.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-[#14532d] text-white font-medium rounded-lg px-6 py-3"
          >
            Create free account
          </button>
          <button
            onClick={() => navigate('/login')}
            className="border border-[#14532d] text-[#14532d] font-medium rounded-lg px-6 py-3"
          >
            Log in
          </button>
        </div>
      </section>

      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Pick your campus</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(SCHOOLS).map(([key, school]) => (
            <button
              key={key}
              onClick={() => navigate('/register')}
              className="rounded-2xl p-6 text-white text-left"
              style={{ backgroundColor: school.primary }}
            >
              <div className="text-2xl font-bold">{school.short}</div>
              <div className="text-sm opacity-90 mt-1">{school.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">One app. Your whole campus.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 py-8">
        CampusPadi — Made in Ibadan 🇳🇬
      </footer>
    </div>
  );
}
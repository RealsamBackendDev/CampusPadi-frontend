import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { getSchoolTheme } from './config/schools';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtisanSearch from './pages/ArtisanSearch';

function App() {
  const { user, loading } = useAuth();
  const theme = getSchoolTheme(user?.school);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        '--color-primary': theme.primary,
        '--color-accent': theme.accent,
      }}
    >
      <Routes>
        <Route path="/" element={user ? <ArtisanSearch /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      </Routes>
    </div>
  );
}

export default App;
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { getSchoolTheme } from './config/schools';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtisanSearch from './pages/ArtisanSearch';
import MyRequests from './pages/MyRequests';
import RegisterArtisan from './pages/RegisterArtisan';
import ArtisanDashboard from './pages/ArtisanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentCallback from './pages/PaymentCallback';
import Messages from './pages/Messages';
import LostFound from './pages/LostFound';
import Marketplace from './pages/Marketplace';
import StudyBuddy from './pages/StudyBuddy';

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
        <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/app/requests" element={user ? <MyRequests /> : <Navigate to="/login" replace />} />
<Route path="/app/artisan/register" element={user ? <RegisterArtisan /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/app" replace /> : <Register />} />
        <Route path="/app" element={user ? <ArtisanSearch /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/app/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/app/artisan/dashboard" element={user ? <ArtisanDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/app/lost-found" element={user ? <LostFound /> : <Navigate to="/login" replace />} />
        <Route path="/app/marketplace" element={user ? <Marketplace /> : <Navigate to="/login" replace />} />
        <Route path="/app/marketplace/:listingId/messages" element={user ? <Messages /> : <Navigate to="/login" replace />} />
        <Route path="/app/study" element={user ? <StudyBuddy /> : <Navigate to="/login" replace />} />
        <Route path="/app/requests/:requestId/messages" element={user ? <Messages /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
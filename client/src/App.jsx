import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Register from './pages/auth/Register.jsx';
import Login from './pages/auth/Login.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import GigList from './pages/gigs/GigList.jsx';
import CreateGig from './pages/gigs/CreateGig.jsx';
import GigDetail from './pages/gigs/GigDetail.jsx';
import Chat from './pages/chat/Chat.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/gigs" element={<GigList />} />
        <Route path="/gigs/create" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
        <Route path="/gigs/:id" element={<GigDetail />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
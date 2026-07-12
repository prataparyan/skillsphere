import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">

      {/* Logo — always visible */}
      <Link to="/" className="text-xl font-bold text-blue-600">
        SkillSphere
      </Link>

      {/* Center links — role-based */}
      <div className="flex items-center gap-6">
        <Link
          to="/gigs"
          className="text-gray-600 text-sm hover:text-blue-600 font-medium transition-colors"
        >
          Browse Gigs
        </Link>

        {/* Only clients see Post a Gig */}
        {isAuthenticated && user?.role === 'client' && (
          <Link
            to="/gigs/create"
            className="text-gray-600 text-sm hover:text-blue-600 font-medium transition-colors"
          >
            Post a Gig
          </Link>
        )}

        {/* Only admins see Admin link */}
        {isAuthenticated && user?.role === 'admin' && (
          <Link
            to="/admin"
            className="text-gray-600 text-sm hover:text-blue-600 font-medium transition-colors"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right side — auth state dependent */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Clicking name goes to dashboard */}
            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              {user?.name}
              <span className="ml-1 text-xs text-gray-400">
                ({user?.role})
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-blue-600 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
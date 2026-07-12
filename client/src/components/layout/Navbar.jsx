import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useState, useEffect } from 'react';
import API from '../../api/axios.js';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBellClick = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
      setShowNotifications(!showNotifications);
      if (!showNotifications && unreadCount > 0) {
        await API.put('/notifications/mark-read');
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-blue-600">
        SkillSphere
      </Link>

      {/* Center links */}
      <div className="flex items-center gap-6">
        <Link
          to="/gigs"
          className="text-gray-600 text-sm hover:text-blue-600 font-medium transition-colors"
        >
          Browse Gigs
        </Link>
        {isAuthenticated && user?.role === 'client' && (
          <Link
            to="/gigs/create"
            className="text-gray-600 text-sm hover:text-blue-600 font-medium transition-colors"
          >
            Post a Gig
          </Link>
        )}
        {isAuthenticated && user?.role === 'admin' && (
          <Link
            to="/admin"
            className="text-gray-600 text-sm hover:text-blue-600 font-medium transition-colors"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                {/* Bell icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Unread badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            setShowNotifications(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                            !n.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-700">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              {user?.name}
              <span className="ml-1 text-xs text-gray-400">({user?.role})</span>
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
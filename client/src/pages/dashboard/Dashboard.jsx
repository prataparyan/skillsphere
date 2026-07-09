import { useAuth } from '../../context/AuthContext.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">SkillSphere</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            {user?.name} ({user?.role})
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-500">
          You are logged in as a <strong>{user?.role}</strong>.
          More features coming soon.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
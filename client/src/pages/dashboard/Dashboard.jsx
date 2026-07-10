import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
    const fetchData = async () => {
      try {
        if (user?.role === 'client') {
          const { data } = await API.get('/gigs/my-gigs');
          setGigs(data.gigs);
        } else if (user?.role === 'freelancer') {
          const { data } = await API.get('/proposals/my-proposals');
          setProposals(data.proposals);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">SkillSphere</Link>
        <div className="flex items-center gap-6">
          <Link to="/gigs" className="text-gray-600 text-sm hover:text-gray-900">Browse Gigs</Link>
          {user?.role === 'client' && (
            <Link to="/gigs/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Post a Gig
            </Link>
          )}
          <span className="text-gray-600 text-sm">{user?.name} ({user?.role})</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Welcome back, {user?.name}!
        </h2>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : user?.role === 'client' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Gigs</h3>
              <Link to="/gigs/create" className="text-blue-600 text-sm font-medium hover:underline">
                + Post New Gig
              </Link>
            </div>
            {gigs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
                No gigs posted yet.{' '}
                <Link to="/gigs/create" className="text-blue-600 hover:underline">Post your first gig</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {gigs.map(gig => (
                  <Link key={gig._id} to={`/gigs/${gig._id}`}>
                    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{gig.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{gig.proposalCount} proposals · ${gig.budget.min}-${gig.budget.max}</p>
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          gig.status === 'open' ? 'bg-green-50 text-green-600' :
                          gig.status === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>{gig.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Proposals</h3>
            {proposals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
                No proposals yet.{' '}
                <Link to="/gigs" className="text-blue-600 hover:underline">Browse gigs</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map(proposal => (
                  <Link key={proposal._id} to={`/gigs/${proposal.gig?._id}`}>
                    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{proposal.gig?.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Bid: ${proposal.bidAmount} · {proposal.estimatedDays} days
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          proposal.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                          proposal.status === 'accepted' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                        }`}>{proposal.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
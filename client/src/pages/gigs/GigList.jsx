import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios.js';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'other', label: 'Other' },
];

const GigList = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (category) params.category = category;
      const { data } = await API.get('/gigs', { params });
      setGigs(data.gigs);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [category, page]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">SkillSphere</Link>
        <div className="flex gap-4">
          <Link to="/gigs/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Post a Gig
          </Link>
          <Link to="/dashboard" className="text-gray-600 text-sm font-medium hover:text-gray-900 py-2">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Gigs</h1>
        <p className="text-gray-500 mb-6">Browse available projects and submit your proposals</p>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Gig Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading gigs...</div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No gigs found.</div>
        ) : (
          <div className="space-y-4">
            {gigs.map(gig => (
              <Link key={gig._id} to={`/gigs/${gig._id}`}>
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {gig.category.replace('-', ' ')}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-1">{gig.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{gig.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {gig.skills.map(skill => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-6 text-right shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        ${gig.budget.min} - ${gig.budget.max}
                      </p>
                      <p className="text-sm text-gray-400">{gig.deadline} days</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {gig.proposalCount} proposals
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Posted by {gig.client?.name}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      gig.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {gig.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GigList;
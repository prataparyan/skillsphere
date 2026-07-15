import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/layout/Navbar.jsx';

const GigDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState({
    description: '',
    bidAmount: '',
    estimatedDays: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const { data } = await API.get(`/gigs/${id}`);
        setGig(data.gig);
      } catch {
        navigate('/gigs');
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!gig || !user) return;
      const isOwner =
        gig.client?._id === (user._id || user.id) ||
        gig.client?._id === user._id ||
        gig.client === (user._id || user.id);
      if (isOwner || user.role === 'admin') {
        try {
          const { data } = await API.get(`/proposals/gig/${id}`);
          setProposals(data.proposals);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchProposals();
  }, [gig, user]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setProposalError('');
    try {
      await API.post('/proposals', {
        gig: id,
        description: proposal.description,
        bidAmount: Number(proposal.bidAmount),
        estimatedDays: Number(proposal.estimatedDays),
      });
      setProposalSuccess(true);
      const { data } = await API.get(`/gigs/${id}`);
      setGig(data.gig);
    } catch (err) {
      setProposalError(
        err.response?.data?.message || 'Failed to submit proposal'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposalStatus = async (proposalId, status) => {
    try {
      await API.put(`/proposals/${proposalId}/status`, { status });
      const { data } = await API.get(`/proposals/gig/${id}`);
      setProposals(data.proposals);
      if (status === 'accepted') {
        const gigData = await API.get(`/gigs/${id}`);
        setGig(gigData.data.gig);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async (p) => {
    setPaymentLoading(true);
    try {
      const { data } = await API.post('/payments/create-order', {
        gigId: id,
        proposalId: p._id,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: 'INR',
        name: 'SkillSphere',
        description: gig.title,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: data.payment,
            });
            if (verifyRes.data.success) {
              alert('Payment successful! Gig marked as completed.');
              const gigData = await API.get(`/gigs/${id}`);
              setGig(gigData.data.gig);
            }
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#2563EB' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading...
      </div>
    );
  }
  if (!gig) return null;

  const isOwner =
    gig.client?._id === (user?._id || user?.id) ||
    gig.client === (user?._id || user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-4">
        <Link
          to="/gigs"
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
        >
          ← Back to Gigs
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Gig Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {gig.category.replace('-', ' ')}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-3">
              {gig.title}
            </h1>
            <p className="text-gray-600 leading-relaxed">{gig.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {gig.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs — only for gig owner */}
          {isOwner && (
            <div>
              <div className="flex gap-4 border-b border-gray-200 mb-4">
                {['details', 'proposals'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'proposals'
                      ? `Proposals (${proposals.length})`
                      : tab}
                  </button>
                ))}
              </div>

              {activeTab === 'proposals' && (
                <div className="space-y-4">
                  {proposals.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
                      No proposals yet.
                    </div>
                  ) : (
                    proposals.map((p) => (
                      <div
                        key={p._id}
                        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {p.freelancer?.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {p.freelancer?.email}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${
                              p.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-600'
                                : p.status === 'accepted'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">
                          {p.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>
                              Bid:{' '}
                              <strong className="text-gray-900">
                                ₹{p.bidAmount}
                              </strong>
                            </span>
                            <span>
                              Timeline:{' '}
                              <strong className="text-gray-900">
                                {p.estimatedDays} days
                              </strong>
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {/* Accept/Reject buttons — only for pending proposals on open gigs */}
                            {p.status === 'pending' && gig.status === 'open' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleProposalStatus(p._id, 'accepted')
                                  }
                                  className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    handleProposalStatus(p._id, 'rejected')
                                  }
                                  className="px-4 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 font-medium"
                                >
                                  Reject
                                </button>
                                <Link
                                  to={`/chat/${p.freelancer?._id}`}
                                  className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 font-medium"
                                >
                                  Chat
                                </Link>
                              </>
                            )}

                            {/* Pay Now button — accepted proposal on in-progress gig */}
                            {p.status === 'accepted' && (
                              <div className="flex gap-2">
                                <Link
                                  to={`/chat/${p.freelancer?._id}`}
                                  className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 font-medium">
                                  Chat
                                </Link>
                                {gig.status === 'in-progress' && (
                                  <button
                                    onClick={() => handlePayment(p)}
                                    disabled={paymentLoading}
                                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                  >
                                    {paymentLoading ? 'Processing...' : `Pay ₹${p.bidAmount}`}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Proposal Form — freelancers only */}
          {user?.role === 'freelancer' && gig.status === 'open' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Submit a Proposal
              </h2>
              {proposalSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  Proposal submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  {proposalError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {proposalError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter
                    </label>
                    <textarea
                      rows={4}
                      value={proposal.description}
                      onChange={(e) =>
                        setProposal({
                          ...proposal,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe why you're the best fit..."
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bid Amount ($)
                      </label>
                      <input
                        type="number"
                        value={proposal.bidAmount}
                        onChange={(e) =>
                          setProposal({
                            ...proposal,
                            bidAmount: e.target.value,
                          })
                        }
                        placeholder="800"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Days
                      </label>
                      <input
                        type="number"
                        value={proposal.estimatedDays}
                        onChange={(e) =>
                          setProposal({
                            ...proposal,
                            estimatedDays: e.target.value,
                          })
                        }
                        placeholder="25"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Project Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Budget
                </p>
                <p className="font-semibold text-gray-900">
                  ₹{gig.budget.min} - ₹{gig.budget.max}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Deadline
                </p>
                <p className="font-semibold text-gray-900">
                  {gig.deadline} days
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Status
                </p>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    gig.status === 'open'
                      ? 'bg-green-50 text-green-600'
                      : gig.status === 'in-progress'
                      ? 'bg-blue-50 text-blue-600'
                      : gig.status === 'completed'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {gig.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Proposals
                </p>
                <p className="font-semibold text-gray-900">
                  {gig.proposalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Posted By</h3>
            <p className="text-gray-700 font-medium">{gig.client?.name}</p>
            <p className="text-gray-400 text-sm">{gig.client?.email}</p>
            {user && user?.role === 'freelancer' && (
              <Link
                to={`/chat/${gig.client?._id}`}
                className="mt-3 block text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Message Client
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaIdCard,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaList
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function VendorAccount() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState('basic');

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.get(`${apiBaseUrl}/api/vendor/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccount(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 404) {
        setError('Vendor not found.');
      } else {
        setError(`Failed to load account details: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 text-blue-600">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading account details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 text-red-500">
      <div className="text-center">
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchAccountDetails}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!account) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 text-blue-600">
      <p>No account details found.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 text-blue-800">
      {/* Left Side Menu */}
<div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
  <h1 className="text-2xl font-bold text-blue-600 text-center py-6">Profile</h1>
  <nav className="flex flex-col mt-4 space-y-2">
    <button
      onClick={() => setSelectedSection('basic')}
      className={`flex justify-center`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-3 rounded-lg mx-2 w-full transition-colors ${
          selectedSection === 'basic' ? 'bg-blue-100 font-semibold' : 'hover:bg-blue-50'
        }`}
      >
        <FaUserCircle /> Basic Information
      </div>
    </button>

    <button
      onClick={() => setSelectedSection('professional')}
      className={`flex justify-center`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-3 rounded-lg mx-2 w-full transition-colors ${
          selectedSection === 'professional' ? 'bg-blue-100 font-semibold' : 'hover:bg-blue-50'
        }`}
      >
        <FaBriefcase /> Professional Details
      </div>
    </button>
  </nav>
</div>

      {/* Right Side Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedSection === 'basic' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow">
            <h2 className="text-xl font-semibold text-blue-600 mb-6 flex items-center gap-2">
              <FaUserCircle /> Basic Information
            </h2>
            <div className="space-y-4 text-blue-800">
              <div className="flex items-center gap-3">
                <FaUserCircle className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Owner Name</span>
                  <p className="font-medium">{account.ownerName || account.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Email</span>
                  <p className="font-medium">{account.email || account.contact?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaPhone className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Phone</span>
                  <p className="font-medium">{account.phone || account.contact?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaIdCard className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Vendor ID</span>
                  <p className="font-medium text-xs">{account._id || account.userId}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedSection === 'professional' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow">
            <h2 className="text-xl font-semibold text-blue-600 mb-6 flex items-center gap-2">
              <FaBriefcase /> Professional Details
            </h2>
            <div className="space-y-4 text-blue-800">
              <div className="flex items-center gap-3">
                <FaBuilding className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Business Name</span>
                  <p className="font-medium">{account.businessName || account.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaBriefcase className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Business Type</span>
                  <p className="font-medium">{account.businessType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Operational Area</span>
                  <p className="font-medium">{account.operationalArea}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaClock className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Years in Business</span>
                  <p className="font-medium">{account.years}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaIdCard className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">License Number</span>
                  <p className="font-medium">{account.licenseNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaList className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Supply Categories</span>
                  <p className="font-medium">{Array.isArray(account.supplyCategories) ? account.supplyCategories.join(', ') : account.supplyCategories}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaBuilding className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Avg. Monthly Capacity</span>
                  <p className="font-medium">{account.avgCapacity}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-500 w-5 h-5" />
                <div>
                  <span className="text-gray-500 text-sm">Address</span>
                  <p className="font-medium">{account.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

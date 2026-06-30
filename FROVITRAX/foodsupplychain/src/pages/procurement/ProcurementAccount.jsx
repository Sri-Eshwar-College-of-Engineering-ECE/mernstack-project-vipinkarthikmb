import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaIdCard,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaList,
} from "react-icons/fa";

export default function ProcurementAccount() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("basic");

  const fetchAccountDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await axios.get(`${apiBaseUrl}/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccount(res.data.user || res.data);
    } catch (err) {
      console.error("Failed to fetch account details:", err);
      setError("Failed to load account details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex justify-center items-center text-emerald-800">
        <div className="text-center animate-pulse">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading account details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex justify-center items-center">
        <div className="text-center text-emerald-900">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <button
            onClick={fetchAccountDetails}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-md transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex justify-center items-center text-emerald-800">
        <p>No account details found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 text-gray-800 px-8 py-10">
      <div className="max-w-7xl mx-auto flex gap-10">
        {/* Left Navigation */}
        <div className="w-64 bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 flex flex-col gap-5 sticky top-10 self-start">
          <h2 className="text-xl font-semibold text-emerald-700 mb-4 text-center">
            Profile Sections
          </h2>
          <NavItem
            label="Basic Information"
            active={activeSection === "basic"}
            onClick={() => setActiveSection("basic")}
            icon={<FaUserCircle />}
          />
          <NavItem
            label="Professional Details"
            active={activeSection === "professional"}
            onClick={() => setActiveSection("professional")}
            icon={<FaBriefcase />}
          />
          {account.procurementAreas?.length > 0 && (
            <NavItem
              label="Procurement Areas"
              active={activeSection === "procurement"}
              onClick={() => setActiveSection("procurement")}
              icon={<FaList />}
            />
          )}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-8">
          {activeSection === "basic" && (
            <Card title="Basic Information" icon={<FaUserCircle />}>
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6 animate-fadeIn">
                <InfoItem
                  icon={<FaUserCircle />}
                  label="Full Name"
                  value={account.fullName || account.name}
                />
                <InfoItem icon={<FaEnvelope />} label="Email" value={account.email} />
                <InfoItem
                  icon={<FaPhone />}
                  label="Contact"
                  value={account.contact || "N/A"}
                />
                <InfoItem
                  icon={<FaIdCard />}
                  label="User ID"
                  value={account._id}
                  small
                />
              </div>
            </Card>
          )}

          {activeSection === "professional" && (
            <Card title="Professional Details" icon={<FaBriefcase />}>
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6 animate-fadeIn">
                <InfoItem
                  icon={<FaBuilding />}
                  label="Organization"
                  value={account.organization || "N/A"}
                />
                <InfoItem
                  icon={<FaBriefcase />}
                  label="Designation"
                  value={account.designation || "N/A"}
                />
                <InfoItem
                  icon={<FaMapMarkerAlt />}
                  label="Location"
                  value={account.location || "N/A"}
                />
                <InfoItem
                  icon={<FaClock />}
                  label="Experience"
                  value={
                    account.experience ? `${account.experience} years` : "N/A"
                  }
                />
              </div>
            </Card>
          )}

          {activeSection === "procurement" && account.procurementAreas?.length > 0 && (
            <Card title="Procurement Areas" icon={<FaList />}>
              <div className="flex flex-wrap gap-3 animate-fadeIn">
                {account.procurementAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium border border-emerald-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Role Badge */}
          <div className="flex justify-center mt-10">
            <span className="inline-flex items-center px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold shadow-md">
              <FaUserCircle className="mr-2 text-white" />
              {account.role === "procurement"
                ? "Procurement Manager"
                : account.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
        active
          ? "bg-emerald-600 text-white shadow-md"
          : "text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}

// Card Component
function Card({ title, icon, children }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl font-semibold text-emerald-700 mb-6 flex items-center gap-2 border-b border-emerald-100 pb-2">
        <span className="text-emerald-600 text-lg">{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

// Info Item Component
function InfoItem({ icon, label, value, small }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-emerald-600 mt-1 text-lg">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p
          className={`font-semibold ${small ? "text-xs" : "text-base"} text-gray-800`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

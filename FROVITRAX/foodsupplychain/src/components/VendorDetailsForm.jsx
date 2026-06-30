import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaBuilding, FaUserTie, FaBriefcase, FaPhone, FaMapMarkedAlt,
  FaBoxes, FaMapMarkerAlt, FaIdCard, FaBusinessTime, FaEnvelope, FaArrowRight, FaArrowLeft, FaCheckCircle
} from 'react-icons/fa';

export default function VendorDetailsForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    businessType: '',
    contact: { email: '', phone: '' },
    address: '',
    supplyCategories: [],
    operationalArea: '',
    licenseNumber: '',
    years: '',
    avgCapacity: ''
  });
  const [error, setError] = useState('');

  const types = ['Farmer', 'Distributor', 'Wholesaler'];
  const categories = ['Grains', 'Dairy', 'Fruits', 'Vegetables', 'Meat'];
  const locations = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email' || name === 'phone') {
      setForm({ ...form, contact: { ...form.contact, [name]: value } });
    } else if (name === 'years' || name === 'avgCapacity') {
      setForm({ ...form, [name]: value.replace(/[^\d]/g, '') });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const toggleCategory = (val) => {
    const updated = form.supplyCategories.includes(val)
      ? form.supplyCategories.filter(v => v !== val)
      : [...form.supplyCategories, val];
    setForm({ ...form, supplyCategories: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const requiredFields = [
      'businessName', 'ownerName', 'businessType', 'address',
      'operationalArea', 'licenseNumber', 'years', 'avgCapacity'
    ];
    for (let field of requiredFields) {
      if (!form[field]) {
        setError('All fields are required.');
        return;
      }
    }
    if (!form.contact.email || !form.contact.phone) {
      setError('Contact email and phone are required.');
      return;
    }
    if (!form.supplyCategories.length) {
      setError('Please select at least one supply category.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        years: Number(form.years),
        avgCapacity: Number(form.avgCapacity)
      };
      await axios.post('http://localhost:5000/api/vendor/details', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      navigate('/vendordashboard');
    } catch (err) {
      if (err.response && err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Submission failed. Please try again.');
      }
    }
  };

  const steps = ['Business Info', 'Contact & Address', 'Verification'];

  return (
   <div className="min-h-screen bg-emerald-200 flex items-center justify-center p-6">

  <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-10 bg-cover z-0" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-xl border border-emerald-200"
      >
        <h1 className="text-3xl font-extrabold text-emerald-700 text-center mb-8 tracking-wide">
          Vendor Partner Profile
        </h1>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-10 relative">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center text-center ${i <= step ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full border-4 transition-all ${
                  i <= step ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-gray-100'
                }`}>
                  {i < step ? <FaCheckCircle /> : i + 1}
                </div>
                <p className="text-sm mt-1 font-semibold">{label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 rounded-full ${i < step ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 text-center mb-4 font-semibold">{error}</p>}

        {/* Step 0 */}
        {step === 0 && (
          <motion.div
            key="step1"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-4">
              <div className="relative">
                <FaBuilding className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="businessName"
                  placeholder="Business Name"
                  value={form.businessName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaUserTie className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="ownerName"
                  placeholder="Owner's Full Name"
                  value={form.ownerName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaBriefcase className="absolute top-3 left-3 text-emerald-500" />
                <select
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Select Business Type</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="text-right mt-6">
                <button
                  onClick={() => setStep(1)}
                  type="button"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-md flex items-center gap-2 float-right transition-transform hover:scale-105"
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <motion.div
            key="step2"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="email"
                  type="email"
                  placeholder="Contact Email"
                  value={form.contact.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaPhone className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Contact Number"
                  value={form.contact.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaMapMarkedAlt className="absolute top-3 left-3 text-emerald-500" />
                <textarea
                  name="address"
                  placeholder="Business Address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaBoxes className="text-emerald-500" /> Supply Categories:
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
                        form.supplyCategories.includes(c)
                          ? 'bg-emerald-200 border-emerald-400 text-emerald-700 scale-105'
                          : 'bg-gray-100 border-gray-300 hover:bg-emerald-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <FaMapMarkerAlt className="absolute top-3 left-3 text-emerald-500" />
                <select
                  name="operationalArea"
                  value={form.operationalArea}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Select Operational Area</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(0)} type="button" className="flex items-center gap-2 text-emerald-600 hover:underline">
                  <FaArrowLeft /> Back
                </button>
                <button onClick={() => setStep(2)} type="button" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-md flex items-center gap-2 transition-transform hover:scale-105">
                  Next <FaArrowRight />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div
            key="step3"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-4">
              <div className="relative">
                <FaIdCard className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="licenseNumber"
                  placeholder="License Number / GSTIN"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaBusinessTime className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="years"
                  type="number"
                  min="0"
                  placeholder="Years in Business"
                  value={form.years}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaBoxes className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="avgCapacity"
                  type="number"
                  min="0"
                  placeholder="Avg. Monthly Capacity"
                  value={form.avgCapacity}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} type="button" className="flex items-center gap-2 text-emerald-600 hover:underline">
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-md flex items-center gap-2 transition-transform hover:scale-105">
                  Submit <FaCheckCircle />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.form>
    </div>
  );
}

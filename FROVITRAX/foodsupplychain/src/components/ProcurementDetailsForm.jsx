import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaPhone,
  FaMapMarkerAlt,
  FaBoxes,
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';

export default function ProcurementDetailsForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    organization: '',
    designation: '',
    contact: '',
    location: '',
    procurementAreas: [],
    experience: ''
  });

  const designations = ['Manager', 'Assistant Manager', 'Procurement Officer'];
  const options = ['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Spices'];
  const steps = ['Personal Info', 'Contact Info', 'Experience'];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleArea = (value) => {
    const updated = form.procurementAreas.includes(value)
      ? form.procurementAreas.filter((a) => a !== value)
      : [...form.procurementAreas, value];
    setForm({ ...form, procurementAreas: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/pm/details', form, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201 || res.status === 200) {
        navigate('/procurementdashboard');
      } else {
        alert('Failed to save details');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving details. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-200 flex items-center justify-center p-6">
 <div className="absolute inset-0 bg-[url('/pattern-light.svg')] opacity-10 bg-cover" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-xl border border-emerald-200"
      >
        <h1 className="text-3xl font-extrabold text-emerald-700 text-center mb-8">
          Procurement Manager Profile
        </h1>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-10 relative">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center ${i <= step ? 'text-emerald-600' : 'text-gray-400'}`}>
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

        {/* Step 0 */}
        {step === 0 && (
          <motion.div key="step0" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="space-y-4">
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaBuilding className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="organization"
                  placeholder="Organization Name"
                  value={form.organization}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaBriefcase className="absolute top-3 left-3 text-emerald-500" />
                <select
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
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
          <motion.div key="step1" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="space-y-4">
              <div className="relative">
                <FaPhone className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="contact"
                  placeholder="Contact Number"
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="location"
                  placeholder="Location / Branch"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400"
                />
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
          <motion.div key="step2" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaBoxes className="text-emerald-500" /> Procurement Areas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {options.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
                        form.procurementAreas.includes(area)
                          ? 'bg-emerald-200 border-emerald-400 text-emerald-700 scale-105'
                          : 'bg-gray-100 border-gray-300 hover:bg-emerald-100'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <FaClock className="absolute top-3 left-3 text-emerald-500" />
                <input
                  name="experience"
                  type="number"
                  min="0"
                  placeholder="Years of Experience"
                  value={form.experience}
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

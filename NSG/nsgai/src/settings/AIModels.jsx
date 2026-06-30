import { Eye, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function AIModels() {
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    case_history: "",
    location: "",
    file: null
  });

  // Load registered faces on mount
  useEffect(() => {
    loadRegisteredFaces();
  }, []);

  const loadRegisteredFaces = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/registered-faces");
      const data = await response.json();
      setRegisteredFaces(data.persons || []);
    } catch (error) {
      console.error("Error loading faces:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", formData.file);
      formDataObj.append("name", formData.name);
      formDataObj.append("dob", formData.dob);
      formDataObj.append("case_history", formData.case_history);
      formDataObj.append("location", formData.location);

      const response = await fetch("http://localhost:8000/api/register-face", {
        method: "POST",
        body: formDataObj
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        setFormData({ name: "", dob: "", case_history: "", location: "", file: null });
        setImagePreview(null);
        setShowForm(false);
        loadRegisteredFaces();
      } else {
        setMessage({ type: "error", text: data.error || "Registration failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Models Status */}
      <Section title="AI Models" icon={<Eye />}>
        <ul className="space-y-4 text-sm text-gray-400">
          <li>• Weapon Detection Model — ACTIVE</li>
          <li>• Face Recognition — ACTIVE</li>
          <li>• Crowd Analysis — ACTIVE</li>
          <li>• Behavior Anomaly Detection — STANDBY</li>
        </ul>
      </Section>

      {/* Registered Faces */}
      <Section title="Registered Persons" icon={<Eye />}>
        <div className="space-y-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Plus size={16} /> Register New Face
          </button>

          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-600"
                  : "bg-red-900/30 text-red-400 border border-red-600"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {message.text}
            </div>
          )}

          {/* Registration Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-[#0F1219] p-6 rounded-lg border border-white/10 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Photo
                </label>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="flex-1 px-3 py-2 bg-[#0A0C12] border border-white/10 rounded-lg text-sm text-gray-400 file:mr-2 file:px-2 file:py-1 file:bg-blue-600 file:text-white file:rounded file:cursor-pointer"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-white/10"
                    />
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#0A0C12] border border-white/10 rounded-lg text-sm text-gray-300 focus:border-blue-500 outline-none"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#0A0C12] border border-white/10 rounded-lg text-sm text-gray-300 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Case History */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Case History / Details
                </label>
                <textarea
                  value={formData.case_history}
                  onChange={(e) => setFormData({ ...formData, case_history: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-3 py-2 bg-[#0A0C12] border border-white/10 rounded-lg text-sm text-gray-300 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Location / Jurisdiction
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#0A0C12] border border-white/10 rounded-lg text-sm text-gray-300 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-semibold transition"
                >
                  {loading ? "Registering..." : "Register Face"}
                </button>
              </div>
            </form>
          )}

          {/* List of Registered Faces */}
          {registeredFaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {registeredFaces.map((person, idx) => (
                <div
                  key={idx}
                  className="bg-[#0F1219] border border-white/10 p-4 rounded-lg hover:border-white/20 transition"
                >
                  <h3 className="font-semibold text-white text-sm">{person.name}</h3>
                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    <p>📅 DOB: {person.dob}</p>
                    <p>📍 Location: {person.location}</p>
                    <p>🎯 Faces: {person.faces}</p>
                    <p className="text-gray-500 text-xs">Added: {person.registered}</p>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                      View Case Details
                    </summary>
                    <p className="text-xs text-gray-400 mt-1 bg-[#0A0C12] p-2 rounded">
                      {person.case}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No registered faces yet. Add one to get started!
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-[#0A0C12] border border-white/5 p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="font-black uppercase text-sm tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

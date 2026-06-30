import {
  FaThermometerHalf,
  FaTint,
  FaMicrochip,
  FaSync,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaFileDownload,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function VenDeviceTrack() {
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastOnlineData, setLastOnlineData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const MAX_POINTS = 20;
  const channelId = "3073978"; 
  const apiKey = "9VBVFJRD5A2ZB6JE";

  useEffect(() => {
    const savedData = localStorage.getItem("lastDeviceData");
    const savedHistory = localStorage.getItem("deviceHistory");
    if (savedData) setDevices([JSON.parse(savedData)]);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/devices");
      const newData = res.data;
      if (!newData) return;

      const device = Array.isArray(newData) ? newData[0] : newData;
      if (!device) return;
      setDevices([device]);

      if (device.status === "online") {
        const tempNum =
          parseFloat(String(device.temperature).replace(/[^0-9.-]+/g, "")) || 0;
        const humNum =
          parseFloat(String(device.humidity).replace(/[^0-9.-]+/g, "")) || 0;

        const reading = {
          time: new Date().toLocaleTimeString(),
          temperature: tempNum,
          humidity: humNum,
        };

        setHistory((prev) => {
          const updated = [...prev, reading].slice(-MAX_POINTS);
          localStorage.setItem("deviceHistory", JSON.stringify(updated));
          return updated;
        });

        setLastOnlineData(device);
        localStorage.setItem("lastDeviceData", JSON.stringify(device));
      } else {
        if (lastOnlineData) setDevices([lastOnlineData]);
        const savedHistory = localStorage.getItem("deviceHistory");
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error fetching data", error);
      const savedData = localStorage.getItem("lastDeviceData");
      const savedHistory = localStorage.getItem("deviceHistory");
      if (savedData) setDevices([JSON.parse(savedData)]);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  const getBatteryIcon = (level) => {
    if (level > 75)
      return <FaBatteryFull className="text-green-500 animate-pulse" />;
    if (level > 25)
      return <FaBatteryHalf className="text-yellow-500 animate-pulse" />;
    return <FaBatteryQuarter className="text-red-500 animate-pulse" />;
  };

  const downloadCSV = async () => {
    if (!startTime || !endTime)
      return alert("Please select both start and end time!");

    try {
      const res = await axios.get(
        `https://api.thingspeak.com/channels/${channelId}/feeds.json`,
        {
          params: {
            api_key: apiKey,
            start: new Date(startTime).toISOString(),
            end: new Date(endTime).toISOString(),
          },
        }
      );

      const feeds = res.data.feeds || [];
      if (feeds.length === 0) {
        alert("No data found in this time range.");
        return;
      }

      const csvRows = [["timestamp", "Temperature", "Humidity"]];
      feeds.forEach((f) => {
        csvRows.push([f.created_at, f.field1 || "", f.field2 || ""]);
      });

      const csvContent = csvRows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sensor_data_${startTime}_to_${endTime}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setShowModal(false);
    } catch (err) {
      console.error("CSV download failed:", err);
      alert("Failed to download data. Please check ThingSpeak or your network.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-white text-gray-800 px-5 sm:px-10 py-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
          <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
            <FaMicrochip /> Vendor Device Dashboard
          </h1>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border border-blue-300 shadow hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              <FaSync className={`${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating..." : "Refresh Data"}
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow"
            >
              <FaFileDownload /> Download CSV
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg w-80">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">
                Select Time Range
              </h3>
              <label className="block text-sm mb-2">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mb-3"
              />
              <label className="block text-sm mb-2">End Date & Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {devices.length > 0 && devices[0].status === "offline" && (
          <div className="bg-red-200 text-red-800 text-center py-2 rounded-lg mb-5 animate-pulse shadow">
            ⚠️ Device is offline — showing last known readings.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((sensorData, index) => (
            <motion.div
              key={sensorData.deviceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-blue-200 hover:border-blue-500 transition shadow-md"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-700">
                    {sensorData.deviceId}
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`w-3 h-3 rounded-full ${
                      sensorData.status === "online"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="mr-1">
                    {getBatteryIcon(sensorData.battery)}
                  </div>
                  {sensorData.battery}%
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaThermometerHalf className="text-blue-600" />
                    <span className="text-gray-500 text-sm">Temperature</span>
                  </div>
                  <span className="font-semibold">
                    {sensorData.temperature} °C
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaTint className="text-blue-600" />
                    <span className="text-gray-500 text-sm">Humidity</span>
                  </div>
                  <span className="font-semibold">
                    {sensorData.humidity} %
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-200">
                <span>Last updated</span>
                <span>{sensorData.lastUpdated}</span>
              </div>

              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-semibold ${
                    sensorData.status === "online"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {sensorData.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {history.length > 0 && (
          <div className="mt-12 bg-white p-6 rounded-2xl border border-blue-200 shadow">
            <h2 className="text-xl font-bold text-blue-600 mb-4">
              Live Sensor Trends
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={history}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey="time" stroke="#3b82f6" />
                <YAxis stroke="#3b82f6" domain={["auto", "auto"]} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "temperature" ? `${value} °C` : `${value} %`
                  }
                  contentStyle={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #93c5fd",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={1000}
                  animationEasing="linear"
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#60a5fa"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={1000}
                  animationEasing="linear"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

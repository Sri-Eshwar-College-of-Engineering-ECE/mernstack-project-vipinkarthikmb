import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertTriangle, Clock, MapPin, Search } from 'lucide-react';

const MissingBoxesPage = () => {
  const { boxType } = useParams();
  const navigate = useNavigate();
  const [missingBoxes, setMissingBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Box type configurations
  const boxConfigs = {
    wooden: { name: 'Wooden', color: 'amber' },
    plastic: { name: 'Plastic', color: 'blue' },
    steel: { name: 'Steel', color: 'slate' },
    cardboard: { name: 'Cardboard', color: 'yellow' },
    cardheaded: { name: 'Cardheaded', color: 'pink' }
  };

  const config = boxConfigs[boxType] || boxConfigs.wooden;

  useEffect(() => {
    const generateMissingBoxes = async () => {
      setLoading(true);
      
      if (boxType === 'cardboard') {
        // For cardboard, generate real-time missing boxes based on actual data
        try {
          const response = await fetch('http://localhost:5001/api/scans');
          const scansData = await response.json();
          
          // Find boxes that haven't been scanned in the last 7 days
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const missingBoxesData = scansData
            .filter(scan => new Date(scan.timestamp) < sevenDaysAgo)
            .map(scan => ({
              id: scan.tag || `CB${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
              lastScanned: new Date(scan.timestamp).toLocaleDateString(),
              lastLocation: scan.section || 'Unknown',
              daysMissing: Math.floor((Date.now() - new Date(scan.timestamp)) / (1000 * 60 * 60 * 24)),
              priority: 'High',
              reason: 'Not scanned recently',
              expectedLocation: scan.section || 'Warehouse',
              reportedBy: 'System Auto-Detection'
            }));
          
          // Add some additional missing boxes for demonstration
          const additionalMissing = Array.from({ length: 5 }, (_, i) => ({
            id: `CB${String(1000 + i).padStart(4, '0')}`,
            lastScanned: new Date(Date.now() - (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            lastLocation: ['Warehouse', 'Packaging', 'Finishing'][Math.floor(Math.random() * 3)],
            daysMissing: Math.floor(Math.random() * 30) + 7,
            priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            reason: ['Not scanned recently', 'Location mismatch', 'Damaged during transport'][Math.floor(Math.random() * 3)],
            expectedLocation: ['Warehouse', 'Packaging', 'Finishing', 'Dispatch'][Math.floor(Math.random() * 4)],
            reportedBy: ['System Auto-Detection', 'Manual Report', 'Quality Check'][Math.floor(Math.random() * 3)]
          }));
          
          setMissingBoxes([...missingBoxesData, ...additionalMissing]);
        } catch (error) {
          console.error('Error fetching cardboard missing data:', error);
          setMissingBoxes([]);
        }
      } else {
        // For other box types, generate static missing boxes data
        const staticMissingCounts = {
          wooden: 8,
          plastic: 15,
          steel: 3,
          cardheaded: 12
        };
        
        const count = staticMissingCounts[boxType] || 5;
        const missingBoxesData = Array.from({ length: count }, (_, i) => ({
          id: `${boxType.toUpperCase().substring(0, 2)}${String(9000 + i).padStart(4, '0')}`,
          lastScanned: new Date(Date.now() - (Math.random() * 60 + 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          lastLocation: ['Warehouse', 'Packaging', 'Finishing', 'Dispatch'][Math.floor(Math.random() * 4)],
          daysMissing: Math.floor(Math.random() * 60) + 7,
          priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          reason: [
            'Not scanned recently',
            'Location mismatch',
            'Damaged during transport',
            'Lost in transit',
            'Maintenance required'
          ][Math.floor(Math.random() * 5)],
          expectedLocation: ['Warehouse', 'Packaging', 'Finishing', 'Dispatch'][Math.floor(Math.random() * 4)],
          reportedBy: ['System Auto-Detection', 'Manual Report', 'Quality Check', 'Inventory Audit'][Math.floor(Math.random() * 4)]
        }));
        
        setMissingBoxes(missingBoxesData);
      }
      
      setLoading(false);
    };

    generateMissingBoxes();
    
    // For cardboard, update every 30 seconds
    if (boxType === 'cardboard') {
      const interval = setInterval(generateMissingBoxes, 30000);
      return () => clearInterval(interval);
    }
  }, [boxType]);

  const filteredBoxes = missingBoxes.filter(box =>
    box.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.lastLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = () => {
    const headers = ['Box ID', 'Last Scanned', 'Last Location', 'Days Missing', 'Priority', 'Reason', 'Expected Location', 'Reported By'];
    const csvContent = [
      headers.join(','),
      ...filteredBoxes.map(box => [
        box.id,
        box.lastScanned,
        box.lastLocation,
        box.daysMissing,
        box.priority,
        `"${box.reason}"`,
        box.expectedLocation,
        `"${box.reportedBy}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}_missing_boxes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 animate-pulse mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading missing {config.name} boxes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-8 h-8 text-red-600`} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Missing {config.name} Boxes</h1>
                  <p className="text-gray-600">
                    {filteredBoxes.length} missing boxes 
                    {boxType === 'cardboard' && <span className="text-green-600 ml-2">• Real-time data</span>}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search missing boxes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {['High', 'Medium', 'Low'].map(priority => (
            <div key={priority} className="bg-white rounded-lg shadow-md p-4">
              <h3 className={`font-semibold ${priority === 'High' ? 'text-red-600' : priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                {priority} Priority
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {filteredBoxes.filter(box => box.priority === priority).length}
              </p>
            </div>
          ))}
        </div>

        {/* Missing Boxes Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                    Box ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                    Last Scanned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                    Last Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                    Days Missing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                    Expected Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBoxes.map((box, index) => (
                  <tr key={box.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {box.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {box.lastScanned}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {box.lastLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${box.daysMissing > 30 ? 'text-red-600' : box.daysMissing > 14 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {box.daysMissing} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(box.priority)}`}>
                        {box.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {box.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {box.expectedLocation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBoxes.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No missing boxes found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'All boxes are accounted for!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingBoxesPage;

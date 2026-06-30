import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Package, FileText, Printer } from 'lucide-react';

const BoxListingPage = () => {
  const { boxType } = useParams();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  // Box type configurations
  const boxConfigs = {
    wooden: { name: 'Wooden', color: 'amber', icon: Package },
    plastic: { name: 'Plastic', color: 'blue', icon: Package },
    steel: { name: 'Steel', color: 'slate', icon: Package },
    cardboard: { name: 'Cardboard', color: 'yellow', icon: FileText },
    cardheaded: { name: 'Cardheaded', color: 'pink', icon: Package }
  };

  const config = boxConfigs[boxType] || boxConfigs.wooden;

  useEffect(() => {
    const generateBoxes = async () => {
      setLoading(true);
      
      if (boxType === 'cardboard') {
        // For cardboard, fetch real-time data
        try {
          const response = await fetch('http://localhost:5001/api/scans/counts');
          const countsData = await response.json();
          setCounts(countsData);
          
          const scansResponse = await fetch('http://localhost:5001/api/scans');
          const scansData = await scansResponse.json();
          
          // Generate boxes based on real scans
          const generatedBoxes = scansData.map((scan, index) => ({
            id: scan.tag || `CB${String(index + 1).padStart(4, '0')}`,
            section: scan.section || 'Warehouse',
            status: scan.status || 'Active',
            lastScanned: new Date(scan.timestamp).toLocaleDateString(),
            lifetime: Math.floor(Math.random() * 50) + 10, // Random lifetime 10-60 days
            usageCount: Math.floor(Math.random() * 20) + 1
          }));
          
          setBoxes(generatedBoxes);
        } catch (error) {
          console.error('Error fetching cardboard data:', error);
          setBoxes([]);
        }
      } else {
        // For other box types, generate static data
        const staticCounts = {
          wooden: { total: 100, warehouse: 25, packaging: 20, finishing: 20, dispatch: 15 },
          plastic: { total: 250, warehouse: 70, packaging: 50, finishing: 50, dispatch: 50 },
          steel: { total: 50, warehouse: 15, packaging: 12, finishing: 12, dispatch: 12 },
          cardheaded: { total: 180, warehouse: 50, packaging: 35, finishing: 35, dispatch: 35 }
        };
        
        const boxCounts = staticCounts[boxType] || staticCounts.wooden;
        setCounts(boxCounts);
        
        const generatedBoxes = [];
        let boxCounter = 1;
        
        // Generate boxes for each section
        const sections = ['warehouse', 'packaging', 'finishing', 'dispatch'];
        sections.forEach(section => {
          const count = boxCounts[section] || 0;
          for (let i = 0; i < count; i++) {
            generatedBoxes.push({
              id: `${boxType.toUpperCase().substring(0, 2)}${String(boxCounter).padStart(4, '0')}`,
              section: section.charAt(0).toUpperCase() + section.slice(1),
              status: 'Active',
              lastScanned: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              lifetime: Math.floor(Math.random() * 100) + 30, // Random lifetime 30-130 days
              usageCount: Math.floor(Math.random() * 50) + 1
            });
            boxCounter++;
          }
        });
        
        setBoxes(generatedBoxes);
      }
      
      setLoading(false);
    };

    generateBoxes();
  }, [boxType]);

  const downloadCSV = () => {
    const headers = ['Box ID', 'Section', 'Status', 'Last Scanned', 'Lifetime (Days)', 'Usage Count'];
    const csvContent = [
      headers.join(','),
      ...boxes.map(box => [
        box.id,
        box.section,
        box.status,
        box.lastScanned,
        box.lifetime,
        box.usageCount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}_boxes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const jsonContent = JSON.stringify({
      boxType: config.name,
      generatedDate: new Date().toISOString(),
      totalBoxes: boxes.length,
      sections: counts,
      boxes: boxes
    }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}_boxes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${config.name} Boxes Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${config.name} Boxes Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Boxes: ${boxes.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Box ID</th>
                <th>Section</th>
                <th>Status</th>
                <th>Last Scanned</th>
                <th>Lifetime (Days)</th>
                <th>Usage Count</th>
              </tr>
            </thead>
            <tbody>
              ${boxes.map(box => `
                <tr>
                  <td>${box.id}</td>
                  <td>${box.section}</td>
                  <td>${box.status}</td>
                  <td>${box.lastScanned}</td>
                  <td>${box.lifetime}</td>
                  <td>${box.usageCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading {config.name} boxes...</p>
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
                <config.icon className={`w-8 h-8 text-${config.color}-600`} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{config.name} Boxes</h1>
                  <p className="text-gray-600">Total: {boxes.length} boxes</p>
                </div>
              </div>
            </div>
            
            {/* Download Options */}
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={downloadJSON}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Section Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {['warehouse', 'packaging', 'finishing', 'dispatch'].map(section => (
            <div key={section} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-700 capitalize">{section}</h3>
              <p className="text-2xl font-bold text-blue-600">
                {counts[section] || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Boxes Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Box ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Scanned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lifetime (Days)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {boxes.map((box, index) => (
                  <tr key={box.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {box.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
                        {box.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {box.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {box.lastScanned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {box.lifetime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {box.usageCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxListingPage;

const Scan = require('../models/Scan');

exports.createScan = async (req, res) => {
  try {
    let { tag, box, status, timestamp, section, time } = req.body;

    // If box is missing, assign 'Unknown'
    if (!box) box = 'Unknown';
    // If tag is missing, assign 'N/A'
    if (!tag) tag = 'N/A';
    // Default status to 'Scanned' if not provided
    if (!status) status = 'Scanned';

    // Handle timestamp parsing - support both Unix timestamp and ISO string
    let parsedTimestamp;
    if (timestamp) {
      // If timestamp is a number (Unix timestamp)
      if (typeof timestamp === 'number' || !isNaN(Number(timestamp))) {
        let ts = Number(timestamp);
        // Convert to milliseconds if it's in seconds
        if (ts < 1000000000000) ts *= 1000;
        parsedTimestamp = new Date(ts);
      } else {
        // Try to parse as ISO string
        parsedTimestamp = new Date(timestamp);
      }
    }

    // If timestamp parsing failed or not provided, use current time
    if (!parsedTimestamp || isNaN(parsedTimestamp.getTime())) {
      parsedTimestamp = new Date();
    }

    // Store the time string if provided (for display purposes)
    const scanData = {
      tag,
      box,
      status,
      timestamp: parsedTimestamp,
      section,
      time: time || parsedTimestamp.toLocaleTimeString()
    };

    const scan = new Scan(scanData);
    await scan.save();
    res.status(201).json({ message: 'Scan entry saved', scan });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getScans = async (req, res) => {
  try {
    const scans = await Scan.find().sort({ timestamp: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSectionCounts = async (req, res) => {
  try {
    const scans = await Scan.find();

    const sectionCounts = {
      warehouse: 0,
      packaging: 0,
      finishing: 0,
      dispatch: 0,
      total: 0
    };

    scans.forEach(scan => {
      const section = scan.section?.toLowerCase();
      if (section === 'warehouse') sectionCounts.warehouse++;
      else if (section === 'packaging') sectionCounts.packaging++;
      else if (section === 'finishing') sectionCounts.finishing++;
      else if (section === 'dispatch') sectionCounts.dispatch++;
    });

    sectionCounts.total = sectionCounts.warehouse + sectionCounts.packaging + sectionCounts.finishing + sectionCounts.dispatch;

    res.json(sectionCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBoxesByType = async (req, res) => {
  try {
    const { boxType } = req.params;

    if (boxType === 'cardboard') {
      // For cardboard, return real scan data
      const scans = await Scan.find().sort({ timestamp: -1 });
      const boxes = scans.map((scan, index) => ({
        id: scan.tag || `CB${String(index + 1).padStart(4, '0')}`,
        section: scan.section || 'Warehouse',
        status: scan.status || 'Active',
        lastScanned: new Date(scan.timestamp).toLocaleDateString(),
        lifetime: Math.floor(Math.random() * 50) + 10,
        usageCount: Math.floor(Math.random() * 20) + 1,
        createdAt: scan.createdAt
      }));
      res.json(boxes);
    } else {
      // For other types, generate static data
      const staticCounts = {
        wooden: { total: 100, warehouse: 25, packaging: 20, finishing: 20, dispatch: 15 },
        plastic: { total: 250, warehouse: 70, packaging: 50, finishing: 50, dispatch: 50 },
        steel: { total: 50, warehouse: 15, packaging: 12, finishing: 12, dispatch: 12 },
        cardheaded: { total: 180, warehouse: 50, packaging: 35, finishing: 35, dispatch: 35 }
      };

      const counts = staticCounts[boxType] || staticCounts.wooden;
      const boxes = [];
      let boxCounter = 1;

      ['warehouse', 'packaging', 'finishing', 'dispatch'].forEach(section => {
        const count = counts[section] || 0;
        for (let i = 0; i < count; i++) {
          boxes.push({
            id: `${boxType.toUpperCase().substring(0, 2)}${String(boxCounter).padStart(4, '0')}`,
            section: section.charAt(0).toUpperCase() + section.slice(1),
            status: 'Active',
            lastScanned: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            lifetime: Math.floor(Math.random() * 100) + 30,
            usageCount: Math.floor(Math.random() * 50) + 1,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
          });
          boxCounter++;
        }
      });

      res.json(boxes);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMissingBoxes = async (req, res) => {
  try {
    const { boxType } = req.params;

    if (boxType === 'cardboard') {
      // For cardboard, find boxes not scanned recently
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const scans = await Scan.find({ timestamp: { $lt: sevenDaysAgo } });

      const missingBoxes = scans.map(scan => ({
        id: scan.tag || `CB${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        lastScanned: new Date(scan.timestamp).toLocaleDateString(),
        lastLocation: scan.section || 'Unknown',
        daysMissing: Math.floor((Date.now() - new Date(scan.timestamp)) / (1000 * 60 * 60 * 24)),
        priority: 'High',
        reason: 'Not scanned recently',
        expectedLocation: scan.section || 'Warehouse',
        reportedBy: 'System Auto-Detection'
      }));

      res.json(missingBoxes);
    } else {
      // For other types, generate static missing data
      const missingCounts = { wooden: 8, plastic: 15, steel: 3, cardheaded: 12 };
      const count = missingCounts[boxType] || 5;

      const missingBoxes = Array.from({ length: count }, (_, i) => ({
        id: `${boxType.toUpperCase().substring(0, 2)}${String(9000 + i).padStart(4, '0')}`,
        lastScanned: new Date(Date.now() - (Math.random() * 60 + 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        lastLocation: ['Warehouse', 'Packaging', 'Finishing', 'Dispatch'][Math.floor(Math.random() * 4)],
        daysMissing: Math.floor(Math.random() * 60) + 7,
        priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        reason: ['Not scanned recently', 'Location mismatch', 'Damaged during transport', 'Lost in transit'][Math.floor(Math.random() * 4)],
        expectedLocation: ['Warehouse', 'Packaging', 'Finishing', 'Dispatch'][Math.floor(Math.random() * 4)],
        reportedBy: ['System Auto-Detection', 'Manual Report', 'Quality Check'][Math.floor(Math.random() * 3)]
      }));

      res.json(missingBoxes);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

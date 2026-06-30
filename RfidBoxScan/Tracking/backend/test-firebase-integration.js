const axios = require('axios');

// Test Firebase data structure
const testFirebaseData = {
  "AD13FFA0": {
    "status": "Scanned",
    "time": "02:55:24",
    "timestamp": 1755140124
  },
  "C92DC401": {
    "status": "Scanned", 
    "time": "02:55:17",
    "timestamp": 1755140117
  },
  "XYZ12345": {
    "status": "Scanned",
    "time": "03:00:10", 
    "timestamp": 1755140410
  }
};

async function testBackendEndpoints() {
  const baseURL = 'http://localhost:5001/api';
  
  console.log('🧪 Testing Backend Integration...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get(`${baseURL}/../health`);
      console.log('✅ Server is running');
    } catch (err) {
      console.log('❌ Server is not running. Please start the backend server first.');
      return;
    }

    // Test 2: Test Firebase sync status
    console.log('\n2. Testing Firebase sync status...');
    try {
      const syncStatusResponse = await axios.get(`${baseURL}/firebase/sync/status`);
      console.log('✅ Sync status:', syncStatusResponse.data);
    } catch (err) {
      console.log('❌ Failed to get sync status:', err.response?.data || err.message);
    }

    // Test 3: Test manual Firebase sync
    console.log('\n3. Testing manual Firebase sync...');
    try {
      const syncResponse = await axios.post(`${baseURL}/firebase/sync`);
      console.log('✅ Manual sync result:', syncResponse.data);
    } catch (err) {
      console.log('❌ Manual sync failed:', err.response?.data || err.message);
    }

    // Test 4: Test creating a scan entry
    console.log('\n4. Testing scan creation...');
    const testScan = {
      tag: 'TEST123',
      box: 'TestBox',
      status: 'Scanned',
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      section: 'Warehouse'
    };

    try {
      const scanResponse = await axios.post(`${baseURL}/scans`, testScan);
      console.log('✅ Scan created:', scanResponse.data);
    } catch (err) {
      console.log('❌ Scan creation failed:', err.response?.data || err.message);
    }

    // Test 5: Test getting scans
    console.log('\n5. Testing scan retrieval...');
    try {
      const getScansResponse = await axios.get(`${baseURL}/scans`);
      console.log('✅ Retrieved scans:', getScansResponse.data.length, 'scans found');
      if (getScansResponse.data.length > 0) {
        console.log('   Latest scan:', getScansResponse.data[0]);
      }
    } catch (err) {
      console.log('❌ Scan retrieval failed:', err.response?.data || err.message);
    }

    // Test 6: Test Firebase data endpoint
    console.log('\n6. Testing Firebase data endpoint...');
    try {
      const firebaseDataResponse = await axios.get(`${baseURL}/firebase/data`);
      console.log('✅ Firebase data retrieved');
      console.log('   Raw data keys:', Object.keys(firebaseDataResponse.data.raw || {}));
      console.log('   Transformed data count:', firebaseDataResponse.data.transformed?.length || 0);
    } catch (err) {
      console.log('❌ Firebase data retrieval failed:', err.response?.data || err.message);
    }

    console.log('\n🎉 Backend integration test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure your MongoDB is running and connected');
    console.log('2. Verify your Firebase URL is correct in the frontend');
    console.log('3. Start the frontend dashboard to test the complete flow');
    console.log('4. Check that Firebase has data in the expected format');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBackendEndpoints();

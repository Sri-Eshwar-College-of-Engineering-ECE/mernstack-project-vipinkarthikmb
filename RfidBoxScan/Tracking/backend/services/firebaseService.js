const axios = require('axios');
const Scan = require('../models/Scan');

const FIREBASE_URL = 'https://rfidscanner-52fdb-default-rtdb.asia-southeast1.firebasedatabase.app/rfid.json';

class FirebaseService {
  constructor() {
    this.lastSyncTime = new Date();
    this.syncInterval = null;
  }

  /**
   * Fetch data from Firebase
   */
  async fetchFirebaseData() {
    try {
      const response = await axios.get(FIREBASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching Firebase data:', error.message);
      throw error;
    }
  }

  /**
   * Transform Firebase data to match our backend format
   */
  transformFirebaseData(firebaseData) {
    if (!firebaseData || typeof firebaseData !== 'object') {
      return [];
    }

    const transformedData = [];
    
    // Handle the Firebase data structure where keys are tag IDs
    Object.entries(firebaseData).forEach(([tagId, data]) => {
      if (data && typeof data === 'object') {
        const transformedItem = {
          tag: tagId,
          status: data.status || 'Scanned',
          time: data.time,
          timestamp: data.timestamp,
          box: data.box || 'Unknown',
          section: data.section || 'Warehouse' // Default section
        };
        transformedData.push(transformedItem);
      }
    });

    return transformedData;
  }

  /**
   * Sync Firebase data to local database
   */
  async syncFirebaseToDatabase() {
    try {
      console.log('Starting Firebase sync...');
      const firebaseData = await this.fetchFirebaseData();
      const transformedData = this.transformFirebaseData(firebaseData);

      let syncedCount = 0;
      let errorCount = 0;

      for (const item of transformedData) {
        try {
          // Check if this scan already exists
          const existingScan = await Scan.findOne({ 
            tag: item.tag, 
            timestamp: new Date(item.timestamp * 1000) // Convert Unix timestamp to Date
          });

          if (!existingScan) {
            // Parse timestamp
            let parsedTimestamp;
            if (item.timestamp) {
              let ts = Number(item.timestamp);
              // Convert to milliseconds if it's in seconds
              if (ts < 1000000000000) ts *= 1000;
              parsedTimestamp = new Date(ts);
            } else {
              parsedTimestamp = new Date();
            }

            const scanData = {
              tag: item.tag,
              box: item.box,
              status: item.status,
              timestamp: parsedTimestamp,
              time: item.time,
              section: item.section
            };

            const scan = new Scan(scanData);
            await scan.save();
            syncedCount++;
          }
        } catch (itemError) {
          console.error(`Error syncing item ${item.tag}:`, itemError.message);
          errorCount++;
        }
      }

      console.log(`Firebase sync completed. Synced: ${syncedCount}, Errors: ${errorCount}`);
      this.lastSyncTime = new Date();
      
      return {
        success: true,
        syncedCount,
        errorCount,
        lastSyncTime: this.lastSyncTime
      };
    } catch (error) {
      console.error('Firebase sync failed:', error.message);
      return {
        success: false,
        error: error.message,
        lastSyncTime: this.lastSyncTime
      };
    }
  }

  /**
   * Start automatic syncing
   */
  startAutoSync(intervalMinutes = 2) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    console.log(`Starting auto-sync every ${intervalMinutes} minutes`);
    this.syncInterval = setInterval(() => {
      this.syncFirebaseToDatabase();
    }, intervalMinutes * 60 * 1000);

    // Run initial sync
    this.syncFirebaseToDatabase();
  }

  /**
   * Stop automatic syncing
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isAutoSyncActive: !!this.syncInterval,
      lastSyncTime: this.lastSyncTime
    };
  }
}

module.exports = new FirebaseService();

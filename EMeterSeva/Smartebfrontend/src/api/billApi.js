import httpClient from './httpClient';

const API_URL = '/bills';

/**
 * Calculate bill details including fines and reminders
 * @param {number} billAmount - The base bill amount
 * @param {string} deadlineDate - The deadline date (ISO format or Date string)
 * @returns {Promise<Object>} Bill details with calculations
 */
export const calculateBillDetails = async (billAmount, deadlineDate) => {
  try {
    const response = await httpClient.post(`${API_URL}/calculate`, {
      billAmount,
      deadlineDate
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating bill details:', error);
    throw error.response?.data || error;
  }
};

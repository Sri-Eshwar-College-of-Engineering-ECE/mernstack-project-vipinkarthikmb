import httpClient from './httpClient';

const API_URL = '/consumers';

export const addConsumer = async (consumerData) => {
  const response = await httpClient.post(API_URL, consumerData);
  return response.data;
};

export const updateConsumer = async (consumerNumber, updatedData) => {
  const response = await httpClient.put(`${API_URL}/${consumerNumber}`, updatedData);
  return response.data;
};

export const deleteConsumer = async (consumerNumber) => {
  const response = await httpClient.delete(`${API_URL}/${consumerNumber}`);
  return response.data;
};

export const addReading = async (consumerNumber, payload) => {
  const response = await httpClient.put(`${API_URL}/add-reading/${consumerNumber}`, payload);
  return response.data;
};

export const getBillSummary = async (consumerNumber) => {
  try {
    const response = await httpClient.get(`${API_URL}/bill-summary/${consumerNumber}`);
    return response.data;
  } catch (error) {
    // Fallback to old details endpoint and transform the response
    try {
      const response = await httpClient.get(`${API_URL}/details/${consumerNumber}`);
      const data = response.data;

      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 30);

      return {
        consumerNumber: consumerNumber,
        name: data.name,
        address: data.address || 'N/A',
        phoneNumber: data.phoneNumber || 'N/A',
        meterSerialNumber: data.meterSerialNumber,
        tariffPlan: data.tariffPlan,
        billAmount: data.amount || 0,
        currentReading: data.currentReading || 0,
        paymentStatus: 'Pending',
        lastPaymentDate: null,
        billCycleDays: 30,
        nextPaymentDeadline: defaultDeadline,
        daysUntilDeadline: 30,
        isOverdue: false,
        isFineApplied: false,
        fineDetails: {
          fineAmount: 0,
          cgstOnFine: 0,
          sgstOnFine: 0,
          totalFineWithTax: 0,
        },
        totalAmountDue: data.amount || 0,
        reminderMessage: `ℹ️ Upcoming Bill: Your next payment is due on ${defaultDeadline.toDateString()} (30 days remaining)`,
        reminderType: 'notice',
      };
    } catch (fallbackError) {
      throw new Error('Bill details not found for this consumer number. Please check the consumer number and try again.');
    }
  }
};

export const markPaymentAsPaid = async (consumerNumber) => {
  const response = await httpClient.post(`${API_URL}/mark-paid/${consumerNumber}`);
  return response.data;
};

export const getConsumersWithFines = async () => {
  const response = await httpClient.get(`${API_URL}/fines/all`);
  return response.data;
};

export const getConsumersWithMissedReadings = async () => {
  const response = await httpClient.get(`${API_URL}/readings/missed`);
  return response.data;
};

import Payment from '../models/payment.js'; 

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addPayment = async (req, res) => {
  const { work, company, holder, amount, date, status } = req.body;

  if (!work || !company || !holder || !amount || !date || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newPayment = new Payment({ work, company, holder, amount, date, status });
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

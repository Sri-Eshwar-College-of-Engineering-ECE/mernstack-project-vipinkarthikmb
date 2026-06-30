import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  work: { type: String, required: true },
  company: { type: String, required: true },
  holder: { type: String, required: true },
  amount: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

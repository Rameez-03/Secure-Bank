import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plaidTransactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  amount: {
    type: Number,
    required: true,
    min: [-1_000_000_000, 'Amount cannot be less than -1,000,000,000'],
    max: [1_000_000_000, 'Amount cannot exceed 1,000,000,000'],
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters'],
  },
  pending: {
    type: Boolean,
    default: false,
  },
  isManual: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ plaidTransactionId: 1 });

export default mongoose.model('Transaction', TransactionSchema);

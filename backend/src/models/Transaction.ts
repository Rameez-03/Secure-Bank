import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  plaidTransactionId: string;
  accountId: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  category: string[];
  merchantName?: string;
  pending: boolean;
  paymentChannel?: string;
  transactionType?: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    plaidTransactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    
    amount: {
      type: Number,
      required: true,
    },
    
    currency: {
      type: String,
      required: true,
      default: 'GBP',
      uppercase: true,
    },
    
    date: {
      type: Date,
      required: true,
      index: true,
    },
    
    description: {
      type: String,
      required: true,
    },
    
    category: [{
      type: String,
    }],
    
    merchantName: {
      type: String,
    },
    
    pending: {
      type: Boolean,
      default: false,
    },
    
    paymentChannel: {
      type: String,
      enum: ['online', 'in store', 'other'],
    },
    
    transactionType: {
      type: String,
      enum: ['digital', 'place', 'special', 'unresolved'],
    },
    
    location: {
      address: String,
      city: String,
      region: String,
      postalCode: String,
      country: String,
      lat: Number,
      lon: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, pending: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
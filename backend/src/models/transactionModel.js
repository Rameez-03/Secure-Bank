import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plaidTransactionId: {
        type: String,
        unique: true,
        sparse: true  // Allows null values for manual transactions
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    pending: {
        type: Boolean,
        default: false
    },
    isManual: {
        type: Boolean,
        default: false  // true for user-created, false for Plaid transactions
    }
}, {
    timestamps: true
});

// Index for faster queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ plaidTransactionId: 1 });

export default mongoose.model('Transaction', TransactionSchema);
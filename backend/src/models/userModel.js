import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // Plaid Integration
    accessToken: {
        type: String,
        required: false
    },
    plaidItemId: {
        type: String,
        required: false
    },
    // User Data
    transactions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Transaction'
        }
    ],
    budget: {
        type: Number,
        required: false,
        default: 0
    },
    streaks: {
        type: Number,
        required: false,
        default: 0
    },
}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema);
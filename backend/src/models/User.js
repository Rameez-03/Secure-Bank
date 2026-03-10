import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    accessToken: {
        type: String,
        required: false
    },
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
    transactions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Transaction'
        }
    ],
    budget: {
        type: Number,
        required: false
    },
    streaks: {
        type: Number,
        required: false
    },
});

module.exports = mongoose.model('User', UserSchema);
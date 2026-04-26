import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address"],
      maxlength: [254, "Email cannot exceed 254 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [60, "Password hash length invalid"],
    },
    // Plaid integration — tokens are sensitive; do not expose in API responses by default
    accessToken: { type: String, select: false },
    plaidItemId: { type: String },
    plaidCursor: { type: String, default: null },
    // Password reset — hashed token + expiry; excluded from all default queries
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
    budget: { type: Number, default: 0, min: [0, "Budget cannot be negative"] },
  },
  { timestamps: true }
);

// Never return password or accessToken in default queries
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.accessToken;
  delete obj.plaidCursor;
  delete obj.plaidItemId;
  return obj;
};

export default mongoose.model("User", UserSchema);

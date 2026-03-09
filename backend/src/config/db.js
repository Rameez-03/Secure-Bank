import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONNECTED");
    } catch (error) {
        console.log("Error Mongo", error);
    }
}
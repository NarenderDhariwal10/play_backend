import mongoose from "mongoose";

const connectDB = async() =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("Mongodb Connection Successfull");
    } catch (error) {
        console.error("MongoDB Connection failed",error);
        process.exit(1);
    }
}

export default connectDB;
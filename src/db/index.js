import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { MONGO_URI } from "../../config/env.js";

const connectDB = async ()=>{
    try {
          
      const connecetionInstance = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`)
      console.log(`\n MongoDB connected !! DB HOST: ${connecetionInstance.connection.host}`)
        
    } catch (error) {
        console.log("MONGODB connection FAILED ", error)
        process.exit(1)
    }
}

export default connectDB;
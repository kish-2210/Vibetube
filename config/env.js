import { config } from "dotenv";

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {MONGO_URI,PORT,CORS_ORIGN,ACCESS_TOKEN_SECRET,ACCESS_TOKEN_EXPIRY,REFRESH_TOKEN_SECRET,REFRESH_TOKEN_EXPIRY,
    CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET} = process.env;
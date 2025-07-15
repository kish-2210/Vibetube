import {v2 as cloudinary} from "cloudinary"
import fs from "fs";
import { CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET,CLOUDINARY_CLOUD_NAME } from "../../config/env.js";


// Configuration
 cloudinary.config({ 
        cloud_name: CLOUDINARY_CLOUD_NAME, 
        api_key: CLOUDINARY_API_KEY, 
        api_secret: CLOUDINARY_API_SECRET
    });

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null //if path doesnt exist

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        // file uploaded
        console.log("file uploaded successfully",response.url);
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)  //removes the locally saved temp file,as operation failed
        return null
        
    }
}

export {uploadOnCloudinary};


import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        console.log("Starting to file uploading 10%")
        if(!localFilePath) return null
        console.log("Starting to file uploading 20%")
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });

        //file has been uploaded successfully
        console.log("File Uploaded Successfully on cloudinary URL : ".response.url);
        return response;
    }catch(error)
    {
        fs.unlinkSync(localFilePath) // remove locally saved file as the upload operation is failed
        return null;
    }
}

export {uploadOnCloudinary};
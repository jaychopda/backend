import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // file has been uploaded successfully
        // console.log("File Uploaded Successfully on cloudinary URL: ", response.url);
        fs.unlinkSync(localFilePath); // remove locally saved file after uploading to cloudinary
        return response;
    } catch (error) {
        console.log("Error: ", error);
        fs.unlinkSync(localFilePath); // remove locally saved file as the upload operation failed
        return null;
    }
};

export { uploadOnCloudinary };
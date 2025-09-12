const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const fs = require("node:fs/promises");



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



async function uploadImage(filePath) {
    let res = null;
    try {
        res = await cloudinary.uploader.upload(
            filePath, 
            {
                asset_folder: process.env.CLOUDINARY_UPLOAD_DIR
            }
        );
    } catch (error) {
        console.log(error);
        return {errors: [{msg: "Error uploading image"}]};
    }

    await fs.unlink(filePath);
    return res;
};



async function deleteImage(assetId) {
    let res = null;
    try {
        res = await cloudinary.uploader.destroy(assetId);
    } catch (error) {
        console.log(error);
        return {errors: [{msg: "Unable to delete image"}]};
    }
    if (res.result === "not found") {
        return {errors: [{msg: "Unable to delete image"}]};
    }

    return res;
};



module.exports = {
    uploadImage,
    deleteImage
};
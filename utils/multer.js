const multer = require("multer");



const fileSizeLimit = 10000000; //10mb


function filename(req, file, cb) {
    const fileParts = file.originalname.split(".");
    const extensionIndex = fileParts.length - 1;

    const fileExt = fileParts[extensionIndex];
    const fileName = `${req.user.username}.${fileExt}`;
    return cb(null, fileName);
};


function fileFilter(req, file, cb) {
    const fileTypes = /(\.jpeg|\.jpg|\.png)$/;
    const match = fileTypes.test(
        file.originalname.toLowerCase()
    );

    if (!match) {
        return cb(new Error("Jpegs or pngs only"));
    }

    return cb(null, true);
};


const storage = multer.diskStorage({
    destination: "uploads/",
    filename: filename
});


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: fileSizeLimit}
});



module.exports = upload;
import multer from 'multer';
import { CustomErrorHandler } from '../service/index.js';
import path from 'path';
// const path = require("path");
const serverpath = '../www/html/adis.co.in/cow_assets/';
const cattlefield = ["muzzleVideoStatus", "featureVideoStatus", "frontImageStatus", "backImageStatus", "leftImageStatus", "rightImageStatus", "user_profile_image", "user_signature"];
const userField = ["user_profile_image", "user_signature"];

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        console.log(file.fieldname);
        console.log(req.body.id);
        let server_cattle_assets = '../www/html/adis.co.in/refusal_assets'
        // if (fields.includes(file.cattlefield)) {
        //     cb(null, serverpath + "/" + req.body.user_id + "/" + req.body + cow_id);
        // } else if (fields.includes(file.userField)) { }
        // else {
        //     cb(null, serverpath + "/" + req.body.user_id + "/user_data");
        // }
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        var extname = path.extname(
            file.originalname).toLowerCase();
        //   cb(null, file.originalname + "-" + Date.now()+".jpg")
        file.fieldname === 'muzzleVideoStatus' && cb(null, 'muzzleVideo' + extname);
        file.fieldname === 'featureVideoStatus' && cb(null, 'featureVideo' + extname);
        file.fieldname === 'frontImageStatus' && cb(null, 'profile' + extname);
        file.fieldname === 'backImageStatus' && cb(null, 'backSideImage' + extname);
        file.fieldname === 'leftImageStatus' && cb(null, 'leftSideImage' + extname);
        file.fieldname === 'rightImageStatus' && cb(null, 'rightSideImage' + extname);
        file.fieldname === 'user_profile_image' && cb(null, 'profile' + extname);
        file.fieldname === 'user_signature' && cb(null, 'signature' + extname);
        file.fieldname === 'profile' && cb(null, file.originalname);
    }
})

// Define the maximum size for uploading
// picture i.e. 10 MB. it is optional
const maxSize = 10 * 1000 * 1000;

var imageUpload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png|mp4|MPEG-4|mkv/;
        console.log(file.fieldname);
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        // return cb(CustomErrorHandler.alreadyExist)
        return cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    },
    // mypic is the name of file attribute
}).fields(
    [
        {
            name: 'profile', maxCount: 1
        },
        {
            name: 'frontImageStatus', maxCount: 1
        },
        {
            name: 'backImageStatus', maxCount: 1
        },
        {
            name: 'leftImageStatus', maxCount: 1
        },
        {
            name: 'rightImageStatus', maxCount: 1
        },
        {
            name: 'muzzleVideoStatus', maxCount: 1
        },
        {
            name: 'featureVideoStatus', maxCount: 1
        },
        {
            name: 'user_profile_image', maxCount: 1
        },
        {
            name: 'user_signature', maxCount: 1
        },
    ]
);

export default imageUpload;
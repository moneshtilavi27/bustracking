import express from 'express';
import multer from 'multer';
import { loginController } from '../controllers/index.js'
import imageUpload from '../helper/imageUpload.js';
import auth from '../middlewares/auth.js';
const forms = multer().array();

const router =  express.Router();

router.post('/login',forms,loginController.login);

export default router;

// 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
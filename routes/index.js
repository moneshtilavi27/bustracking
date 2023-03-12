import express from 'express';
import multer from 'multer';
import { busController, childParentController, driverController, loginController, mapController } from '../controllers/index.js'
import imageUpload from '../helper/imageUpload.js';
import auth from '../middlewares/auth.js';
const forms = multer().array();

const router =  express.Router();

router.post('/login',forms,loginController.login);

router.post('/bus',auth,busController.addUpdateBus);
router.get('/bus',auth,busController.getBusData);

router.post('/driver',auth,driverController.addUpdateDriver);
router.get('/driver',auth,driverController.getDriver);

router.post('/map',auth,mapController.addUpdateMap);
router.get('/map',auth,mapController.getmapData);

router.post('/checkpoints',auth,mapController.addUpdateChechPoints);
router.get('/checkpoints',auth,mapController.getCheckPoints);

router.post('/pickupdrop',auth,mapController.addUpdatePickupDrop);
router.get('/pickupdrop',auth,mapController.getPickupDrop);

router.post('/leave',auth,childParentController.applyLeave);
router.get('/leave',auth,childParentController.getLeave);

router.post('/child',auth,childParentController.addUpdateChild);
router.post('/parent',auth,childParentController.addUpdateParent);
router.get('/getChildParent',auth,childParentController.getChildData);

export default router;

// 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
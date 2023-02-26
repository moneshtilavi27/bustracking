import express from "express";
import multer from "multer";

import { APP_PORT } from "./config/index.js";
import imageUpload from "./helper/imageUpload.js";
import errorHandler from "./middlewares/errorHandler.js";

// const forms = multer();


const app = express();
import routes from './routes/index.js';


app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use(forms.array());
// app.use(imageUpload);
app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization ,Accept');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    // res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use('/api/', routes);
app.use('/api/images', express.static('uploads'));

app.use(errorHandler);
app.listen(APP_PORT, () => console.log(`Listening app Post ${APP_PORT}`));
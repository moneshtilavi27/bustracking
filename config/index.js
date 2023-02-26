
import dotenv from 'dotenv';

dotenv.config();

export const {
    APP_PORT,
    DEBUG_MODE,
    JWT_SECRET
} = process.env;

export {getData, insertData, getCount } from './database.js';
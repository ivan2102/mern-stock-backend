import express from 'express';
const router = express.Router()
import { contactUs } from '../controllers/contactController.js';
import protectMiddleware from '../middleware/authMiddleware.js';


router.post('/', protectMiddleware, contactUs);

export default router
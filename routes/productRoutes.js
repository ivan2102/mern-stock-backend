import express from 'express';
const router = express.Router();
import { 
    createProduct,
     getProducts,
      productDetails,
      deleteProduct,
      updateProduct
     } from '../controllers/productController.js';
     import upload from '../utils/uploadImage.js';
import protectMiddleware from '../middleware/authMiddleware.js';


router.post('/', protectMiddleware, upload.single('image'), createProduct)
router.get('/', protectMiddleware, getProducts)
router.get('/:id', protectMiddleware,  productDetails)
router.delete('/:id', protectMiddleware, deleteProduct)
router.patch('/:id', protectMiddleware, upload.single('image'), updateProduct)

export default router
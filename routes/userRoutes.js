import express from "express";
const router = express.Router();
import { 
     registerUser,
     loginUser, 
     logoutUser,
      userProfile,
      updateUserProfile,
      changeUserPassword,
      forgotPassword,
      resetPassword,
      loginStatus
     } from "../controllers/authController.js";
import protectMiddleware from "../middleware/authMiddleware.js";

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.get('/profile', protectMiddleware, userProfile)
router.get('/loggedIn', loginStatus)
router.patch('/updateUser', protectMiddleware, updateUserProfile)
router.patch('/changePassword', protectMiddleware, changeUserPassword)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:resetToken', resetPassword)

export default router;
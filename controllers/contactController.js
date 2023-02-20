import dotenv from 'dotenv';
dotenv.config()
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const contactUs = asyncHandler (async(req, res) => {

   const {subject, message} = req.body

   const user = await User.findById(req.user._id)

   if(!user) {

    res.status(400)
    throw new Error('User not found')
   }



   try {

    const send_to = process.env.EMAIL_USER
    const send_from = process.env.EMAIL_USER
    const reply_to = user.email

    await sendEmail( subject, message, send_to, send_from, reply_to)
    res.status(200).json({success: true, msg: 'Success'})
    
   } catch (error) {
    
    res.status(500)
    throw new Error('Email failed')
   }
})

export {

    contactUs
}
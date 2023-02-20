import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const protectMiddleware = asyncHandler(async (req, res, next) => {

   try {

    const token = req.cookies.token

    if(!token) {

        res.status(401)
        throw new Error('Invalid token')
    }

    //verify token
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

    //user id from token
    const user = await User.findById(verifyToken.id).select('-password')

    if(!user) {

        res.status(401)
        throw new Error('User not found')
    }

    req.user = user
    next()
    
   } catch (error) {

    res.status(401)
    throw new Error('Not authorized')
    
   }
})

export default protectMiddleware
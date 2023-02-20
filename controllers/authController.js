import User from "../models/User.js";
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Token from "../models/Token.js";

const generateToken = (id) => {

  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1d'})
}

//register user
const registerUser = asyncHandler( async (req, res) => {

  const {name, email, password} = req.body

  if(!name || !email || !password) {

    res.status(400)
    throw new Error('Please provide all required fields')
  }

  if(password.length < 6) {

    res.status(400)
    throw new Error('Password must be at least 6 characters')
  }

  //check if user email already exists
const userExists =  await User.findOne({ email})

if(userExists) {

  res.status(400)
  throw new Error('Email already exists')
}


//create user
 const user = await User.create({ name, email, password })

 //generate token
const token = generateToken(user._id)

//send http-cookie
res.cookie('token', token, {

  path: '/',
  httpOnly: true,
  expires: new Date(Date.now() + 1000 * 86400),
  sameSite: 'none',
  secure: true
})

if(user) {

 res.status(201).json({

  _id: user._id,
  name: user.name,
  email: user.email,
  password: user.password,
  token
 })

}else {

res.status(400)
throw new Error('Invalid email or password')

 }

 })

 //login user
 const loginUser = asyncHandler(async (req, res) => {

const {email, password} = req.body

if(!email || !password) {

  res.status(400)
    throw new Error('Please provide email and password fields')
}


const user = await User.findOne({ email})

if(!user) {

  res.status(400)
  throw new Error('User not found')
}

//compare password
const passwordExists = await bcrypt.compare(password, user.password)

const token = generateToken(user._id)

if(passwordExists) {

res.cookie('token', token, {

  path: '/',
  httpOnly: true,
  expires: new Date(Date.now() + 1000 * 86400),
  sameSite: 'none',
  secure: true
})

}

if(user && passwordExists) {

  const {_id, name, email, password, photo, bio} = user

  res.status(200).json({

    _id,
    email,
    name,
    password,
    photo,
    bio,
    token
  })

}else {

  res.status(400)
  throw new Error('Invalid credentials')
}
 })

 //logout user
 const logoutUser = asyncHandler(async (req, res) => {

   res.cookie("token", "", {

    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true
   })

   return res.status(200).json({msg: 'Logged out'})
 })

//user profile
 const userProfile = asyncHandler(async (req, res) => {

const user = await User.findById(req.user._id)

if(user) {

  const {_id, name, email, password, photo, bio} = user

  res.status(200).json({

    _id,
    name,
    email,
    password,
    photo,
    bio
  })

}else {

  res.status(400)
  throw new Error('Invalid credentials')

}
 })

 //update user profile
 const updateUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)

    if(user) {

      const { name, email, photo, bio} = user

      user.email = email
      user.name = req.body.name || name
      user.bio = req.body.bio || bio
      user.photo = req.body.photo || photo

      const updatedUser = await user.save()

      res.status(200).json({

        _id: updatedUser._id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        photo: updatedUser.photo
      })

    }else {

       res.status(404)
       throw new Error('User not found')
    }
 })

 //change user password
 const changeUserPassword = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id)

  if(!user) {

    res.status(400)
    throw new Error('User not found')
  }

  const {oldPassword, password} = req.body

  if(!oldPassword || !password) {

    res.status(400)
    throw new Error('Please provide a password')
  }

  //check if old password matches new password
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

  //save user password
  if(user && passwordIsCorrect) {

    user.password = password

    await user.save()

    res.status(200).send('Password changed successfully')

  }else {

    res.status(400)
    throw new Error('Password does not match')
  }

 })

 //forgot password
 const forgotPassword = asyncHandler(async (req, res) => {

  const { email } = req.body

  const user = await User.findOne({email})

  if(!user) {

    res.status(404)
    throw new Error('User not found')
  }

  //delete token if exists in DB
  let token = await Token.findOne({userId: user._id})

  if(token) {

    await token.deleteOne()
  }

  //create reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id

  //hash token before sending to server
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  //save token to database
  await new Token({
     userId: user._id,
     token: hashedToken,
     createdAt: Date.now(),
     expiresAt: Date.now() + 30 * (60 * 1000)
      
      }).save()

      //reset url
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

      //reset email
      const message = `
      
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>
      <p>This reset link is only valid for 30 minutes</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

      <p>Regards...</p>
      <p>Ivan Nesic</p>
      `;

      const subject = 'Password reset request'
      const send_to = user.email
      const send_from = process.env.EMAIL_USER

      try {

        await sendEmail(subject, message, send_to, send_from)

        res.status(200).json({success: true, message: 'Reset email sent'})
        
      } catch (error) {

        res.status(500)
        throw new Error('Email notification failed')
        
      }
 })

 //reset password
 const resetPassword = asyncHandler (async (req, res) => {

  const { password } = req.body
  const { resetToken } = req.params

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  //find token in db
  const token = await Token.findOne({

    token: hashedToken,
    expiresAt: {$gt: Date.now()}
  })

  if(!token) {

    res.status(404)
    throw new Error('Token not found')
  }

  //find user
  const user = await User.findOne({_id: token.userId})
  user.password = password
  await user.save()

  res.status(200).json({msg: 'Password reset'})
 })

 //login status
 const loginStatus = asyncHandler(async (req, res) =>  {

  const token = req.cookies.token

  if(!token) {

    return res.json(false)
  }

  const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

  if(verifyToken) {

    return res.json(true)
  }

  return res.json(false)
 })

export {
    registerUser,
    loginUser,
    logoutUser,
    userProfile,
    updateUserProfile,
    changeUserPassword,
    forgotPassword,
    resetPassword,
    loginStatus
}
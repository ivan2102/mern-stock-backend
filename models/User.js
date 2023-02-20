import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const UserSchema =  new mongoose.Schema({
    name: {type: String, required: [true, 'Please provide a name']},
    email: {type: String, required: [true, 'Please provide an email'], unique: true, trim: true, match: [ /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']},
    password: {type: String, required: [true, 'Please provide a password'], minLength: [6, 'Please enter at least 6 characters']},
    photo: {type: String, required: [true, 'Please provide a photo'], default: 'https://cdn.pixabay.com/photo/2017/01/31/21/22/avatar-2027363__340.png'},
    bio: {type: String, default: 'bio', maxLength: [50, 'Please enter at least 50 characters']},

}, {

    timestamps: true
})

//encrypt password
UserSchema.pre('save', async function(next) {

    if(!this.isModified("password")) {

        return next()
    }

//hashed password
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(this.password, salt)
this.password = hashedPassword
next()

})

export default mongoose.model('User', UserSchema)
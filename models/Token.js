import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({

  userId: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  token: {type: String, required: true},
  createdAt: {type: Date, required: true},
  expiresAt: {type: Date, required: true}
})

export default mongoose.model('Token', TokenSchema)
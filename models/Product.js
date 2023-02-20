import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({

user: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
name: {type: String, required: [true, 'Please provide a name'], trim: true},
category: {type: String, required: [true, 'Please provide a category'], trim: true},
quantity: {type: Number, required: [true, 'Please provide a quantity'], trim: true},
price: {type: Number, required: [true, 'Please provide a price'], trim: true},
description: {type: String, required: [true, 'Please provide a description'], trim: true},
image: {type: Object,default: {}}
}, {

    timestamps: true
})

export default mongoose.model('Product', ProductSchema)
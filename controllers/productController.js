import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import cloudinary from 'cloudinary';

const createProduct = asyncHandler (async (req, res) => {

if(
    !req.body.name || 
     !req.body.category ||
      !req.body.price || 
      !req.body.quantity ||
       !req.body.description ) {

    res.status(400)
    throw new Error('Please provide all required fields')
}

// Handle Files upload
let fileData = {};
if (req.file) {
  // Save to cloudinary
  let uploadedFile;
  try {
    uploadedFile = await cloudinary.uploader.upload(req.file.path, {
      folder: "Pinvent",
      resource_type: "image",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Image could not be uploaded.");
  }

  fileData = {
    fileName: req.file.originalname,
    filePath: uploadedFile.secure_url,
    fileType: req.file.mimetype,
    fileSize: fileSizeFormatter(req.file.size, 2),
  };

}
const product = await Product.create({
    user: req.user.id,
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    quantity: req.body.quantity,
    description: req.body.description,
    image: fileData
    
    
});

res.status(201).json(product)
})

//get all products
const getProducts = asyncHandler (async (req, res) => {

   const products = await Product.find({user: req.user.id}).sort('-createdAt')

   if(!products) {

    res.status(404)
    throw new Error('Product not found')
   }

   res.status(200).json(products)
})

//get single product
const productDetails = asyncHandler (async (req, res) => {

    const product = await Product.findById(req.params.id)

    if(!product) {

        res.status(404)
        throw new Error('Product not found')
    }

    if(product.user.toString() !== req.user.id) {

        res.status(401)
        throw new Error('User not authorized')
    }

    res.status(200).json(product)

})

//delete product
const deleteProduct = asyncHandler (async (req, res) => {
    
   const product = await Product.findById(req.params.id)

   if(!product) {

    res.status(404)
    throw new Error('Product not found')
   }

   if(product.user.toString() !== req.user.id) {

    res.status(401)
    throw new Error('User not authorized')
   }

   await product.remove()
   res.status(200).json(product)
})

//update product
const updateProduct = asyncHandler (async (req, res) => {

   

    const {id} = req.params

   const product = await Product.findById(id)

   if(!product) {

    res.status(404)
    throw new Error('Product not found')
   }
   if(product.user.toString() !== req.user.id) {

    res.status(401)
    throw new Error('User not authorized')
   }




   const updatedProduct = await Product.findByIdAndUpdate(

    { _id: id },
    {
      name: req.body.name,
      category: req.body.category,
      quantity: req.body.quantity,
      price: req.body.price,
      description: req.body.description,

    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);

})


export {

    createProduct,
    getProducts,
    productDetails,
    deleteProduct,
    updateProduct
}

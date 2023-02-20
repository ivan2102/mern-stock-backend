import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import contactRoutes from './routes/contactRoutes.js';


const app = express()

//middlewares
app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//file upload middlewares
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use(
    cors({
    origin: ['http://localhost:3000', 'https://mern-stock.vercel.app'],
    credentials: true
}))




app.get('/', (req, res) => {

    res.send("API is running...")
})

//routes
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/contact', contactRoutes)

//error middlewares
app.use(errorHandler)

const PORT = process.env.PORT || 5000

//connect to mongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {

    app.listen(PORT, () => {

        console.log(`Server listening on port ${PORT}`);
    })
})
.catch((err) => {

    console.log(err);
})
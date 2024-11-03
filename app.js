import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import bodyParser from "body-parser";
import { v2 as cloudinary } from 'cloudinary';

// Import Routes
import authRouter from "./routes/auth-router.js";
import productRouter from "./routes/product-router.js";
import orderRouter from "./routes/order-router.js";

// Error Handler
import { notFound, errorHandler } from "./middlewares/error-handler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.json());
app.use(helmet());
app.use(ExpressMongoSanitize());
app.use(cors({
    origin: ["https://mern-commerce-client.vercel.app", "http://localhost:5173"],
    credentials: true
}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", orderRouter);

app.use(notFound);
app.use(errorHandler);

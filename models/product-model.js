import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minLength: [3, "Name must be at least 3 characters"],
        unique: true
    },
    price: {
        type: Number,
        required: [true, "Price is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minLength: [3, "Description must be at least 3 characters"]
    },
    images: {
        type: String,
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["shirt", "t-shirt", "pants", "jacket", "accessories", "shoes", "other"]
    },
    stock: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model("Product", productSchema);
export default Product;

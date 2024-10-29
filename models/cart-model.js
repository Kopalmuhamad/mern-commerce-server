import mongoose from "mongoose";
import Product from "./product-model.js"; // Pastikan path ke model Product sudah benar

const itemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"]
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0 // Default sementara, akan dihitung ulang pada middleware
    }
}, { timestamps: true });

// Middleware untuk menghitung totalPrice berdasarkan quantity dan harga produk
itemSchema.pre("save", async function (next) {
    if (this.isModified("quantity") || this.isNew) {
        const product = await Product.findById(this.product);
        if (!product) {
            throw new Error("Product not found");
        }
        this.totalPrice = this.quantity * product.price; // Menghitung totalPrice
    }
    next();
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [itemSchema]
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;

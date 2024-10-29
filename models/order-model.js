import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
    },
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
    total: {
        type: Number,
        required: [true, "Total amount is required"]
    },
    status: {
        type: String,
        required: [true, "Order status is required"],
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    statusPayment: {
        type: String,
        required: [true, "Payment status is required"],
        enum: ["unpaid", "paid"],
        default: "unpaid"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: {
        type: String,
        required: [true, "First name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    address: {
        type: String,
        required: [true, "Shipping address is required"]
    }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;

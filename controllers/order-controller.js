// controllers/order-controller.js
import { asyncHandler } from "../middlewares/async-handler.js";
import Order from "../models/order-model.js";
import Product from "../models/product-model.js";

export const createOrder = asyncHandler(async (req, res) => {
    const { email, firstName, lastName, phone, address, cartItem } = req.body;

    if (!cartItem || cartItem.length === 0) {
        res.status(400);
        throw new Error("Cart item is empty");
    }

    let total = 0;
    const orderItems = [];

    for (const item of cartItem) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        const orderItem = {
            product: product._id,
            quantity: item.quantity,
            price: product.price,
            total: product.price * item.quantity
        };

        orderItems.push(orderItem);
        total += orderItem.total;
    }

    const order = await Order.create({
        orderItems,
        total,
        status: "pending",
        statusPayment: "unpaid",
        user: req.user._id,
        firstName,
        lastName,
        phone,
        email,
        address
    });

    res.status(201).json({
        message: "Order created successfully",
        data: order
    });
});

export const getAllOrder = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate("product", "name images price");

    return res.status(200).json({
        message: "Retrieved all orders",
        data: orders,
    });
});

export const getDetailOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("product", "name images price");

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    return res.status(200).json({
        message: "Retrieved order details",
        data: order,
    });
});

export const currentUserOrder = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate("orderItems.product", "name images price");

    res.status(200).json({
        message: "Retrieved current user orders",
        data: orders,
    });
});


export const updateOrder = asyncHandler(async (req, res) => {
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedOrder) {
        res.status(404);
        throw new Error("Order not found");
    }

    return res.status(200).json({
        message: "Order updated successfully",
        data: updatedOrder,
    });
});

export const deleteOrder = asyncHandler(async (req, res) => {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
        res.status(404);
        throw new Error("Order not found");
    }

    return res.status(200).json({
        data: deletedOrder,
        message: "Order deleted successfully",
    });
});

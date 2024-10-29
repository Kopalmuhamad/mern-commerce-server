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

    for (const cart of cartItem) {
        const productData = await Product.findById(cart.product);
        if (!productData) {
            res.status(404);
            throw new Error("Product not found");
        }

        const { name, price, _id } = productData;
        const orderItem = {
            quantity: cart.quantity,
            name: name,
            price: price,
            product: _id,
            total: price * cart.quantity
        };

        orderItems.push(orderItem);
        total += price * cart.quantity;
    }

    const order = await Order.create({
        email,
        firstName,
        lastName,
        phone,
        address,
        total,
        status: "pending",
        statusPayment: "unpaid",
        user: req.user._id,
        ...orderItems[0] // mengisi item pertama dari orderItems ke skema order
    });

    return res.status(201).json({
        message: "Order created successfully",
        order,
        total
    });
});

export const getAllOrder = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate("product", "name images price");

    return res.status(200).json({
        data: orders,
        message: "Retrieved all orders"
    });
});

export const getDetailOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("product", "name images price");

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    return res.status(200).json({
        data: order,
        message: "Retrieved order details"
    });
});

export const currentUserOrder = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate("product", "name images price");

    return res.status(200).json({
        data: orders,
        message: "Retrieved current user orders"
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
        data: updatedOrder
    });
});

export const deleteOrder = asyncHandler(async (req, res) => {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
        res.status(404);
        throw new Error("Order not found");
    }

    return res.status(200).json({
        message: "Order deleted successfully",
        data: deletedOrder
    });
});

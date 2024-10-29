import { asyncHandler } from "../middlewares/async-handler.js";
import Cart from "../models/cart-model.js";
import Product from "../models/product-model.js";

// Create or Update Cart Item
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        res.status(400);
        throw new Error("Product ID and quantity are required.");
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            items: [{ product: productId, quantity }]
        });
    } else {
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }
    }
    await cart.save();

    res.status(200).json({
        message: "Product added or updated in cart",
        data: await cart.populate("items.product", "name price images")
    });
});

// Read Cart
export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price images");

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    res.status(200).json({
        message: "Retrieved user cart",
        data: cart
    });
});

// Update Cart Item Quantity
export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (!existingItem) {
        res.status(404);
        throw new Error("Product not found in cart");
    }

    existingItem.quantity = quantity;
    await cart.save();

    res.status(200).json({
        message: "Cart item updated successfully",
        data: await cart.populate("items.product", "name price images")
    });
});

// Delete Cart Item
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { items: { product: productId } } },
        { new: true }
    ).populate("items.product", "name price images");

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    res.status(200).json({
        message: "Product removed from cart",
        data: cart
    });
});

// Delete All Cart Items
export const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(200).json({
        message: "Cart cleared successfully"
    });
});

// Get Cart Item by ID
export const getCartItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ "items._id": itemId }, { "items.$": 1 }).populate("items.product", "name price images");

    if (!cart || !cart.items.length) {
        res.status(404);
        throw new Error("Item not found in cart");
    }

    res.status(200).json({
        message: "Retrieved cart item details",
        data: cart.items[0]
    });
});

// Update Cart Item by ID
export const updateCartItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOneAndUpdate(
        { "items._id": itemId },
        { $set: { "items.$.quantity": quantity } },
        { new: true, runValidators: true }
    ).populate("items.product", "name price images");

    if (!cart) {
        res.status(404);
        throw new Error("Item not found in cart");
    }

    const item = cart.items.find(item => item._id.toString() === itemId);
    const product = await Product.findById(item.product);
    item.totalPrice = item.quantity * product.price;
    await cart.save();

    res.status(200).json({
        message: "Cart item updated successfully",
        data: item
    });
});

// Delete Cart Item by ID
export const deleteCartItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const cart = await Cart.findOneAndUpdate(
        { "items._id": itemId },
        { $pull: { items: { _id: itemId } } },
        { new: true }
    ).populate("items.product", "name price images");

    if (!cart) {
        res.status(404);
        throw new Error("Item not found in cart");
    }

    res.status(200).json({
        message: "Cart item deleted successfully",
        data: cart
    });
});

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

    // Temukan cart berdasarkan user ID
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price images");

    if (!cart) {
        // Jika cart tidak ada, buat cart baru
        cart = new Cart({
            user: req.user._id,
            items: [{ product: productId, quantity }]
        });
    } else {
        // Jika cart ada, cari item yang sudah ada
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            // Jika item sudah ada, tambahkan kuantitas
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.quantity * product.price; // Update totalPrice
        } else {
            // Jika item tidak ada, tambahkan item baru
            cart.items.push({ product: productId, quantity, totalPrice: quantity * product.price });
        }
    }

    // Simpan cart setelah melakukan perubahan
    await cart.save();

    res.status(200).json({
        message: "Product added or updated in cart",
        data: cart
    });
});

// Read Cart
export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.product", "name price images")
        .lean(); // Use lean for better performance

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

    if (!productId || quantity == null) {
        res.status(400);
        throw new Error("Product ID and quantity are required.");
    }

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
        data: existingItem
    });
});

// Delete Cart Item
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // Pastikan productId yang diberikan adalah valid
    if (!productId) {
        res.status(400);
        throw new Error("Product ID is required.");
    }

    // Temukan cart berdasarkan user ID
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    // Cek apakah item ada di dalam cart
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (!existingItem) {
        res.status(404);
        throw new Error("Product not found in cart");
    }

    // Hapus item dari cart
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({
        message: "Product removed from cart",
    });
});

// Clear Cart
export const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(200).json({
        message: "Cart cleared successfully"
    });
});
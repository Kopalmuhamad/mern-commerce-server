import express from "express";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cart-controller.js";
import { protectedMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/cart", protectedMiddleware, addToCart); // Create or Add to Cart
router.get("/cart", protectedMiddleware, getCart); // Get Cart for current user
router.put("/cart", protectedMiddleware, updateCartItem); // Update Cart Item Quantity for current user
router.delete("/cart/:productId", protectedMiddleware, removeFromCart); // Remove Item from Cart by Product ID
router.delete("/cart", protectedMiddleware, clearCart); // Clear All Cart Items


export default router;

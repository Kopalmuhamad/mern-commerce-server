import express from "express"
import { createOrder, currentUserOrder, deleteOrder, getAllOrder, getDetailOrder, updateOrder } from "../controllers/order-controller.js"
import { adminMiddleware, protectedMiddleware } from "../middlewares/auth-middleware.js"

const router = express.Router()

router.post("/order", protectedMiddleware, createOrder)
router.get("/orders", protectedMiddleware, adminMiddleware, getAllOrder)
router.get("/orders/current-user", protectedMiddleware, currentUserOrder)
router.get("/order/:id", protectedMiddleware, getDetailOrder)
router.put("/order/:id", protectedMiddleware, adminMiddleware, updateOrder)
router.delete("/order/:id", protectedMiddleware, deleteOrder)

export default router
import express from "express"
import { createProduct, deleteProduct, fileUpload, getAllProduct, getDetailProduct, updateProduct } from "../controllers/product-controller.js"
import { adminMiddleware, protectedMiddleware } from "../middlewares/auth-middleware.js"
import { upload } from "../utils/upload-file-handler.js"

const router = express.Router()

router.post("/product", protectedMiddleware, adminMiddleware, createProduct)
router.get("/products", getAllProduct)
router.get("/product/:id", getDetailProduct)
router.put("/product/:id", protectedMiddleware, adminMiddleware, updateProduct)
router.delete("/product/:id", protectedMiddleware, adminMiddleware, deleteProduct)
router.post("/product/file-upload", protectedMiddleware, adminMiddleware, upload.single('image'), fileUpload)

export default router
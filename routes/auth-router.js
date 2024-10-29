import express from "express"
import { getCurrentUser, loginUser, logoutUser, registerUser, updateUser } from "../controllers/auth-controller.js"
import { protectedMiddleware } from "../middlewares/auth-middleware.js"
import { uploadSingleImage } from "../utils/upload-file-handler.js"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/current-user", protectedMiddleware, getCurrentUser)
router.get("/logout", protectedMiddleware, logoutUser)
router.put("/update", protectedMiddleware, uploadSingleImage, updateUser);

export default router
import { asyncHandler } from "./async-handler.js";
import jwt from "jsonwebtoken";
import User from "../models/user-model.js";

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    } else {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user.role === "owner") {
        next();
    } else {
        res.status(401);
        throw new Error("Not authorized, owner only");
    }
});

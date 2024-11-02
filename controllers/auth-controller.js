import { asyncHandler } from "../middlewares/async-handler.js"
import User from "../models/user-model.js"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '6d'
    })
}

const createResToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    const cookieOption = {
        expires: new Date(
            Date.now() + 6 * 24 * 60 * 60 * 1000
        ),
        secure: process.env.NODE_ENV === "production",
        path: '/',
    }

    res.cookie('jwt', token, cookieOption)

    user.password = undefined

    res.status(statusCode).json({
        data: user
    })
}

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    // Validasi: Pastikan semua field wajib diisi
    if (!username || !email || !password || !phoneNumber) {
        res.status(400);
        throw new Error("Username, email, password, and phone number are required.");
    }

    const existingUser = await User.findOne({
        $or: [
            { username },
            { email },
            { phoneNumber }
        ]
    });

    if (existingUser) {
        res.status(400);
        throw new Error("User with this username, email, or phone number already exists.");
    }

    const isOwner = (await User.countDocuments() === 0);
    const role = isOwner ? "owner" : "user";

    // Buat user baru
    const createUser = await User.create({
        username,
        email,
        password,
        phoneNumber,
        role
    });

    createResToken(createUser, 201, res);
});



export const loginUser = asyncHandler(async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400)
        throw new Error('Please add email and password')
    }

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        res.status(400)
        throw new Error('User not found')
    }

    if (user && (await user.comparePassword(req.body.password))) {
        createResToken(user, 200, res)
    } else {
        res.status(400)
        throw new Error('Invalid Password')
    }

})

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password')

    if (user) {
        res.json({
            data: user
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

export const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(200).json({
        message: "Logout success"
    })
})

export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const updates = {
        username: req.body.username || user.username,
        email: req.body.email || user.email,
        address: req.body.address || user.address,
        phoneNumber: req.body.phoneNumber || user.phoneNumber
    };

    if (req.body.password) {
        const salt = await bcryptjs.genSalt(10);
        updates.password = await bcryptjs.hash(req.body.password, salt);
    }

    if (req.file) {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "profile_images" },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const uploadResult = await streamUpload(req);
        updates.image = uploadResult.secure_url; // Save the Cloudinary URL
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true
    }).select("-password");

    res.status(200).json({
        data: updatedUser
    });
});


import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        minLength: [3, "Username must be at least 3 characters"],
        unique: [true, "Username already exists"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        validate: {
            validator: validator.isEmail,
            message: "Email is not valid"
        }
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"], // Tambahkan ini agar wajib
        unique: true,
        validate: {
            validator: (value) => validator.isMobilePhone(value, 'any'),
            message: "Phone number is not valid"
        }
    },
    address: {
        type: String
    },
    image: {
        type: String
    },
    role: {
        type: String,
        enum: ["owner", "user"],
        default: "user"
    }
});

// Hash password sebelum disimpan
userSchema.pre("save", async function (next) {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
});

// Metode untuk membandingkan password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

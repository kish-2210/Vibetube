import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } from "../../config/env.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },

        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String,
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video "
            }
        ],

        password: {
            type: String,
            require: [true, 'Password is required']
        },

        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAcessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        }

    )
}


export const User = mongoose.model("User", userSchema)
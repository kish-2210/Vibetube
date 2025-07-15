import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    //get user details from frontend
    const { username, fullName, email, password } = req.body

    // validation
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");

    }
    // check idf user already exist: username,email
    const existingUser = User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) throw new ApiError(409, "User with email or username already exist")

    // check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;       //res.files-from mutler middleware
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required")


    // upload to cloudinary, check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password anf refresh token field from response
    //.select() - method is used to specify which fields to include or exclude in the results of a query.
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // check for user creation
    if (!createdUser) throw new ApiError(500, "Something went wrong while registering")

    // return response or error
    return res.status(201).json(
        new ApiResponse(200, creadtedUser, "User registered successfully")
    )

})

export { registerUser }
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../../config/env.js";

const generateAccessandRefreshTockens = async(userId)=>{
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken() 

        user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false})

       return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating tockens")
        
    }
}

const registerUser = asyncHandler(async (req, res) => {

    //get user details from frontend
    const { username, fullName, email, password } = req.body

    // validation
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");

    }
    // check idf user already exist: username,email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) throw new ApiError(409, "User with email or username already exist")

    // check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path; //res.files-from mutler middleware
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path
    }

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
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    // req body ->data
    const {email,username,password} = req.body

    // username or email
    if(!(username || email)){
      throw new ApiError(400,"username or email is required")
    }

    // find the user
    const user = await User.findOne({ 
        $or: [{ username }, { email }] 
    })

    if(!user) throw new ApiError(404,"User doesnt exist!");

    // check password
    const isValidPassword = await user.isPasswordCorrect(password);
    if(!isValidPassword) throw new ApiError(401,"Invalid user credintials");

    // access and referesh token
   const {accessToken,refreshToken} = await generateAccessandRefreshTockens(user._id);
     // send secure cookie
    const loggedInUser =  await User.findById(user._id).select("-password -refereshToken")
    //sending cookie 
    const options = {
        httpOnly: true,
        secure: true
    }
    //  send response
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    // find the user - from verifyJWT middleware
    // clear the refresh token
  await User.findByIdAndUpdate(req.user._id,
    { $set:{refreshToken: undefined} },
     {new: true}
   )
    // clear the cookies
     const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refereshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res,next)=>{
   const incommingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;
   
   if(!incommingRefreshToken) throw new ApiError(401,"Unauthorized request");

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      REFRESH_TOKEN_SECRET
     )
  
     const user = await User.findById(decodedToken?._id);
     if(!user) throw new ApiError(401,"Invaild refresh token");
  
     if(incommingRefreshToken !== user?.refreshToken) throw new ApiError(401,"Refresh token is expired or used");
  
     const options = {
      httpOnly: true,
      secure: true
     }
  
    const{newAccessToken,newRefreshToken} = await generateAccessandRefreshTockens(user._id)
  
     return res
     .status(200)
     .cookie("accessToken",newAccessToken,options)
     .cookie("refreshToken", newRefreshToken,options)
     .json(
        new ApiResponse(
          200,
          {accessToken:newAccessToken,refreshToken: newRefreshToken},
          "Access token refreshed"
        )
     )
  } catch (error) {
     throw new ApiError(401,error?.message || "Invalid refresh token")
  }

})

export { registerUser , loginUser ,logoutUser ,refreshAccessToken }
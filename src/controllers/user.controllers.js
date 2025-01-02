import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, password, email } = req.body;

    if ([fullname, username, email, password].some((item) => item?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath = req.files.coverImage[0].path;

    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullname:fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email:email,
        password:password,
        username: username.toLowerCase()
    });

    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );


    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, isUserCreated, "User Registered Successfully")
    );
});

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    }catch(err){
        console.log("Error : ",err)
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if(!email && !username){
        throw new ApiError(400, "Email or Username is required")
    }

    if(!password){
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(404, "User not found!!!")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid Password")
    }

    const{accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(new ApiResponse(
        200,
        {
            user : loggedInUser, accessToken, refreshToken
        },
        "User Logged In Successfully"
    ))

})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true,
        }
    )

    const option = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401, "invalid refresh token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "refresh token is expired or used") 
        }
    
        const option = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",refreshToken,option)
        .json(new ApiResponse(200, {accessToken,refreshToken},"Access Token Refreshed Successfully"));
    } catch (error) {
            throw new ApiError(401, error.message || "Invalid Refresh Token")
        
    }
    
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old Password and New Password are required");
    }
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Old Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
    return res.status(200)
    .json(new ApiResponse(200, req.user, "User Details Fetched Successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) =>{
    const {fullname, username, email} = req.body;

    if([fullname, username, email].some((item) => item?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set:{
            fullname,
            username,
            email
        }
    }, {
        new: true,
    }).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar file");
    }

    await User.findByIdAndUpdate(req.user._id, {
        $ser:{
            avatar: avatar.url
        }
    }, 
    {
        new: true,
    })

    return res.status(200)
    .json(new ApiResponse(200, {avatar: avatar.url}, "Avatar Updated Successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const userCoverImageLocalPath = req.file?.avatar[0]?.path;

    if (!userCoverImageLocalPath) {
        throw new ApiError(400, "Cover Image is required");
    }

    const coverImage = await uploadOnCloudinary(userCoverImageLocalPath);

    if (!coverImage) {
        throw new ApiError(400, "Error while uploading cover image file");
    }

    await User.findByIdAndUpdate(req.user._id, {
        $ser:{
            coverImage: coverImage.url
        }
    }, 
    {
        new: true,
    })

    return res.status(200)
    .json(new ApiResponse(200, {coverImage: coverImage.url}, "Cover Image Updated Successfully"))
})

export { registerUser ,loginUser, logOutUser, refreshAccessToken, changePassword, currentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage};
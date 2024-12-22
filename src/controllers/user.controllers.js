import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    // return res.status(200).json({
    //     message : "ok"
    // })
    const {fullName, username, password, email} = req.body
    console.log("Email : ",email)

    //method 1
    // if(fullName===""){
    //     throw new ApiError(400,"fullname is required")
    // }

    //method 2
    if([fullName,username,email,password].some((item)=> item?.trim()==="")){
        throw new ApiError(400,"All field are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username is already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log(avatar)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!isUserCreated){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,isUserCreated,"User Registered Successfully")
    )
})

export {registerUser}
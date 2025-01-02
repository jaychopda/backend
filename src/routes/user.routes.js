import { Router } from "express";
import { registerUser,
    loginUser, 
    logOutUser, 
    refreshAccessToken, 
    changePassword, 
    currentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory
} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/loginUser").post(loginUser)

router.route("/logOutUser").post(verifyJWT, logOutUser)

router.route("/refreshAccessToken").post(refreshAccessToken)

router.route("/changePassword").post(verifyJWT, changePassword)

router.route("/currentUser").post(verifyJWT, currentUser)

router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails)

router.route("/updateUserAvatar").patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

router.route("/updateUserCoverImage").patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/getWatchHistory").get(verifyJWT, getWatchHistory)


export default router
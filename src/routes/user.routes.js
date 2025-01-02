import { Router } from "express";
import { registerUser,loginUser, logOutUser, refreshAccessToken} from "../controllers/user.controllers.js";
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

export default router
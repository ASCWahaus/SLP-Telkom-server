import express from 'express'
import { forgotPassword, login, register, login2, register2, resetPassword, verifyEmail } from '../controllers/authController.js';
import { isNotVerified } from '../middleware/auth.js';


const router = express.Router()

router.post("/register", register)

router.post("/register2", register2)

router.get("/success", verifyEmail)

router.post("/login",isNotVerified, login)

router.post("/login2",isNotVerified, login2)

router.post("/forgotpassword", forgotPassword)

router.put("/resetpassword/:resetToken", resetPassword)


export default router;
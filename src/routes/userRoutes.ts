import express from "express";
import { registerUser,verifyOTP,resendOTP,login,forgotPsw,forgotOtp,resetPsw,googleAuth } from '../controller/userController';

const router = express.Router();

router.post("/register", registerUser);
router.post('/register-otp',verifyOTP)
router.post('/resent-otp',resendOTP)
router.post('/login',login)
router.post('/forgotPsw',forgotPsw)
router.post('/forgotOtp',forgotOtp)
router.put('/resetPsw',resetPsw)
router.post('/googleAuth',googleAuth)

export default router;


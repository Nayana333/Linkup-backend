import express from "express";
import { registerUser,verifyOTP,resendOTP,login } from '../controller/userController';

const router = express.Router();

router.post("/register", registerUser);
router.post('/register-otp',verifyOTP)
router.post('/resent-otp',resendOTP)
router.post('/login',login)

export default router;


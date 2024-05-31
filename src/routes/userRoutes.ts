import express from "express";
import { registerUser,verifyOTP } from '../controller/userController';

const router = express.Router();

router.post("/register", registerUser);
router.post('/register-otp',verifyOTP)

export default router;

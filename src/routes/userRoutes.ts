import express from "express";
import { registerUser,verifyOTP,resendOTP,login,forgotPsw,forgotOtp,resetPsw,googleAuth,setPreferences,basicInformation} from '../controller/userController';

const router = express.Router();

router.post("/register", registerUser);
router.post('/register-otp',verifyOTP)
router.post('/resent-otp',resendOTP)
router.post('/login',login)
router.post('/forgotPsw',forgotPsw)
router.post('/forgotOtp',forgotOtp)
router.put('/resetPsw',resetPsw)
router.post('/googleAuth',googleAuth)
router.post('/setPreferences',setPreferences)
router.post('/basicInformation',basicInformation)

export default router;


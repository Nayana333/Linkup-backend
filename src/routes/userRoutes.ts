import express from "express";
import {
    registerUser, verifyOTP, resendOTP, login, forgotPsw, forgotOtp, resetPsw, googleAuth, setPreferences, basicInformation, setUserRole,
    userSuggestions, getUserDetails, searchAllCollections, getNotifications,
} from '../controller/userController';

import { getPremiumUserData, initiatecheckout, validatePayment } from '../controller/checkoutController'

import { protect } from '../middleware/auth'
const router = express.Router();

router.post("/register", registerUser);
router.post('/register-otp', verifyOTP)
router.post('/resent-otp', resendOTP)
router.post('/login', login)
router.post('/forgotPsw', forgotPsw)
router.post('/forgotOtp', forgotOtp)
router.put('/resetPsw', resetPsw)
router.post('/googleAuth', googleAuth)
router.post('/setPreferences', protect, setPreferences)
router.post('/basicInformation', protect, basicInformation)
router.put('/setUserRole', protect, setUserRole)
router.post('/userSuggestions', protect, userSuggestions)
router.get('/userDeatils/:userId', protect, getUserDetails)
router.get("/search", protect, searchAllCollections);
router.post('/getNotifications', protect, getNotifications)
router.post("/allTransactions", protect, getPremiumUserData);
router.post("/checkout", protect, initiatecheckout);
router.post("/validate", protect, validatePayment);




export default router;


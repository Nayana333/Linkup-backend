import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import User from "../model/user/userModel";
import { UserType } from "../model/user/userType";
const speakeasy = require('speakeasy');
import bcrypt from "bcryptjs";
// import sendVerifyMail from '../utils/sendVerifyMail'


export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    const existingUser = await User.findOne({ userName });
    if (existingUser) {
        res.status(400);
        throw new Error('Username already exists');
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(400);
        throw new Error('Email already registered');
    }
    const otp = speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        digits: 4, 
      });


      const sessionData=req.session!;
      sessionData.userDetails={userName,email,password}
      sessionData.otp=otp;
      sessionData.otpGeneratedTime=Date.now()
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword=await bcrypt.hash(password,salt)
      sessionData.userDetails!.password = hashedPassword;
    //   sendVerifyMail(req, userName, email);
      res.status(200).json({ message: "OTP sent for verification", email, otp });
      

      
});



export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { otp } = req.body;

    console.log(`Received OTP: ${otp}`);
    console.log(`Type of received OTP: ${typeof otp}`);

    if (!otp) {
        res.status(400);
        throw new Error('Cannot receive OTP');
    }

    const sessionData = req.session!;
    const storedOTP = sessionData.otp;

    console.log(`Stored OTP: ${storedOTP}`);
    console.log(`Type of stored OTP: ${typeof storedOTP}`);

    if (!storedOTP || storedOTP !== otp.toString().trim()) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const expiredTime = 60 * 1000;

    

    if (currentTime - otpGeneratedTime > expiredTime) {
        res.status(400);
        throw new Error('OTP expired');
    }

    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        res.status(400);
        throw new Error('User details not found in session');
    }

    const user = await User.create({
        userName: userDetails.userName,
        email: userDetails.email,
        password: userDetails.password
    });

    // Clear session data
    delete sessionData.userDetails;
    delete sessionData.otp;

    res.status(200).json({ message: 'OTP verified successfully, user added', user });
});


export const resendOTP=asyncHandler(async(req:Request,res:Response)=>{

    const email=req.body

    const otp = speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        digits: 4, 
      });

    const sessiondata=req.session!
    sessiondata.otp=otp;
    sessiondata.otpGeneratedTime=Date.now()

    const userDetails=sessiondata.userDetails;
    if(!userDetails){
        res.status(400)
        throw new Error('userDetails not found')
        return;       
    }
    console.log('new OTP'+otp);
   // sendVerifyMail(req, userDetails.username, userDetails.email);
res.status(200).json({message:'new otp sent for verification '})  // send email and otp with it  

})
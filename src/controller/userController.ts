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

      console.log(`user otp=${otp}`);

      const sessionData=req.session!;
      sessionData.userDetails={userName,email,password}
      sessionData.otp=otp;
      sessionData.otpGeneratedTime=Date.now()
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword=await bcrypt.hash(password,salt)
      sessionData.userDetails!.password = hashedPassword;
    //   sendVerifyMail(req, userName, email);
      res.status(200).json({ message: "OTP sent for verification", email, otp });
      
    const newUser = new User({
        userName,
        email,
        password  
    });

    await newUser.save();

    res.status(201).json({
        message: 'User registered successfully',
        user: newUser
    });
});

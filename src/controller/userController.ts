import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import User from "../model/user/userModel";
import { UserType } from "../model/user/userType";
const speakeasy = require('speakeasy');
import bcrypt from "bcryptjs";
import sendVerifyMail from '../utils/sendVerifyMail'
import generateToken from "../utils/generateToken";
import generateRefreshToken from "../utils/generateRefreshToken";


export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, email, password ,confirmPassword} = req.body;
    console.log(req.body);
    

   
    
    if (!userName || !email || !password || !confirmPassword) {
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

      console.log(otp);
      
      const sessionData=req.session!;
      sessionData.userDetails={userName,email,password}
      sessionData.otp=otp;
      sessionData.otpGeneratedTime=Date.now()
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword=await bcrypt.hash(password,salt)
      sessionData.userDetails!.password = hashedPassword;
     sendVerifyMail(req, userName, email);
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

      console.log(otp);
      
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

   sendVerifyMail(req, userDetails.userName, userDetails.email);

res.status(200).json({message:'new otp sent for verification ',email,otp}) 

})


export const login =asyncHandler(async(req:Request,res:Response)=>{
    const {email,password}=req.body
    const user= await User.findOne({email})
    if(user){
       if( user.isBlocked){
        res.status(400)
        throw new Error('you are temporarly suspended')
       }
    }
    if(user &&(await bcrypt.compare(password,user.password))){
        const userData=await User.findOne({email},{password:0})

        res.json({message:'logged successfully',
            user:userData,
            token:generateToken(user.id),
           
        })
    }


})


export const forgotPsw=asyncHandler(async(req:Request,res:Response)=>{
    const {email}=req.body  
    console.log(email);
     
    const user =await User.findOne({email})
    if (user) {
        const otp = speakeasy.totp({
          secret: speakeasy.generateSecret({ length: 20 }).base32,
          digits: 4, 
        });
        console.log(otp);
        const sessionData=req.session!;
        sessionData.otp=otp;
        sessionData.otpGeneratedTime=Date.now()
        sessionData.email=email;
        sendVerifyMail(req,user.userName,user.email)
        res.status(200).json({message:'new otp sent for verification ',email,otp}) 

    }else{
        res.status(400)
        throw new Error('not User Found')
    }
})


export const forgotOtp =asyncHandler(async(req:Request,res:Response)=>{
    const {otp}=req.body

    if(!otp){
        res.status(400)
        throw new Error('please provide otp')
    }

    const sessionData=req.session;
    const storedOtp=sessionData.otp
    if(!storedOtp || otp !== storedOtp){
        res.status(400)
        throw new Error('invalid otp')
    }

    const otpGeneratedTime=sessionData.otpGeneratedTime || 0;
    const currentTime=Date.now()
    const otpExpirationTime=60 * 1000
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(400);
        throw new Error("OTP has expired");
      }

    delete sessionData.otp;
    delete sessionData.otpGeneratedTime
   
    
    
    res.status(200).json({ message: "OTP has been verified. Please reset password" ,email:sessionData?.email});


})


export const resetPsw=asyncHandler(async(req:Request,res:Response)=>{
const{password,confirmPassword}=req.body


const sessionData=req.session;



if (!sessionData || !sessionData.email) {
    res.status(400);
    throw new Error('No session data found');
  }

console.log(password,confirmPassword);

if(password !== confirmPassword){
    res.status(400)
    throw new Error("password do not match")
}

const user=await User.findOne({email:sessionData.email})
if(!user){
    res.status(400)
    throw new Error('user not found')
}


const salt =await bcrypt.genSalt(10);
const hashedPassword=await bcrypt.hash(password,salt)
user.password=hashedPassword
await user.save()
res.status(200).json({ message: 'Password has been reset successfully' });
})











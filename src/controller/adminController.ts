import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import Admin from '../model/admin/adminModel';
import generateAdminToken from '../utils/generateAdminToken';
import User from '../model/user/userModel'
import { log } from 'console';

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
  
    
    
    if (admin && password=== admin.password) {
        res.status(200).json({
          message: "Login Successful",
          id: admin.id,
            name: admin.name,
            email: admin.email,
            token: generateAdminToken(admin.id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid Credentials");
    }
  });





  
  export const adminUserList = asyncHandler(async (req: Request, res: Response) => {
    const page: number = parseInt(req.query.page as string, 10) || 1;
    const limit: number = 6;
    const skip: number = (page - 1) * limit;
  
    const totalUsers: number = await User.countDocuments({});
    const totalPages: number = Math.ceil(totalUsers / limit);
  
    const users = await User.find({}).skip(skip).limit(limit);
  
    if (users.length > 0) {
      res.status(200).json({ users, totalPages });
    } else {
      res.status(400).json({ message: 'Users not found' });
    }
  });
  

  



  export const blockUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    console.log(req.body);
    
    
  
    const user = await User.findById(userId);
  
    if (!user) {
      res.status(400);
      throw new Error('User not found');
    }
  
    user.isBlocked = !user.isBlocked;
    await user.save();
  
    const blocked = user.isBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ message: `${user.userName} is ${blocked} now` });
  });
  

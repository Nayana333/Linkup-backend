import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import Admin from '../model/admin/adminModel';
import generateAdminToken from '../utils/generateAdminToken';

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

import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import Admin from '../model/admin/adminModel';
import generateAdminToken from '../utils/generateAdminToken';
import User from '../model/user/userModel'
import { log } from 'console';
import Report from '../model/reports/reportModel'
import Post from '../model/post/postModel'
import mongoose from 'mongoose';

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
  

  export const reportList= asyncHandler(async (req: Request, res: Response) => {
    const page: number = parseInt(req.query.page as string, 10) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments({});
    const totalPages = Math.ceil(totalUsers / limit);

    const report = await Report.find()
        .populate({
            path: 'userId',
            select: 'userName profileImageUrl email'
        })
        .populate({
            path: 'postId',
            populate: {
                path: 'userId',
                select: 'userName profileImageUrl email'
            }
        })
        .skip(skip)
        .limit(limit);

    if (report.length > 0) {
        res.status(200).json({ report, totalPages });
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});



export const reportPostBlock = asyncHandler(async (req: Request, res: Response) => {
    const id = req.body.postId;

    if (!id) {
        res.status(400).json({ message: 'postId is required' });
        return;
    }

    try {
        const report: any = await Report.findById(id);

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        const postId = report.postId;
        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        post.isBlocked = !post.isBlocked; 
        await post.save();

        const blocked = post.isBlocked ? 'blocked' : 'unblocked';
        res.status(200).json({ message: `This post has been ${blocked} now` });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


export const postList = asyncHandler(async (req: Request, res: Response) => {
  console.log('reached');
  
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 6;
  const skip: number = (page - 1) * limit;

  const totalUsers: number = await User.countDocuments({});
  const totalPages: number = Math.ceil(totalUsers / limit);

  const posts = await Post.find({}).populate({
    path: 'userId',
    select: 'email userName'
  }).skip(skip).limit(limit);

  console.log(posts); // Debugging: Log the posts to inspect

  if (posts && posts.length > 0) {
    res.status(200).json({ posts, totalPages });
  } else {
    res.status(400).json({ message: 'Posts not found' });
  }
});



export const postBlock = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.body;
  console.log(req.body);


  const post = await Post.findById(postId);

  if (!post) {
    res.status(400);
    throw new Error('post not found');
  }

  post.isBlocked = !post.isBlocked;
  await post.save();

  const blocked = post.isBlocked ? "Blocked" : "Unblocked";
  res.status(200).json({ message: `this post has been  ${blocked} now` });
});

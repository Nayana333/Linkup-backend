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
import Job from '../model/jobs/jobModel';
import { IJob } from "../model/jobs/jobType";
import Notification from '../model/notification/notificationModel';
import { INotification } from '../model/notification/notificationType';






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
    console.log('asdasds');
    
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
        console.log(report);
        

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
  }).skip(skip).limit(limit).sort({ createdAt: -1 });


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



export const adminListJob=asyncHandler(async(req:Request,res:Response)=>{
  try{
  const {userId}=req.body
  const page:number=parseInt(req.query.page as string,10) || 1
  const limit:number=6;
  const skip:number=(page-1) * limit
  const totalJobs:number=await Job.countDocuments({userId,isDeleted:{$ne:true}})

  const totalPages:number=Math.ceil(totalJobs/limit)
  const jobs:IJob[]=await Job.find({userId,isDeleted:{$ne:true}}).populate({
    path:'userId',
    select:'userName profileImageUrl'
  }).skip(skip).limit(limit).exec()
  res.status(200).json({ jobs, totalPages });
}catch(error){
  console.log('Error occured in listing job',error);
  res.status(500).json({ message: 'Internal server error' });
}

})

export const jobList = asyncHandler(async (req: Request, res: Response) => {
  console.log('job list');
  
  const page: number = parseInt(req.query.page as string, 10) || 1;
  const limit: number = 6;
  const skip: number = (page - 1) * limit;

  const totalUsers: number = await User.countDocuments({});
  const totalPages: number = Math.ceil(totalUsers / limit);

  const jobs = await Job.find({}).populate({
    path: 'userId',
    select: 'email userName'
  }).skip(skip).limit(limit);

  console.log(jobs);
  
  if (jobs && jobs.length > 0) {
    res.status(200).json({ jobs, totalPages });
  } else {
    res.status(400).json({ message: 'Posts not found' });
  }
});


export const jobBlock = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.body;

  const jobs= await Job.findById(jobId);

  if (!jobs) {
    res.status(400);
    throw new Error('post not found');
  }

  jobs.isAdminBlocked = !jobs.isAdminBlocked;
  await jobs.save();

  const jobData=await Job.find({})
  const blocked = jobs.isAdminBlocked ? "Blocked" : "Unblocked";
  res.status(200).json({ message: `this post has been  ${blocked} now`,jobData });
});


export const getDashboardStatus=asyncHandler(async(req:Request,res:Response)=>{

try{

  const totalJobs=await Job.find({}).countDocuments()

  const totalPost=await Post.find({}).countDocuments()

  const totalReports=await Report.find({}).countDocuments()

  const totalUsers=await User.find({}).countDocuments()

  const status={
    totalJobs,totalPost,totalReports,totalUsers
  }
  res.status(200).json({status})

}catch(error){
  console.log(error);
  
}
  
})




export const chartData = asyncHandler(async (req, res) => {
  const userJoinStatus = await User.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, userCount: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const postCreationStats = await Post.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, postCount: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const jobCreationStats = await Job.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, jobCount: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const chartData = {
    jobCreationStats,
    postCreationStats,
    userJoinStatus
  };

  res.status(200).json({ chartData });
});

interface NotificationData extends INotification {
  senderConnections?: any[]; 
}


export const getAdminNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.body.adminId;

    // Fetch the admin to ensure they exist
    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;  // Explicitly return after sending response
    }

    // Fetch notifications intended for this admin
    const notifications = await Notification.find({ receiverId: adminId })
      .populate({
        path: 'senderId',
        select: 'userName profileImageUrl',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
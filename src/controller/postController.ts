import Post from "../model/post/postModel";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../model/user/userModel";
import { isBlock } from "typescript";
import Notification from "../model/notification/notificationModel";
import { createNotification } from '\../utils/notificationSetter';
import Report from '../model/reports/reportModel'
import { log } from "console";


export const addPost = asyncHandler(async (req: Request, res: Response) => {
    const { userId, imageUrl, title, description, hideLikes, hideComment } = req.body;

    if (!userId || !imageUrl || !description) {
        res.status(400).json({ message: 'Provide all details' });
        return;
    }

    const post = await Post.create({
        userId,
        imageUrl,
        title,
        description,
        hideLikes,
        hideComment
    });

    if (!post) {
        res.status(400);
        throw new Error('Cannot add post');
    }

    const addedPost = await Post.find({ isBlocked: false, isDeleted: false }).populate({
        path: 'userId',
        select: 'userName profileImageUrl'
    }).sort({ date: -1 });

    if (!addedPost) {
        res.status(400);
        throw new Error('No post added');
    }


    console.log('addpost',addedPost);
    
    res.status(200).json({ message: 'Post added successfully', posts: addedPost });
});


export const getPost = asyncHandler(async (req: Request, res: Response) => {

  const { userId,  page } = req.body;
  const limit = 5;
  const skip = (page - 1) * limit;
    const posts = await Post.find({ isBlocked: false, isDeleted: false })
      .populate({
        path: 'userId',
        select: 'userName profileImageUrl'
      })
      .populate({
        path: 'likes',
        select: 'userName profileImageUrl'
      }).skip(skip)
      .limit(limit)
      .sort({ date: -1 });
      console.log(posts.length);
      
    res.status(200).json(posts);
  });



  
  export const editPost = asyncHandler(async (req: Request, res: Response) => {
      try {
          const { userId, postId, title, description, hideLikes, hideComment } = req.body;
  
          const post = await Post.findById(postId);
          if (!post) {
              res.status(400);
              throw new Error('Post not found');
          } else {
              if (title) {
                  post.title = title;
              }
              if (description) {
                  post.description = description;
              }
              if (hideLikes !== undefined) {
                  post.hideLikes = hideLikes;
              }
              if (hideComment !== undefined) {
                  post.hideComment = hideComment;
              }
  
              // Set isEdited to true
              post.isEdited = true;
  
              await post.save();
  
              const posts = await Post.find({ isBlocked: false, isDeleted: false })
                  .populate({
                      path: 'userId',
                      select: 'userName profileImageUrl'
                  })
                  .populate({
                      path: 'likes',
                      select: 'userName profileImageUrl'
                  })
                  .sort({ date: -1 });
  
              res.status(200).json({ message: 'Post updated successfully', posts });
          }
      } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Internal server error' });
      }
  });
  

export const deletePost = asyncHandler(async(req:Request,res:Response)=>{

    const {postId,userId}=req.body
    console.log(req.body);
    const post=await Post.findById(postId);

    if(!post){
        res.status(404)
        throw new Error('post cannot be found')
    }
    
    post.isDeleted=true
    await post.save()
    const posts=await User.find({userId:userId,isBlocked:false,isDeleted:false}).populate({
        path:userId,
        select:'userName  profileImageUrl'
    }).sort({date:-1})

    res.status(200).json({ posts });

});





export const likePost = asyncHandler(async (req: Request, res: Response) => {
    const { postId, userId } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }
  
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await Post.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } }, { new: true });
      await Notification.findOneAndDelete({ senderId: userId, receiverId: post.userId, message: 'liked your post' });
    } else {
      const notificationData:any = {
        senderId: userId,
        receiverId: post.userId,
        message: 'liked your post',
        link: `/visit-profile/posts/${post.userId}`,
        read: false,
        postId: postId, // assuming postId is to be passed
      };
      await createNotification(notificationData);
      await Post.findOneAndUpdate({ _id: postId }, { $push: { likes: userId } }, { new: true });
    }
  
    const posts = await Post.find({ userId: post.userId, isBlocked: false, isDeleted: false }).populate({
      path: 'userId',
      select: 'username profileImageUrl'
    }).sort({ date: -1 });
  
    res.status(200).json({ posts });
  });


  export const getUserPost = asyncHandler(async (req: Request, res: Response) => {

  
  
    const id = req.body.userId;
    console.log(id);
   
    
  
    const posts = await Post.find({userId:id, isBlocked: false, isDeleted:false  }).populate({
      path: 'userId',
      select: 'userName profileImageUrl'
    }).sort({date:-1});
  
    if (posts.length==0) {  
      res.status(400);
      throw new Error("No Post available");
    }
    
    res.status(200).json(posts);
  
  });


  export const reportPost=asyncHandler(async(req:Request,res:Response)=>{
    const {userId,postId,cause}=req.body
    console.log(req.body);
    const existingReport=await Report.findOne({userId,postId})
    if(existingReport){
      res.status(400)
      throw new Error('you are already Reported')
    }

    const report=new Report({
      userId,
      postId,
      cause
    })

    await report.save()


    const reportCount=await Report.countDocuments({postId})

    const REPORT_THRESHOLD=3

    if (reportCount >= REPORT_THRESHOLD) {
      await Post.findByIdAndUpdate(postId, { isBlocked: true });
      res
        .status(200)
        .json({ message: "Post has been blocked due to multiple reports." });
      return;
    }
    res.status(200).json({ message: "Post has been reported successfully." });



  })
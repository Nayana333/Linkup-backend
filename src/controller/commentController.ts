import {Request,Response} from 'express'
import asyncHandler from 'express-async-handler'
import Comment from '../model/commets/commentModel'
import Post from '../model/post/postModel'
import { createNotification } from '../utils/notificationSetter';
import mongoose from 'mongoose';
import { timeStamp } from 'console';


export const getAllPostComment=asyncHandler(async(req:Request,res:Response)=>{
    const postId=req.body.postId
    const comments=await Comment.find({postId:postId,isDeleted:false}).populate({
        path:'userId',
        select:'userName profileImageUrl'
    })
    res.status(200).json({comments})
})


export const addComment=asyncHandler(async(req:Request,res:Response)=>{
    const {postId,userId,comment}=req.body
    const post =await Post.findById(postId)

    const newComment=await Comment.create({
        postId,
        userId,
        comment
    })
    const userIdObj = new mongoose .Types.ObjectId(userId);

    if(!userIdObj){

        const notificationData:any={
            senderId:userId,
            recieverId:post?.userId,
            message:'commented on your post',
            read:false,
            postId:postId,
            link: `/visit-profile/posts/${post?.userId}`

        }

    createNotification( notificationData)
    }

    await newComment.save()
    const comments=await Comment.find({postId:postId,isDeleted:false}).populate({
        path:'userId',
        select:'userName profileImageUrl'
    })
    res.status(200).json({ message: 'Comment added successfully', comments });
})

export const replyComment=asyncHandler(async(req,res)=>{

    const {commentId,userId,resplyComment}=req.body

    const comment=await Comment.findById(commentId)
    if(!comment){
        res.status(404)
            throw new Error('comment not found')
        
    }

    const newReplyComment:any={
        userId,replyComment,timeStamp:new Date()
    }

    comment.replyComments.push(newReplyComment)
    await comment.save()


    const comments = await Comment.find({ postId:comment.postId,isDeleted:false}) .populate({
        path: 'userId',
        select: 'userName profileImageUrl',
      })
      .populate({
        path: 'replyComments.userId',
        select: 'userName profileImageUrl',
      })
      res.status(200).json({ message: 'Reply comment added successfully', comments });

})


export const deleteComment=asyncHandler(async(req:Request,res:Response)=>{
    const commentId=req.query;
    const comment=await Comment.findById(commentId)
    if(!comment){
        res.status(404)
        throw new Error('comment not found') 
    }
    comment.isDeleted=true
    await comment.save()
    const comments=await Comment.find({postId:comment.postId,isDeleted:false}).populate({
        path:'userId',
        select:'userName profileImageUrl'
    })

    res.status(200).json({ message: "Comment deleted successfully", comments });

})
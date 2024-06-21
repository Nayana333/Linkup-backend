import {Request,Response} from 'express'
import asyncHandler from 'express-async-handler'
import Comment from '../model/commets/commentModel'
import Post from '../model/post/postModel'
import mongoose from 'mongoose';


export const getAllPostComment=asyncHandler(async(req:Request,res:Response)=>{
    const postId=req.body.postId
    const comments=await Comment.find({postId:postId,isDeleted:false}).populate({
        path:'userId',
        select:'userName profileImageUrl'
    })
    res.status(200).json({comments})
})
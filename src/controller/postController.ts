import Post from "../model/post/postModel";
import { Request,Response } from "express";
import asyncHandler from "express-async-handler";
import { isBlock } from "typescript";
import { isBooleanObject } from "util/types";



export const addPost=asyncHandler(async(req:Request,res:Response)=>{


    const { userId, imageUrl,title, description ,hideLikes,hideComment } = req.body;
    if(!userId || !imageUrl || !description){
        res.status(400).json({message:'provide all details'})
    }

    const post =await Post.create({
        userId,
        imageUrl,
        title,
        description,
        hideLikes,
        hideComment
    })

    if(!post){
        res.status(400)
            throw new Error('cannot add post')
        
    }

    const addpost=await Post.find({isBlocked:false,isDeleted:false}).populate({
        path:userId,
        select:'username profileUrl'

    }).sort({date:-1})

    if(addpost.length===0){
        res.status(400)
        throw new Error('no post added')
        
    }

    res.status(200).json({message:'post added  successfully'})
})

export const getPost=asyncHandler(async(req:Request,res:Response)=>{

    const id=req.body.userId
 
    const post=await Post.find({isBlocked:false,isDeleted:false}).populate({
        path:id,
        select:'username profileUrl'

    }).sort({date:-1})

    if(post.length===0){
        res.status(400)
        throw new Error('no post added')
        
    }

    res.status(200).json({message:'post added  successfully'})

})
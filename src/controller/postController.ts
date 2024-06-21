import Post from "../model/post/postModel";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../model/user/userModel";
import { isBlock } from "typescript";

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

    const addedPost = await Post.findOne({ _id: post._id, isBlocked: false, isDeleted: false }).populate({
        path: 'userId',
        select: 'username profileUrl'
    }).sort({ date: -1 });

    if (!addedPost) {
        res.status(400);
        throw new Error('No post added');
    }

    res.status(200).json({ message: 'Post added successfully', post: addedPost });
});


export const getPost = asyncHandler(async (req: Request, res: Response) => {
    const posts = await Post.find({ isBlocked: false, isDeleted: false })
      .populate({
        path: 'userId',
        select: 'username profileImageUrl'
      })
      .populate({
        path: 'likes',
        select: 'username profileImageUrl'
      })
      .sort({ date: -1 });
  
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

            await post.save();

            const posts = await Post.find({ isBlocked: false, isDeleted: false })
                .populate({
                    path: 'userId',
                    select: 'username profileUrl'
                })
                .sort({ date: -1 });

            res.status(200).json({ message: 'Post updated successfully', posts });
        }
    } catch (error){
        console.log(error);
        res.status(500).json({message:'internal server error'})
        
    }
});

export const deletePost=asyncHandler(async(req:Request,res:Response)=>{

    const {postId,userId}=req.body
    console.log(postId,userId);
    const post=await Post.findById(postId)
    if(!post){
        res.status(404)
        throw new Error('post cannot be found')
    }
    
    post.isDeleted=true
    await post.save()
    const posts=await User.find({userId:userId,isBlocked:false,isDeleted:false}).populate({
        path:userId,
        select:'username  profileImageUrl'
    }).sort({date:-1})

    res.status(200).json({ posts });

});



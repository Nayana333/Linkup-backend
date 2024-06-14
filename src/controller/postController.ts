// import Post from "../model/post/postModel";
// import { Request,Response } from "express";
// import asyncHandler from "express-async-handler";



// export const addPost=asyncHandler(async(req:Request,res:Response)=>{


//     const { userId, imageUrl,title, description ,hideLikes,hideComment } = req.body;
//     if(!userId || !imageUrl || !description){
//         res.status(400).json({message:'provide all details'})
//     }

//     const post =await Post.create({
//         userId,
//         imageUrl,
//         title,
//         description,
//         hideLikes,
//         hideComment
//     })

//     if(!post){
//         res.status(400)
//             throw new Error('cannot add post')
        
//     }

//     const addpost=await Post.find({isBlocked:false,isDeleted:false}).populate({
//         path:userId,
//         select:'username profileUrl'

//     }).sort({date:-1})

//     if(addpost.length===0){
//         res.status(400)
//         throw new Error('no post added')
        
//     }

//     res.status(200).json({message:'post added  successfully'})
// })

// export const getPost=asyncHandler(async(req:Request,res:Response)=>{

//     const id=req.body.userId
 
//     const post=await Post.find({isBlocked:false,isDeleted:false}).populate({
//         path:id,
//         select:'username profileUrl'

//     }).sort({date:-1})

//     if(post.length===0){
//         res.status(400)
//         throw new Error('no post added')
        
//     }

//     res.status(200).json({message:'post added  successfully'})

// })



// export const editPost = asyncHandler(async (req: Request, res: Response) => {
//     try {
//         const { userId, postId, title, description, hideLikes, hideComment } = req.body;

//         const post = await Post.findById(postId);
//         if (!post) {
//             res.status(400);
//             throw new Error('Post not found');
//         } else {
//             if (title) {
//                 post.title = title;
//             }
//             if (description) {
//                 post.description = description;
//             }
//             if (hideLikes !== undefined) {
//                 post.hideLikes = hideLikes;
//             }
//             if (hideComment !== undefined) {
//                 post.hideComment = hideComment;
//             }

//             await post.save();

//             const posts = await Post.find({ isBlocked: false, isDeleted: false })
//                 .populate({
//                     path: 'userId',
//                     select: 'username profileUrl'
//                 })
//                 .sort({ date: -1 });

//             res.status(200).json({ message: 'Post updated successfully', posts });
//         }
//     } catch (error){
//         console.log(error);
//         res.status(500).json({message:'internal server error'})
        
//     }
// });

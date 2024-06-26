import express from 'express'
const router=express.Router()
import { addPost,getPost ,deletePost,editPost,likePost,getUserPost} from '../controller/postController'
import{getAllPostComment,addComment,replyComment, deleteComment} from '../controller/commentController'
import { protect } from '../middleware/auth';

router.post('/addpost',protect,addPost)
router.get('/getAllPosts',protect,getPost)
router.delete('/deletePost',protect,deletePost)
router.put('/editPost',protect,editPost)
router.post('/getAllPostComments',protect,getAllPostComment);
router.post('/addComment',protect,addComment)
router.post('/replyComment',protect,replyComment)
router.post('/likePost',protect,likePost)
router.post('/getUserPost',getUserPost)
router.get('/deleteComment',deleteComment)

export default router
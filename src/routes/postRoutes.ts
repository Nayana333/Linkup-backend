import express from 'express'
const router=express.Router()
import { addPost,getPost ,deletePost,editPost,likePost,getUserPost,reportPost} from '../controller/postController'
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
router.post('/getUserPost',protect,getUserPost)
router.get('/deleteComment',protect,deleteComment)
router.post('/reportPost',protect,reportPost)

export default router
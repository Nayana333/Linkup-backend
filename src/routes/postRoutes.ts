import express from 'express'
const router=express.Router()
import { addPost,getPost ,deletePost,editPost} from '../controller/postController'
import{getAllPostComment,addComment,replyComment} from '../controller/commentController'


router.post('/addpost',addPost)
router.get('/getAllPosts',getPost)
router.delete('/deletePost',deletePost)
router.put('/editPost',editPost)
router.post('/get-post-comments',getAllPostComment);
router.post('addComment',addComment)
router.post('replyComment',replyComment)

export default router
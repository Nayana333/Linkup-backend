import express from 'express'
const router=express.Router()
import { addPost } from '../controller/postController'


router.post('/addpost',addPost)
export default router
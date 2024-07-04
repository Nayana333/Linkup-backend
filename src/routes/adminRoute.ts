import express from 'express'
const router=express.Router()
import {adminLogin, adminUserList,blockUser,reportList,reportPostBlock,postList,postBlock,jobList,jobBlock } from '../controller/adminController'
import { protectAdmin } from '../middleware/adminAuth'


router.post('/adminLogin',adminLogin)
router.get('/userList',protectAdmin,adminUserList)
router.post('/blockUser',protectAdmin,blockUser)
router.get('/reportList',protectAdmin,reportList)
router.post('/reportPostBlock',protectAdmin,reportPostBlock)
router.get('/adminPostList',protectAdmin,postList)
router.post('/postBlock',protectAdmin,postBlock)
router.get('/adminJobList',protectAdmin,jobList)
router.post('/jobBlock',protectAdmin,jobBlock)



export default router   
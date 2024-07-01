import express from 'express'
const router=express.Router()
import {adminLogin, adminUserList,blockUser,reportList,reportPostBlock,postList,postBlock} from '../controller/adminController'



router.post('/adminLogin',adminLogin)
router.get('/userList',adminUserList)
router.post('/blockUser',blockUser)
router.get('/reportList',reportList)
router.post('/reportPostBlock',reportPostBlock)
router.get('/adminPostList',postList)
router.post('/postBlock',postBlock)

export default router   
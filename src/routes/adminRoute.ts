import express from 'express'
const router=express.Router()
import {adminLogin, adminUserList,blockUser} from '../controller/adminController'



router.post('/adminLogin',adminLogin)
router.get('/userList',adminUserList)
router.post('/blockUser',blockUser)

export default router   
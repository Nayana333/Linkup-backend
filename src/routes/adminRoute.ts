import express from 'express'
const router=express.Router()
import {adminLogin} from '../controller/adminController'



router.post('/adminLogin',adminLogin)
export default router
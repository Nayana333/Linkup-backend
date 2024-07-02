import express from "express";
import {addJob, listUserJob,listJob,userJobBlock, editJob,getJobDetails, viewJob} from '../controller/jobController';
import { protect } from '../middleware/auth'
const router = express.Router();

router.post("/addJob",protect, addJob);
router.post('/listUserJob',protect,listUserJob)
router.post('/listJob',protect,listJob)
router.post('/userJobBlock',protect,userJobBlock)
router.put('/editJob',protect,editJob)
router.post('/getJobDetails',protect,getJobDetails )
router.post('/viewJob',protect,viewJob)


export default router;


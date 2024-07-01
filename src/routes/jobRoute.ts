import express from "express";
import {addJob, listUserJob,listJob,userJobBlock, editJob,getJobDetails} from '../controller/jobController';
import { protect } from '../middleware/auth'
const router = express.Router();

router.post("/addJob", addJob);
router.post('/listUserJob',listUserJob)
router.post('/listJob',listJob)
router.post('/userJobBlock',userJobBlock)
router.put('/editJob',editJob)
router.post('/getJobDetails',getJobDetails )


export default router;


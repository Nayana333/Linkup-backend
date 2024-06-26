import express from "express";
import {addJob} from '../controller/jobController';
import { protect } from '../middleware/auth'
const router = express.Router();

router.post("/addJob", addJob);


export default router;


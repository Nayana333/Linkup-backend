import express from "express";
import { addJob, listUserJob, listJob, userJobBlock, editJob, getJobDetails, viewJob, getFormSelectData, addJobApplication, cancelJobApplications, getEmployeeApplications ,employerApplications} from '../controller/jobController';
import { Request, Response, NextFunction } from 'express';
import multer, { Multer } from 'multer'; 
import path from 'path';
import { protect } from '../middleware/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, 'src/public/uploads'); 
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const ext = path.extname(file.originalname);
    const filename = file.originalname.replace(ext, '');
    cb(null, `${filename}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(req);
  
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    res.status(400).json({ error: 'File upload failed', message: err.message });
  } else { 
    console.error('Other error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post("/addJob", protect, addJob);
router.post('/listUserJob', protect, listUserJob);
router.post('/listJob', protect, listJob);
router.post('/userJobBlock', protect, userJobBlock);
router.put('/editJob', protect, editJob);
router.post('/getJobDetails', protect, getJobDetails);
router.post('/viewJob', protect, viewJob);
router.get('/getFormSelectData', protect, getFormSelectData);
router.post('/apply-job', upload.single('resume'), addJobApplication);
router.patch('/cancelJobApplication',protect,cancelJobApplications)
router.post('/getEmployeeApplications',protect,getEmployeeApplications)
router.post('/employerApplications',protect,employerApplications)

export default router;

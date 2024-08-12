import express from "express";
import { addJob, listUserJob, listJob, userJobBlock, editJob, getJobDetails, viewJob, getFormSelectData, addJobApplication, cancelJobApplications, getEmployeeApplications, employerApplications, updateApplicationStatus, } from '../controller/jobController';
import { addInterview, editInterview, getIntervieweeInterviews, getInterviewerInterviews, setInterviewStatus } from '../controller/interviewController'
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
router.patch('/cancelJobApplication', protect, cancelJobApplications)
router.post('/getEmployeeApplications', protect, getEmployeeApplications)
router.post('/employerApplications', protect, employerApplications)
router.patch('/updateApplicationStatus', protect, updateApplicationStatus)
router.post('/getIntervieweeInterviews', protect, getIntervieweeInterviews)
router.post('/getInterviewerInterviews', protect, getInterviewerInterviews)
router.patch('/setInterviewStatus', protect, setInterviewStatus)
router.post('/addInterview', protect, addInterview)
router.post('/editInterview', protect, editInterview)
export default router;

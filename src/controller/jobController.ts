import Job from "../model/jobs/jobModel";
import { IJob } from "../model/jobs/jobType";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";








export const addJob =  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
  
      
      
      const {
        userId,
        companyName,
        jobRole,
        experience: experienceString,
        salary: salaryString,
        jobType,
        jobLocation,
        lastDateToApply,
        requiredSkills,
        jobDescription,
        qualification,
      } = req.body;
      const experience = parseInt(experienceString, 10);
      const salary = parseInt(salaryString, 10);
  
      const newJob = new Job({
        userId,
        companyName,
        jobRole,
        experience,
        salary,
        jobType,
        jobLocation,
        lastDateToApply,
        requiredSkills,
        jobDescription,
        qualification,
        isDeleted: false, 
      });
  
    
      await newJob.save();
  
      res.status(201).json({ message: 'Job added successfully', job: newJob });
    } catch (error) {
      console.error('Error adding job:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  )
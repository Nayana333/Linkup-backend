import Job from "../model/jobs/jobModel";
import { IJob } from "../model/jobs/jobType";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { log } from "console";








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

  export const listUserJob=asyncHandler(async(req:Request,res:Response)=>{
    try{
    const {userId}=req.body
    const page:number=parseInt(req.query.page as string,10) || 1
    const limit:number=6;
    const skip:number=(page-1) * limit
    const totalJobs:number=await Job.countDocuments({userId,isDeleted:{$ne:true}})

    const totalPages:number=Math.ceil(totalJobs/limit)
    const jobs:IJob[]=await Job.find({userId,isDeleted:{$ne:true}}).populate({
      path:'userId',
      select:'userName profileImageUrl'
    }).skip(skip).limit(limit).exec()
    res.status(200).json({ jobs, totalPages });
  }catch(error){
    console.log('Error occured in listing job',error);
    res.status(500).json({ message: 'Internal server error' });
  }

  })



  
  // export const listJob = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { userId, filterData } = req.body;
  //     const searchText = filterData?.search || ''; 
  
  
  
  //     // const userApplications: mongoose.Types.ObjectId[] = await JobApplication.find({
  //     //   applicantId: userId,
  //     //   isDeleted: { $ne: true },
      
  //     // }).distinct('jobId');
  
  //     const filterCriteria: any = {
  //       isDeleted: { $ne: true },
  //       userId: { $ne: userId },
  //       isAdminBlocked: false,
  //       isBlocked:false,
  //       // _id: { $nin: userApplications },
  //     };
  
  //     if (filterData) {
  //       if (filterData.jobRole) {
  //         filterCriteria.jobRole = filterData.jobRole;
  //       }
  //       if (filterData.location) {
  //         filterCriteria.jobLocation = filterData.location;
  //       }
  //       if (filterData.jobType) {
  //         filterCriteria.jobType = filterData.jobType;
  //       }
  //       if (filterData.salaryRange && filterData.salaryRange != 0) {
        
  
  //         const maxSalary = parseFloat(filterData.salaryRange);
  //         filterCriteria.salary = { $lte: maxSalary };
  //       }
  //       if (filterData.experienceRange && filterData.experienceRange != 0) {
          
  //         const maxExp = parseFloat(filterData.experienceRange);
  //         filterCriteria.experience = { $lte: maxExp };
  //       }
  
  //       if (searchText.trim() !== ''&& searchText!==null) {
  //         filterCriteria.jobRole = { $regex: searchText.trim(), $options: 'i' };
  //       }
  //     }
  
  //     const jobs: IJob[] = await Job.find(filterCriteria)
  //       .populate({ path: 'userId', select: 'username profileImageUrl' });
  
  //     res.status(200).json({ jobs });
  //   } catch (error) {
  //     console.error('Error listing active jobs:', error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // };




  export const listJob= async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, filterData } = req.body;
      const searchText = filterData?.search || ''; 
  
  
  
      // const userApplications: mongoose.Types.ObjectId[] = await JobApplication.find({
      //   applicantId: userId,
      //   isDeleted: { $ne: true },
      
      // }).distinct('jobId');
  
      const filterCriteria: any = {
        isDeleted: { $ne: true },
        userId: { $ne: userId },
        isAdminBlocked: false,
        isBlocked:false,
        // _id: { $nin: userApplications },
      };
  
      if (filterData) {
        if (filterData.jobRole) {
          filterCriteria.jobRole = filterData.jobRole;
        }
        if (filterData.location) {
          filterCriteria.jobLocation = filterData.location;
        }
        if (filterData.jobType) {
          filterCriteria.jobType = filterData.jobType;
        }
        if (filterData.salaryRange && filterData.salaryRange != 0) {
        
  
          const maxSalary = parseFloat(filterData.salaryRange);
          filterCriteria.salary = { $lte: maxSalary };
        }
        if (filterData.experienceRange && filterData.experienceRange != 0) {
          
          const maxExp = parseFloat(filterData.experienceRange);
          filterCriteria.experience = { $lte: maxExp };
        }
  
        if (searchText.trim() !== ''&& searchText!==null) {
          filterCriteria.jobRole = { $regex: searchText.trim(), $options: 'i' };
        }
      }
  
      const jobs: IJob[] = await Job.find(filterCriteria)
        .populate({ path: 'userId', select: 'username profileImageUrl' });
  
      res.status(200).json({ jobs });
    } catch (error) {
      console.error('Error listing active jobs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  export const userJobBlock=asyncHandler(async(req:Request,res:Response)=>{
    const {jobId}=req.body
   
    const job=await Job.findById(jobId)

    if(!job){
      res.status(400)
      throw new Error('job not found')

    }

    const userId=job?.userId

    job.isBlocked=!job.isBlocked
    await job.save()

    const jobs: IJob[] = await Job.find({ userId: userId, isDeleted: { $ne: true }})
    .populate('userId')
    .exec();

    const blocked = job.isAdminBlocked?"Blocked":"Unblocked"

  res.status(200).json({ jobs,message:`Job has been ${blocked}`});
  })


  export const editJob=asyncHandler(async(req:Request,res:Response)=>{
    
  try {
    const {
      jobId,
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
  console.log(req.body);

  const existingJob=await Job.findById(jobId)
  if(!existingJob){
    res.status(404).json({message:'job is not found'})
    return
  }
  const experience=parseInt(experienceString,10)
  const salary=parseInt(salaryString,10)

  existingJob.companyName = companyName;
  existingJob.jobRole = jobRole;
  existingJob.experience = experience;
  existingJob.salary = salary;
  existingJob.jobType = jobType;
  existingJob.jobLocation = jobLocation;
  existingJob.lastDateToApply = lastDateToApply;
  existingJob.requiredSkills = requiredSkills;
  existingJob.jobDescription = jobDescription;
  existingJob.qualification = qualification;

  await existingJob.save()

  res.status(200).json({ message: 'Job updated successfully', job: existingJob });
} catch (error) {
  console.error('Error updating job:', error);
  res.status(500).json({ message: 'Internal server error' });
}

  })


  export const getJobDetails = async (req: Request, res: Response): Promise<void> => {
    try {
     
      
   const{jobId}=req.body
  
  
   const job= await Job.findOne({ _id: jobId, isDeleted: { $ne: true } })
   .populate({
     path: 'userId',
     select: 'userName profileImageUrl',
   })
   .exec();

   console.log(job);
   
   
   
  
      res.status(200).json({ job });
    } catch (error) {
      console.error('Error listing active jobs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const viewJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    
    
    try {
      console.log(req.body);
      
      const { jobId } = req.body;
      const job = await Job.findOne({ _id: jobId, isDeleted: { $ne: true } })
        .populate({
          path: 'userId',
          select: 'userName profileImageUrl',
        })
        .exec();
  
      if (!job) {
         res.status(404).json({ message: 'Job details not found' });
      }
  
      res.status(200).json({ job });
    } catch (error: any) {  
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  });
  

  export const getFormSelectData = async (req: Request, res: Response): Promise<void> => {
    try {
      
      const distinctLocations= await Job.distinct('jobLocation').sort();
      const distinctRoles = await Job.distinct('jobRole').sort();
  
      res.status(200).json({ locations: distinctLocations, roles: distinctRoles });
    } catch (error) {
      console.error('Error fetching distinct job data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
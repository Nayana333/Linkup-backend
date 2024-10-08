
import { Request, Response } from 'express';
import Interview from "../model/interview/interviewModel";
import JobApplication from '../model/jobApplication/jobApplicationModel';
import Job from "../model/jobs/jobModel";
import { createNotification } from "../utils/notificationSetter";


export const getIntervieweeInterviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const intervieweeId = req.body.intervieweeId;
        console.log(intervieweeId);


        const interviews = await Interview.find({ intervieweeId: intervieweeId }).populate('interviewerId')
            .populate('intervieweeId').populate('jobId')

        res.status(200).json({ interviews });
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Error fetching interviews' });
    }
};


export const getInterviewerInterviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const interviewerId = req.body.interviewerId;

        const interviews = await Interview.find({ interviewerId: interviewerId }).populate('interviewerId')
            .populate('intervieweeId').populate('jobId')



        res.status(200).json({ interviews })
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Error fetching interviews' });
    }
};


export const setInterviewStatus = async (req: Request, res: Response): Promise<void> => {
    try {

        const { status, interviewId } = req.body;
        console.log(req.body);


        const existingInterview = await Interview.findById(interviewId);
        if (!existingInterview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }

        existingInterview.status = status;

        const updatedInterview = await existingInterview.save();

        res.status(200).json({ message: 'Interview status updated successfully', interview: updatedInterview });
    } catch (error) {
        console.error('Error changing interview status:', error);
        res.status(500).json({ message: 'Error changing interview status' });
    }
};



export const addInterview = async (req: Request, res: Response): Promise<any> => {
    try {
        const {
            applicationId,
            jury,
            interviewDate,
            interviewTime,
            status = 'Pending',
        } = req.body;

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Job application not found' });
        }

        const job = await Job.findById(application.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        function randomID(len: number) {
            let result = '';
            if (result) return result;
            const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
            const maxPos = chars.length;
            len = len || 5;
            for (let i = 0; i < len; i++) {
                result += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return result;
        }

        const intervieweeId = application.applicantId;
        const jobId = application.jobId;
        const interviewerId = job.userId;
        const interviewLink = randomID(10);

        const newInterview = new Interview({
            interviewerId,
            intervieweeId,
            applicationId,
            jobId,
            jury: [...jury],
            interviewDate,
            interviewTime,
            interviewLink,
            status,
        });

        const savedInterview = await newInterview.save();

        await JobApplication.findByIdAndUpdate(applicationId, { isInterviewScheduled: true });

        // Create notifications
        const interviewNotificationData = {
            senderId: interviewerId,
            receiverId: intervieweeId,
            message: `An interview has been scheduled for the position of ${job.jobRole} at ${job.companyName}. The interview is on ${interviewDate} at ${interviewTime}.`,
            link: `/jobs/open-to-work/interviews`,
            read: false,
            jobId: job._id,
        };

        await createNotification(interviewNotificationData);

        const interviewerNotificationData = {
            senderId: intervieweeId,
            receiverId: interviewerId,
            message: `You have scheduled an interview for the position of ${job.jobRole} at ${job.companyName}. The interview is on ${interviewDate} at ${interviewTime}.`,
            link: `/jobs/hiring/interviews`,
            read: false,
            jobId: job._id,
        };

        await createNotification(interviewerNotificationData);

        const jobs = await Job.find({ userId: interviewerId });

        const jobIds = jobs.map((job) => job._id);
        const applications = await JobApplication.find({ jobId: { $in: jobIds } })
            .populate('applicantId').populate('jobId')
            .exec();

        res.status(201).json({ message: 'Interview scheduled successfully', interview: savedInterview, applications: applications });
    } catch (error) {
        console.error('Error adding interview:', error);
        res.status(500).json({ message: 'Error adding interview' });
    }
};


//   export const editInterview = async (req: Request, res: Response): Promise<any> => {
//     try {
//         const { interviewId, jury, interviewDate, interviewTime, status = 'Pending' } = req.body;

//         const interview = await Interview.findById(interviewId);
//         if (!interview) {
//             return res.status(404).json({ message: 'Interview not found' });
//         }

//         interview.jury = [...jury];
//         interview.interviewDate = interviewDate;
//         interview.interviewTime = interviewTime;
//         interview.status = status;

//         const updatedInterview = await interview.save();

//         const application = await JobApplication.findById(interview.applicationId);
//         if (!application) {
//             return res.status(404).json({ message: 'Job application not found' });
//         }

//         const job = await Job.findById(application.jobId);
//         if (!job) {
//             return res.status(404).json({ message: 'Job not found' });
//         }

//         const interviewerId = job.userId;


//             const interviews = await Interview.find({ interviewerId:interviewerId }).populate('interviewerId')
//       .populate( 'intervieweeId').populate('jobId')

//         res.status(200).json({ message: 'Interview updated successfully', interviews});
//     } catch (error) {
//         console.error('Error editing interview:', error);
//         res.status(500).json({ message: 'Error editing interview' });
//     }
// };




export const editInterview = async (req: Request, res: Response): Promise<any> => {
    try {
        const { interviewId, jury, interviewDate, interviewTime, status = 'Pending' } = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        interview.jury = [...jury];
        interview.interviewDate = interviewDate;
        interview.interviewTime = interviewTime;
        interview.status = status;

        const updatedInterview = await interview.save();

        const application = await JobApplication.findById(interview.applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Job application not found' });
        }

        const job = await Job.findById(application.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const interviewerId = job.userId;

        const interviews = await Interview.find({ interviewerId: interviewerId })
            .populate('interviewerId')
            .populate('intervieweeId')
            .populate('jobId');

        if (job) {
            const notificationData = {
                senderId: interview.intervieweeId,
                receiverId: interview.intervieweeId,
                message: `The interview for the position of ${job.jobRole} at ${job.companyName} has been rescheduled. Please check the new details.`,
                link: `/jobs/open-to-work/interviews`,
                read: false,
                jobId: job._id
            };

            await createNotification(notificationData);
        }

        res.status(200).json({ message: 'Interview updated successfully', interviews });
    } catch (error) {
        console.error('Error editing interview:', error);
        res.status(500).json({ message: 'Error editing interview' });
    }
};

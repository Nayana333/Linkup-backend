import { Schema, model } from "mongoose";
import jobApplicationInterface from "./jobApplicationType";

const jobApplicationSchema = new Schema<jobApplicationInterface>({
    applicantId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicationStatus: {
        type: String,
        required: true,
        default: "Pending"
    },
    isDeleted: {
        type: Boolean,

        default: false
    },
    coverLetter: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    isInterviewScheduled: {
        type: Boolean,
        default: false
    }


}, { timestamps: true });

const Jobs = model<jobApplicationInterface>('Application', jobApplicationSchema);

export default Jobs;
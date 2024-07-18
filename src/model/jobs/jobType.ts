import mongoose, { Schema, Document } from "mongoose";

// Define ObjectId type for TypeScript
type ObjectId = mongoose.Types.ObjectId;

export interface IJob extends Document {
  userId: ObjectId;
  companyName: string;
  jobRole?: string;
  experience: number;
  salary?: number;
  jobType: string;
  jobLocation: string;
  lastDateToApply: Date;
  requiredSkills: string;
  jobDescription?: string;
  qualification?: string;
  isDeleted: boolean;
  isBlocked: boolean;
  isAdminBlocked: boolean;
  applicants: ObjectId[];
}

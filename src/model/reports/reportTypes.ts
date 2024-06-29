import { Document,Schema,Types } from "mongoose";
import { Type } from "typescript";

interface ReportInterFace extends Document{
    userId:Types.ObjectId
    postId:Types.ObjectId
    jobId:Types.ObjectId
    cause:string
}
export default ReportInterFace
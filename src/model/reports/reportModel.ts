import { Schema, model } from "mongoose";
import ReportInterFace from "./reportTypes";

const ReportSchema = new Schema<ReportInterFace>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postId: {

        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true

    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',

    },
    cause: { type: String, required: true }
}, { timestamps: true })

const Report = model<ReportInterFace>('Report', ReportSchema)

export default Report
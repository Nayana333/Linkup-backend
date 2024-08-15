import { Schema, model, Document } from "mongoose";
import OtpInterface from "./otpType";


const OtpSchema = new Schema<OtpInterface>({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const OtpModel = model<OtpInterface>("Otp", OtpSchema);

export default OtpModel;

import { Document } from "mongoose";

export interface OtpInterface extends Document {
    otp: string;
    email: string;
    timestamp: Date;
}


export default OtpInterface
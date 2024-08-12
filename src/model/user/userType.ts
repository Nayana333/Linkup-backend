import { Document, Date, Types } from "mongoose";
export interface IUser extends Document {

   userName: string;
   email: string;
   password: string;
   isHiring: boolean;
   isBlocked: boolean;
   isGoogle: Boolean;
   isFacebook: Boolean;
   isPremium: Boolean;
   isOnline: Boolean;
   dailyJobsApplied: number;
   premiumExpirydate: Date;
   userType: UserType;
   profile: Profiler;
   companyProfile: CompanyProfile;
   phone: string;
   savedPosts: Types.ObjectId[]
   savedJobs: Types.ObjectId[]
   isActive: Boolean;
   profileImageUrl: string;
   timestamp: Date

}



export enum UserType {
   Company = 'organization',
   Individual = 'individual',
}

export interface Profiler {
   about?: string;
   location?: string;
   qualification?: Qualification[]
   experience?: Experience[]
   skills?: string;
   resume?: string;
   gender?: string;
   dateOfBirth: Date;
   designation: string;
   fullname?: string;

}
export interface Qualification {
   course: string;
   instituion: string;
   yearOfCompletion: number
}

export interface Experience {
   jobPosition: string;
   yearOfJoining: number;
   companyName: string;
}

export interface CompanyProfile {
   companyName?: string;
   companyLocation?: string;
   aboutCompany?: string;
   noOfEmployees?: string;
   establishedOn?: Date;
   companyType?: string

}


import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import User from "../model/user/userModel";
import Post from "../model/post/postModel";
import Job from "../model/jobs/jobModel";
import { UserType } from "../model/user/userType";
const speakeasy = require('speakeasy');
import bcrypt from "bcryptjs";
import sendVerifyMail from '../utils/sendVerifyMail'
import generateToken from "../utils/generateToken";
import generateRefreshToken from "../utils/generateRefreshToken";
import { Connection } from "mongoose";
import Connections from "../model/connection/connectionModel";
import { log } from "console";
import Notification from '../model/notification/notificationModel';
import { INotification } from '../model/notification/notificationType';
import PremiumUsers from "../model/permium/premiumModel";



export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { userName, email, password, confirmPassword } = req.body;
  console.log(req.body);
  if (!userName || !email || !password || !confirmPassword) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

  const existingUser = await User.findOne({ userName });
  if (existingUser) {
    res.status(400);
    throw new Error('Username already exists');
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const otp = speakeasy.totp({
    secret: speakeasy.generateSecret({ length: 20 }).base32,
    digits: 4,
  });

  console.log(otp);

  const sessionData = req.session!;
  sessionData.userDetails = { userName, email, password }
  sessionData.otp = otp;
  sessionData.otpGeneratedTime = Date.now()

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt)
  sessionData.userDetails!.password = hashedPassword;
  sendVerifyMail(req, userName, email);
  res.status(200).json({ message: "OTP sent for verification", email, otp });



});



export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  
  

  console.log(`Received OTP: ${otp}`);
  console.log(`Type of received OTP: ${typeof otp}`);

  if (!otp) {
    res.status(400);
    throw new Error('Cannot receive OTP');
  }

  const sessionData = req.session;
  console.log(sessionData)
  const storedOTP = sessionData.otp;

  console.log(`Stored OTP: ${storedOTP}`);
  console.log(`Type of stored OTP: ${typeof storedOTP}`);

  if (!storedOTP || storedOTP !== otp.toString().trim()) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
  const currentTime = Date.now();
  const expiredTime = 60 * 1000;



  if (currentTime - otpGeneratedTime > expiredTime) {
    res.status(400);
    throw new Error('OTP expired');
  }

  const userDetails = sessionData.userDetails;
  if (!userDetails) {
    res.status(400);
    throw new Error('User details not found in session');
  }

  const user = await User.create({
    userName: userDetails.userName,
    email: userDetails.email,
    password: userDetails.password
  });

  delete sessionData.userDetails;
  delete sessionData.otp;

  res.status(200).json({ message: 'OTP verified successfully, user added', user });
});


export const resendOTP = asyncHandler(async (req: Request, res: Response) => {

  const email = req.body



  const otp = speakeasy.totp({
    secret: speakeasy.generateSecret({ length: 20 }).base32,
    digits: 4,
  });

  console.log(otp);

  const sessiondata = req.session!
  sessiondata.otp = otp;
  sessiondata.otpGeneratedTime = Date.now()

  const userDetails = sessiondata.userDetails;
  if (!userDetails) {
    res.status(400)
    throw new Error('userDetails not found')
    return;
  }
  console.log('new OTP' + otp);

  sendVerifyMail(req, userDetails.userName, userDetails.email);

  res.status(200).json({ message: 'new otp sent for verification ', email, otp })

})


// export const login = asyncHandler(async (req: Request, res: Response) => {
//   const { email, password } = req.body
//   console.log(req.body);

//   const user = await User.findOne({ email })
//   if(!user){
//     res.status(404).json({message:'no user exist'})
//   }
//   if (user) {
//     if (user.isBlocked) {
//       res.status(400)
//       throw new Error('you are temporarly suspended')
//     }
//   }
//   if (user && (await bcrypt.compare(password, user.password))) {
//     const userData = await User.findOne({ email }, { password: 0 })

//     res.json({
//       message: 'logged successfully',
//       user: userData,
//       token: generateToken(user.id),

//     })
//   }


// }) 


export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: 'No user exists with the provided email' });
    return;
  }

  if (user.isBlocked) {
    res.status(400).json({ message: 'You are temporarily suspended' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const userData = await User.findOne({ email }, { password: 0 });

  res.json({
    message: 'Logged in successfully',
    user: userData,
    token: generateToken(user.id),
  });
});

export const forgotPsw = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body
  console.log(email);

  const user = await User.findOne({ email })
  if (user) {
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });
    console.log(otp);
    const sessionData = req.session!;
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now()
    sessionData.email = email;
    sendVerifyMail(req, user.userName, user.email)
    res.status(200).json({ message: 'new otp sent for verification ', email, otp })

  } else {
    res.status(400)
    throw new Error('not User Found')
  }
})


export const forgotOtp = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body

  if (!otp) {
    res.status(400)
    throw new Error('please provide otp')
  }

  const sessionData = req.session;
  const storedOtp = sessionData.otp
  if (!storedOtp || otp !== storedOtp) {
    res.status(400)
    throw new Error('invalid otp')
  }

  const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
  const currentTime = Date.now()
  const otpExpirationTime = 60 * 1000
  if (currentTime - otpGeneratedTime > otpExpirationTime) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  delete sessionData.otp;
  delete sessionData.otpGeneratedTime



  res.status(200).json({ message: "OTP has been verified. Please reset password", email: sessionData?.email });


})


export const resetPsw = asyncHandler(async (req: Request, res: Response) => {
  const { password, confirmPassword } = req.body


  const sessionData = req.session;
  if (!sessionData || !sessionData.email) {
    res.status(400);
    throw new Error('No session data found');
  }

  console.log(password, confirmPassword);

  if (password !== confirmPassword) {
    res.status(400)
    throw new Error("password do not match")
  }

  const user = await User.findOne({ email: sessionData.email })
  if (!user) {
    res.status(400)
    throw new Error('user not found')
  }


  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt)
  user.password = hashedPassword
  await user.save()
  res.status(200).json({ message: 'Password has been reset successfully' });
})


export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { userName, email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.isBlocked) {
        res.status(400).json({ message: "User is blocked" });
        return;
      }

      const userData = await User.findOne({ email }, { password: 0 });

      res.json({
        message: "Login Successful",
        user: userData,
        token: generateToken(user.id),
        refreshToken: generateRefreshToken(user.id)
      });
    } else {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = new User({
        userName,
        email,
        password: hashedPassword,
        isGoogle: true,
      });

      await newUser.save();

      const userData = await User.findOne({ email }, { password: 0 });

      res.json({
        message: "Login Successful",
        user: userData,
        token: generateToken(newUser.id),
      });
    }
  } catch (error) {
    console.error("Error in Google authentication:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export const setPreferences = async (req: Request, res: Response) => {
  try {
    const { userId, userType, isHiring } = req.body;
    console.log(req.body);


    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      user.userType = userType as UserType;
      user.isHiring = isHiring === 'isHiring';

      await user.save();
      res.status(200).json({ message: 'User updated', user });
    }
  } catch (error) {
    console.error("Error in updating user", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





export const basicInformation = async (req: Request, res: Response) => {
  try {

    const { userId, imageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType === "individual") {
      const { fullname, location, designation, dateOfBirth, phone, gender, about } = req.body;

      user.profile.fullname = fullname;
      user.profile.location = location;
      user.profile.designation = designation;
      user.profile.dateOfBirth = dateOfBirth;
      user.phone = phone;
      user.profile.gender = gender;
      user.profile.about = about;
    } else if (user.userType === "organization") {
      const { fullname, location, phone, about, noOfEmployees, establishedOn, companyType } = req.body;
      console.log(companyType);

      user.companyProfile.companyName = fullname;
      user.companyProfile.companyLocation = location;
      user.companyProfile.aboutCompany = about;
      user.companyProfile.establishedOn = establishedOn;
      user.companyProfile.noOfEmployees = noOfEmployees;
      user.companyProfile.companyType = companyType;
      user.phone = phone;
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (imageUrl) {


      console.log(imageUrl);

      user.profileImageUrl = imageUrl;
    }

    await user.save();
    const userData = await User.findOne({ _id: userId }, { password: 0 })

    res.status(200).json({ message: 'Basic information updated successfully', user: userData });
  } catch (error) {
    console.error('Error updating basic information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const setUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, isHiring } = req.body
    const user = await User.findById(userId)
    if (!user) { return res.status(404).json({ message: 'user not found' }) }
    user.isHiring = isHiring
    await user.save()
    res.status(200).json({ message: 'user updated successfully', user })
  } catch (error) {
    console.log('error updating user:', error);
    res.status(500).json({ message: 'Internal server error' })

  }

}


export const userSuggestions = asyncHandler((async (req: Request, res: Response) => {
  const { userId } = req.body

  const connection = await Connections.findOne({ userId })


  if (!connection) {
    const users = await User.find({
      _id: { $ne: userId },
      isBlocked: false
    });
    console.log(users, 'userssss');

    res.status(200).json({ suggestedUsers: users })
    return
  }


  const followingIds = connection.connections.map((user: any) => user._id);
  const requestedIds = connection.requestSent.map((user: any) => user._id)


  const suggestedUsers = await User.find({
    _id: { $nin: [...followingIds, ...requestedIds, userId] }
  },
    { password: 0 }
  )
  res.status(200).json({ suggestedUsers })
}))




export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {

  try {

    const { userId } = req.params

    const user = await User.findById(userId).populate('profile').populate('companyProfile')

    const connections = await Connections.findOne({ userId: userId })

    if (user) {
      res.status(200).json({ user, connections })
    }
    else {
      res.status(400).json({ message: 'user not found' })
    }
  } catch (error: any) {
    console.log(error);

  }

})



export const searchAllCollections = asyncHandler(async (req, res) => {
  try {
    const searchQuery = req.query.searchQuery;

    const regex = new RegExp(`\\b${searchQuery}\\b`, 'i'); // Word boundary regex

    const users = await User.find({
      $or: [
        { userName: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    });

    const posts = await Post.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).populate('userId');

    const jobs = await Job.find({
      $or: [
        { companyName: { $regex: regex } },
        { jobRole: { $regex: regex } },
        { jobLocation: { $regex: regex } },
        { requiredSkills: { $regex: regex } },
        { jobDescription: { $regex: regex } },
        { qualification: { $regex: regex } },
      ],
    });

    res.status(200).json({ users, posts, jobs });
  } catch (error) {
    console.log('Error searching collections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


interface NotificationData extends INotification {
  senderConnections?: any[];
}

export const getNotifications = async (req: Request, res: Response): Promise<void> => {

  try {
    const userId = req.body.userId;
    const connections = await Connections.findOne({ userId })
    const userConnections: any[] = connections?.connections || []

    const notifications: NotificationData[] = await Notification.find({ receiverId: userId }).populate({
      path: 'senderId',
      select: 'userName profileImageUrl'
    }).sort({ createdAt: -1 })
    console.log(notifications);

    res.status(200).json({ notifications: notifications });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }

}



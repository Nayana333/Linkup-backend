import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Connections from "../model/connection/connectionModel";
import { createNotification } from "../utils/notificationSetter";
import User from "../model/user/userModel";
import { log } from "console";


export const acceptRequest = asyncHandler(async (req: Request, res: Response) => {
  const { userId, requestedUser } = req.body

  await Connections.findOneAndUpdate({ userId }, { $pull: { requested: requestedUser }, $addToSet: { connections: requestedUser }, }, { new: true });

  await Connections.findOneAndUpdate({ userId: requestedUser }, { $pull: { requestSent: userId }, $addToSet: { connections: userId }, }, { new: true });

  const connection = await Connections.findOne({ userId }).populate('connections').populate('requested').populate('requestSent')

  const notificationData = {
    senderId: userId,
    receiverId: requestedUser,
    message: 'accepted your request',
    link: `/people/connections/${userId}`,
    read: false,

  };

  createNotification(notificationData)

  res.status(200).json({ success: true, message: 'follow request accepeted successfully', connection: connection })

})


export const cancelRequest = asyncHandler(async (req: Request, res: Response) => {
  const { userId, cancellingUser } = req.body


  await Connections.findOneAndUpdate({ userId }, { $pull: { requestSent: cancellingUser } })

  const connection = await Connections.findOne({ userId }).populate('connections').populate('requested').populate('requestSent')
  res.status(200).json({ success: true, message: 'follow request cancelled successfully', connection })
})



export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId, followingUser } = req.body;
  console.log(userId, followingUser);

  const followingUserInfo = await User.findById(followingUser);
  let followed = false;
  if (!followingUserInfo) {
    res.status(400);
    throw new Error("User not found");
  }


  await Connections.findOneAndUpdate(
    { userId: followingUser },
    { $addToSet: { requested: userId } },
    { upsert: true }
  );
  await Connections.findOneAndUpdate(
    { userId },
    { $addToSet: { requestSent: followingUser } },
    { upsert: true }
  );

  const notificationData = {
    senderId: userId,
    receiverId: followingUser,
    message: 'requested to connect',
    link: `/people/requestes/${userId}`,
    read: false,

  };

  createNotification(notificationData)



  const followingUserConnections = await Connections.find({
    userId: followingUser,
  });
  const connection = await Connections.findOne({ userId }).populate('connections')
    .populate('requested')
    .populate('requestSent');

  res
    .status(200)
    .json({ success: true, message: "User followed successfully", followed, connection: connection });
});



export const rejectRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, requestedUser } = req.body;
    await Connections.findOneAndUpdate(
      { userId },
      {
        $pull: { requested: requestedUser },

      },
      { new: true }
    );
    await Connections.findOneAndUpdate(
      { userId: requestedUser },
      {
        $pull: { requestSent: userId },

      },
      { new: true }
    );
    const connection = await Connections.findOne({ userId }).populate('connections')
      .populate('requested')
      .populate('requestSent');
    res
      .status(200)
      .json({ success: true, message: "Follow request rejected successfully", connection: connection });
  }
);

export const unFollowUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, unfollowingUser } = req.body;

    await Connections.findOneAndUpdate(
      { userId: unfollowingUser },
      { $pull: { connections: userId, requestSent: userId } }
    );

    await Connections.findOneAndUpdate(
      { userId },
      { $pull: { connections: unfollowingUser, requested: unfollowingUser } }
    );

    const connection = await Connections.findOne({ userId }).populate('connections')
      .populate('requested')
      .populate('requestSent');


    res
      .status(200)
      .json({ success: true, message: "User unfollowed successfully", connection: connection });
  }
);

export const getConnection = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    const connection = await Connections.findOne({ userId }).populate('connections')
      .populate('requested')
      .populate('requestSent');


    res.status(200).json({ connection: connection });

  }
);
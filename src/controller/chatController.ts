import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Conversation from "../model/conversation/conversationModel";
import Message from "../model/messages/messageModel";
import { log } from "console";




export const addConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { senderId, receiverId } = req.body;
    const existConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    }).populate({
      path: "members",
      select: "userName profileImageUrl ",
    });
    if (existConversation) {
      res.status(200).json(existConversation);
      return;
    }

    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });

    try {
      const savedConversation = await newConversation.save();
      const conversation = await Conversation.findById(
        savedConversation._id
      ).populate({
        path: "members",
        select: "userName profileImageUrl ",
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);


export const getUserConversation = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      }).populate({
        path: 'members',
        select: 'userName profileImageUrl'
      }).sort({ updatedAt: -1 });
      res.status(200).json(conversation);

    } catch (err) {
      res.status(500).json(err);
    }
  }
);


export const findConversation = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);


export const addMessage = asyncHandler(async (req: Request, res: Response) => {
  const newMessage = new Message(req.body);
  const { conversationId, text } = req.body;

  try {
    const savedMessage = await newMessage.save();
    const message = await Message.findById(savedMessage._id).populate('sender');
    const conversation = await Conversation.findById(conversationId);

    if (conversation) {
      conversation.lastMessage = text;
      await conversation.save();
    } else {
      throw new Error('Conversation not found');
    }

    res.status(200).json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});


export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate({
      path: 'sender',
      select: 'userName profileImageUrl'
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

export const setMessageRead = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.body;
      const messages = await Message.updateMany(
        { conversationId: conversationId, sender: { $ne: userId } },
        { $set: { isRead: true } }
      );
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

export const getUnreadMessages = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.body;
      const messages = await Message.find({
        conversationId: conversationId,
        sender: { $ne: userId },
        isRead: false,
      });
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);
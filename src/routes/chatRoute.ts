import express from "express";
import { protect } from "../middleware/auth";

import {
  addConversation,
  getUserConversation,
  findConversation,
  addMessage,
  getMessages,
  setMessageRead,
  getUnreadMessages

} from "../controller/chatController";



const router = express.Router();
router.post("/addConversation", protect, addConversation);
router.get("/getUserConversation/:userId", protect, getUserConversation);
router.get("/findConversation/:firstUserId/:secondUserId", protect, findConversation);
router.post('/addMessage', protect, addMessage);
router.get('/getMessages/:conversationId', protect, getMessages)
router.patch('/setMessageRead', protect, setMessageRead);
router.post('/getUnreadMessages', protect, getUnreadMessages)







export default router
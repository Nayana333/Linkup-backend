import express from "express";
import{followUser,acceptRequest,cancelRequest,rejectRequest, unFollowUser,getConnection} from '../controller/connectionController'
import { protect } from "../middleware/auth";
const router = express.Router();

router.post('/unfollow',protect,unFollowUser)
router.post('/acceptRequest',protect,acceptRequest)
router.post('/cancelRequest',protect,cancelRequest)
router.post('/follow',protect,followUser)
router.post('/rejectRequest',protect,rejectRequest)
router.post('/getConnection',protect,getConnection)


import { Schema,model } from "mongoose";

import PostInterface from "./postType";

const PostSchema=new Schema<PostInterface>({
    userId:{
        types:Schema.Types.ObjectId,
        required:true
    },
    imageUrl:{
        type:String,
        required:true

    },

   title:{

    type:String,
    required:true

   },

   description:{
    type:String,
    required:true
   },

   date:{
    type:Date,
    required:true
   },

   likes:{
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        default: []
   },

   isHidden:{
    type:Boolean,
    required:false
   },

   isBlocked:{
    type:Boolean,
    required:false
   },

   hideComment:{
    type:Boolean,
    required:false
   },

   hideLikes:{
    type:Boolean,
    required:false
   },

   isDeleted:{
    type:Boolean,
    default:false
}

},{timestamps:true});

const Post = model<PostInterface>('Post', PostSchema);

export default Post;



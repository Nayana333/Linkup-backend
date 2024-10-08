import { model, Schema } from 'mongoose';
import { MessageDocument } from './messageType';

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Message = model<MessageDocument>('Message', MessageSchema);

export default Message;
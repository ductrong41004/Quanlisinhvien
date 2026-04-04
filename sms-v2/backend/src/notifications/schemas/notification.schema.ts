import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  recipient: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: ['info', 'success', 'warning', 'error'], default: 'info' })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  link: string; // optional: deeplink to a page e.g. /grades or /attendance
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound index for fast query: lấy thông báo của user, sắp theo mới nhất
NotificationSchema.index({ recipient: 1, createdAt: -1 });

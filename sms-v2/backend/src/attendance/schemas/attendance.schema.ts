import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED', // Có phép
}

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  student: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  class: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Prop()
  note: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Đảm bảo mỗi học sinh chỉ có 1 record điểm danh trên 1 lớp vào 1 ngày cụ thể
AttendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

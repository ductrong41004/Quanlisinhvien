import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ required: true, unique: true })
  studentCode: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  dob: Date;

  @Prop({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Class' }] })
  classes: string[];

  @Prop()
  address: string;

  @Prop()
  phoneNumber: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

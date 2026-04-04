import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  academicYear: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  teacher: string;

  @Prop()
  department: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

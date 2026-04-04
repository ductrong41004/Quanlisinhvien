import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type GradeDocument = Grade & Document;

@Schema({ timestamps: true })
export class Grade {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  student: string;

  @Prop({ required: true })
  subjectName: string;

  @Prop({ required: true })
  semester: string;

  @Prop({ required: true, min: 0, max: 10 })
  midtermScore: number;

  @Prop({ required: true, min: 0, max: 10 })
  finalScore: number;

  @Prop()
  totalScore: number;

  @Prop()
  gradeLetter: string;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);

// Logic to calculate total score and grade letter
GradeSchema.pre('save', function (this: GradeDocument) {
  this.totalScore = this.midtermScore * 0.3 + this.finalScore * 0.7;
  
  if (this.totalScore >= 8.5) this.gradeLetter = 'A';
  else if (this.totalScore >= 7.0) this.gradeLetter = 'B';
  else if (this.totalScore >= 5.5) this.gradeLetter = 'C';
  else if (this.totalScore >= 4.0) this.gradeLetter = 'D';
  else this.gradeLetter = 'F';
});

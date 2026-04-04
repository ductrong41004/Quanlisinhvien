import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { Grade, GradeSchema } from './schemas/grade.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Grade.name, schema: GradeSchema }]),
    NotificationsModule,
    StudentsModule,
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { Class, ClassDocument } from '../classes/schemas/class.schema';
import { Grade, GradeDocument } from '../grades/schemas/grade.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  async getStats() {
    const totalStudents = await this.studentModel.countDocuments();
    const totalClasses = await this.classModel.countDocuments();
    const totalTeachers = await this.userModel.countDocuments({ role: 'TEACHER' });

    // Aggregation: Count students by Class
    const studentsByClass = await this.studentModel.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      {
        $project: {
          _id: 0,
          name: '$classInfo.name',
          count: 1,
        },
      },
    ]);

    // Aggregation: Average grade by Subject
    const avgGradeBySubject = await this.gradeModel.aggregate([
      {
        $group: {
          _id: '$subjectName',
          averageObj: { $avg: '$totalScore' },
        },
      },
      {
        $project: {
          _id: 0,
          subject: '$_id',
          average: { $round: ['$averageObj', 1] },
        },
      },
    ]);

    // Data for Gender chart
    const genderStats = await this.studentModel.aggregate([
      {
        $group: {
          _id: '$gender',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1
        }
      }
    ]);

    return {
      overview: { totalStudents, totalClasses, totalTeachers },
      charts: {
        studentsByClass,
        avgGradeBySubject,
        genderStats
      },
    };
  }
}

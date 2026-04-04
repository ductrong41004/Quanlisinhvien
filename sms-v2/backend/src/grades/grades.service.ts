import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Grade, GradeDocument } from './schemas/grade.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GradesService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createGradeDto: any): Promise<GradeDocument> {
    const createdGrade = new this.gradeModel(createGradeDto);
    const saved = await createdGrade.save();

    // Lấy student để biết userId, gửi thông báo cho đúng người
    const populated = await saved.populate('student');
    const studentUserId = (populated.student as any)?.user?.toString();

    if (studentUserId) {
      await this.notificationsService.createForUser(
        studentUserId,
        `Bạn có bảng điểm mới cho môn ${createGradeDto.subjectName}`,
        'success',
        '/grades',
      );
    }

    return saved;
  }

  async findAll(query: any = {}): Promise<GradeDocument[]> {
    const filters: any = {};
    if (query.student) filters.student = query.student;
    if (query.semester) filters.semester = query.semester;
    if (query.subjectName) filters.subjectName = { $regex: query.subjectName, $options: 'i' };

    return this.gradeModel.find(filters).populate('student').exec();
  }

  async findOne(id: string): Promise<GradeDocument> {
    const grade = await this.gradeModel.findById(id).populate('student').exec();
    if (!grade) {
      throw new NotFoundException(`Grade record with ID ${id} not found`);
    }
    return grade;
  }

  async update(id: string, updateGradeDto: any): Promise<GradeDocument> {
    const grade = await this.gradeModel.findById(id).populate('student');
    if (!grade) {
      throw new NotFoundException(`Grade record with ID ${id} not found`);
    }

    Object.assign(grade, updateGradeDto);
    const saved = await grade.save();

    // Gửi thông báo cho sinh viên cụ thể
    const studentUserId = (grade.student as any)?.user?.toString();
    if (studentUserId) {
      await this.notificationsService.createForUser(
        studentUserId,
        `Điểm môn ${saved.subjectName} của bạn vừa được cập nhật`,
        'info',
        '/grades',
      );
    }

    return saved;
  }

  async remove(id: string): Promise<any> {
    const result = await this.gradeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Grade record with ID ${id} not found`);
    }
    return { message: 'Grade record deleted successfully' };
  }

  async getStudentAverages(studentId: string): Promise<any> {
    const grades = await this.gradeModel.find({ student: studentId }).exec();
    if (grades.length === 0) return { average: 0, totalCredits: 0 };

    const totalScore = grades.reduce((sum, g) => sum + g.totalScore, 0);
    const average = totalScore / grades.length;

    return {
      average: average.toFixed(2),
      count: grades.length,
      grades,
    };
  }
}

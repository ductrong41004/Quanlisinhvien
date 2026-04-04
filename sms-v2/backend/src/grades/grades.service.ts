import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Grade, GradeDocument } from './schemas/grade.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';


@Injectable()
export class GradesService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
    private notificationsGateway: NotificationsGateway
  ) {}

  async create(createGradeDto: any): Promise<GradeDocument> {
    const createdGrade = new this.gradeModel(createGradeDto);
    const saved = await createdGrade.save();
    
    // Gửi thông báo
    this.notificationsGateway.sendGlobalNotification(
      `Có bảng điểm mới cho môn ${createGradeDto.subjectName}`,
      'success'
    );
    
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
    // We update midterm and final, pre-save hook will recalculate total
    const grade = await this.gradeModel.findById(id);
    if (!grade) {
      throw new NotFoundException(`Grade record with ID ${id} not found`);
    }
    
    Object.assign(grade, updateGradeDto);
    const saved = await grade.save(); // Using save() instead of findByIdAndUpdate to trigger hooks
    
    // Gửi thông báo
    this.notificationsGateway.sendGlobalNotification(
      `Điểm môn ${saved.subjectName} vừa được cập nhật`,
      'info'
    );
    
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

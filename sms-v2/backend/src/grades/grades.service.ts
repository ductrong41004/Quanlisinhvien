import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Grade, GradeDocument } from './schemas/grade.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class GradesService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
    private notificationsService: NotificationsService,
    private studentsService: StudentsService,
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
    if (query.classId) {
      const studentsRes = await this.studentsService.findAll({ class: query.classId, limit: 5000 });
      const studentIds = studentsRes.data.map((s: any) => s._id);
      filters.student = { $in: studentIds };
    }
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

  async bulkUpsert(bulkData: { studentId: string, subjectName: string, semester: string, midtermScore: number, finalScore: number }[]): Promise<any> {
    if (!bulkData || bulkData.length === 0) return { message: 'No grades to update' };

    let countCreated = 0;
    let countUpdated = 0;

    for (const data of bulkData) {
      const { studentId, subjectName, semester, midtermScore, finalScore } = data;
      
      const totalScore = midtermScore * 0.3 + finalScore * 0.7;
      let gradeLetter = 'F';
      if (totalScore >= 8.5) gradeLetter = 'A';
      else if (totalScore >= 7.0) gradeLetter = 'B';
      else if (totalScore >= 5.5) gradeLetter = 'C';
      else if (totalScore >= 4.0) gradeLetter = 'D';

      const existingRecord = await this.gradeModel.findOne({ student: studentId, subjectName, semester }).populate('student');

      if (existingRecord) {
        existingRecord.midtermScore = midtermScore;
        existingRecord.finalScore = finalScore;
        existingRecord.totalScore = totalScore;
        existingRecord.gradeLetter = gradeLetter;
        await existingRecord.save();
        countUpdated++;
        
        const studentUserId = (existingRecord.student as any)?.user?.toString();
        if (studentUserId) {
          await this.notificationsService.createForUser(
            studentUserId,
            `Điểm môn ${subjectName} của bạn vừa được cập nhật`,
            'info',
            '/grades',
          );
        }
      } else {
        const newRecord = new this.gradeModel({
          student: studentId,
          subjectName,
          semester,
          midtermScore,
          finalScore,
          totalScore,
          gradeLetter
        });
        const saved = await newRecord.save();
        const populated = await saved.populate('student');
        const studentUserId = (populated.student as any)?.user?.toString();
        countCreated++;
        
        if (studentUserId) {
          await this.notificationsService.createForUser(
            studentUserId,
            `Bạn có bảng điểm mới cho môn ${subjectName}`,
            'success',
            '/grades',
          );
        }
      }
    }
    
    return { message: 'Bulk grades processed successfully', countCreated, countUpdated };
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

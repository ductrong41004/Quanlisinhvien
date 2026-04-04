import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { StudentsService } from '../students/students.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    private jwtService: JwtService,
    private studentsService: StudentsService,
    private notificationsService: NotificationsService,
  ) {}

  // =============================================
  // QR CODE — PRODUCTION FLOW
  // =============================================

  /**
   * Teacher/Admin tạo session token (JWT) cho 1 buổi điểm danh
   * Token chứa classId + date + hết hạn sau 5 phút
   */
  generateSessionToken(classId: string, date: string): { token: string; expiresAt: string } {
    const payload = {
      purpose: 'attendance-checkin',
      classId,
      date,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '5m' });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    return { token, expiresAt };
  }

  /**
   * Student quét QR → gửi token lên server → server verify + ghi attendance
   */
  async verifyAndCheckIn(token: string, userId: string): Promise<any> {
    // 1. Verify JWT token
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new BadRequestException('Mã QR đã hết hạn. Vui lòng yêu cầu giáo viên tạo mã mới.');
      }
      throw new BadRequestException('Mã QR không hợp lệ.');
    }

    if (payload.purpose !== 'attendance-checkin') {
      throw new BadRequestException('Mã QR không phải mã điểm danh.');
    }

    // 2. Tìm Student record từ userId
    const result = await this.studentsService.findAll({ class: payload.classId, limit: 1000 });
    const student = result.data.find((s: any) => s.user?._id?.toString() === userId || s.user?.toString() === userId);

    if (!student) {
      throw new BadRequestException('Bạn không thuộc lớp học này hoặc tài khoản chưa được liên kết.');
    }

    // 3. Upsert attendance
    const searchDate = new Date(payload.date);
    searchDate.setHours(0, 0, 0, 0);

    const record = await this.attendanceModel.findOneAndUpdate(
      { student: student._id, class: payload.classId, date: searchDate } as any,
      { $set: { status: 'PRESENT', note: 'Điểm danh qua QR Code' } },
      { new: true, upsert: true },
    );

    // 4. Gửi thông báo cho sinh viên
    await this.notificationsService.createForUser(
      userId,
      `Bạn đã điểm danh thành công buổi học ngày ${payload.date}`,
      'success',
      '/attendance',
    );

    return {
      success: true,
      message: 'Điểm danh thành công!',
      studentName: student.fullName,
      date: payload.date,
    };
  }

  // =============================================
  // MANUAL ATTENDANCE (Teacher/Admin) — giữ nguyên
  // =============================================

  async upsertAttendance(dto: any): Promise<AttendanceDocument> {
    try {
      const searchDate = new Date(dto.date);
      searchDate.setHours(0, 0, 0, 0);

      const record = await this.attendanceModel.findOneAndUpdate(
        { student: dto.studentId, class: dto.classId, date: searchDate } as any,
        { $set: { status: dto.status, note: dto.note || '' } },
        { new: true, upsert: true },
      );
      return record;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Attendance record already exists for this date');
      }
      throw error;
    }
  }

  async getByClassAndDate(classId: string, dateString: string): Promise<AttendanceDocument[]> {
    const searchDate = new Date(dateString);
    searchDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .find({
        class: classId,
        date: { $gte: searchDate, $lte: endOfDay },
      })
      .populate('student')
      .exec();
  }

  async getStudentStats(studentId: string, classId: string): Promise<any> {
    const records = await this.attendanceModel.find({ student: studentId, class: classId }).exec();

    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const excused = records.filter((r) => r.status === 'EXCUSED').length;

    return { total: records.length, present, absent, excused, history: records };
  }
}

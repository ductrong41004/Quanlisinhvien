import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  // Upsert (Update or Insert) Attendance for a student on a specific date
  async upsertAttendance(dto: any): Promise<AttendanceDocument> {
    try {
      // Normalize date to 00:00:00 to avoid duplicate entries for the same day
      const searchDate = new Date(dto.date);
      searchDate.setHours(0, 0, 0, 0);

      const record = await this.attendanceModel.findOneAndUpdate(
        { student: dto.studentId, class: dto.classId, date: searchDate },
        { 
          $set: { 
            status: dto.status, 
            note: dto.note || '' 
          } 
        },
        { new: true, upsert: true }
      );
      return record;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Attendance record already exists for this date');
      }
      throw error;
    }
  }

  // Lấy danh sách điểm danh của 1 lớp trong 1 ngày cụ thể
  async getByClassAndDate(classId: string, dateString: string): Promise<AttendanceDocument[]> {
    const searchDate = new Date(dateString);
    searchDate.setHours(0, 0, 0, 0);
    
    // Tìm ngày chính xác bằng cách filter từ đầu ngày đến cuối ngày
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.attendanceModel.find({
      class: classId,
      date: {
        $gte: searchDate,
        $lte: endOfDay
      }
    }).populate('student').exec();
  }

  // Thống kê điểm danh của 1 sinh viên trong 1 class
  async getStudentStats(studentId: string, classId: string): Promise<any> {
    const records = await this.attendanceModel.find({ student: studentId, class: classId }).exec();
    
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;

    return {
      total: records.length,
      present,
      absent,
      excused,
      history: records
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // =============================================
  // QR CODE ENDPOINTS
  // =============================================

  /**
   * POST /attendance/qr/generate
   * Teacher/Admin tạo mã QR (trả về JWT token hết hạn 5 phút)
   */
  @Post('qr/generate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  generateQR(@Body() body: { classId: string; date: string }) {
    return this.attendanceService.generateSessionToken(body.classId, body.date);
  }

  /**
   * POST /attendance/qr/checkin
   * Student gửi token từ QR → server verify + ghi attendance
   */
  @Post('qr/checkin')
  async checkinByQR(@Body() body: { token: string }, @Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.attendanceService.verifyAndCheckIn(body.token, userId);
  }

  // =============================================
  // MANUAL ATTENDANCE ENDPOINTS (giữ nguyên)
  // =============================================

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async upsertAttendance(@Body() dto: any) {
    return this.attendanceService.upsertAttendance(dto);
  }

  @Get('by-class')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getByClassAndDate(
    @Query('classId') classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getByClassAndDate(classId, date);
  }

  @Get('student-stats')
  async getStudentStats(
    @Query('studentId') studentId: string,
    @Query('classId') classId: string,
  ) {
    return this.attendanceService.getStudentStats(studentId, classId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async upsertAttendance(@Body() dto: any) {
    return this.attendanceService.upsertAttendance(dto);
  }

  @Get('by-class')
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

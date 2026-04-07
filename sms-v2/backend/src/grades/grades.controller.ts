import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { StudentsService } from '../students/students.service';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly studentsService: StudentsService,
  ) {}

  /**
   * GET /grades/my-grades — Student xem điểm của mình
   * Phải đặt TRƯỚC route :id
   */
  @Get('my-grades')
  @Roles(UserRole.STUDENT)
  async getMyGrades(@Request() req: any) {
    const userId = req.user.userId;
    const student = await this.studentsService.findByUserId(userId);
    return this.gradesService.getStudentAverages(student._id.toString());
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(@Body() createGradeDto: any) {
    return this.gradesService.create(createGradeDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async createBulk(@Body() bulkData: any[]) {
    return this.gradesService.bulkUpsert(bulkData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findAll(@Query() query: any) {
    return this.gradesService.findAll(query);
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getStudentAverages(@Param('studentId') studentId: string) {
    return this.gradesService.getStudentAverages(studentId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(@Param('id') id: string, @Body() updateGradeDto: any) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}

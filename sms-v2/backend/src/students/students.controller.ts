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
  Res,
  Request,
} from '@nestjs/common';
import type { Response } from 'express';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * GET /students/me — Student xem hồ sơ cá nhân
   * Phải đặt TRƯỚC route :id để không bị conflict
   */
  @Get('me')
  @Roles(UserRole.STUDENT)
  async getMyProfile(@Request() req: any) {
    const userId = req.user.userId;
    return this.studentsService.findByUserId(userId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(@Body() createStudentDto: any) {
    return this.studentsService.create(createStudentDto);
  }

  @Post('with-user')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async createWithUser(@Body() dto: any) {
    return this.studentsService.createWithUser(dto);
  }

  @Get('export/excel')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async exportExcel(@Query() query: any, @Res() res: Response) {
    const buffer = await this.studentsService.exportExcel(query);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="students.xlsx"',
    });
    
    res.send(buffer);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findAll(@Query() query: any) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}

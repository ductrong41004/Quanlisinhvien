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
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(@Body() createGradeDto: any) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.gradesService.findAll(query);
  }

  @Get('student/:studentId')
  async getStudentAverages(@Param('studentId') studentId: string) {
    return this.gradesService.getStudentAverages(studentId);
  }

  @Get(':id')
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

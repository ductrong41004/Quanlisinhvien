import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('teachers')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getTeachers() {
    return this.usersService.findTeachers();
  }

  @Post('teachers')
  @Roles(UserRole.ADMIN)
  async createTeacher(@Body() createDto: any) {
    return this.usersService.create({ ...createDto, role: UserRole.TEACHER });
  }

  @Patch('teachers/:id')
  @Roles(UserRole.ADMIN)
  async updateTeacher(@Param('id') id: string, @Body() updateDto: any) {
    return this.usersService.update(id, updateDto);
  }

  @Delete('teachers/:id')
  @Roles(UserRole.ADMIN)
  async removeTeacher(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import * as ExcelJS from 'exceljs';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(createStudentDto: any): Promise<StudentDocument> {
    const existingStudent = await this.studentModel.findOne({ studentCode: createStudentDto.studentCode }).exec();
    if (existingStudent) {
      throw new ConflictException(`Student with code ${createStudentDto.studentCode} already exists`);
    }
    const createdStudent = new this.studentModel(createStudentDto);
    return createdStudent.save();
  }

  /**
   * Create a student along with a User account automatically.
   * Username = studentCode, email auto-generated, password = default.
   */
  async createWithUser(dto: any): Promise<StudentDocument> {
    // Check if student code already exists
    const existingStudent = await this.studentModel.findOne({ studentCode: dto.studentCode }).exec();
    if (existingStudent) {
      throw new ConflictException(`Mã sinh viên ${dto.studentCode} đã tồn tại`);
    }

    // Create user account
    const email = dto.email || `${dto.studentCode.toLowerCase()}@student.school.com`;
    const user = await this.usersService.create({
      username: dto.studentCode,
      email,
      password: 'Student@123',
      role: UserRole.STUDENT,
    });

    // Create student record linked to user
    const createdStudent = new this.studentModel({
      user: user._id,
      studentCode: dto.studentCode,
      fullName: dto.fullName,
      dob: dto.dob,
      gender: dto.gender,
      class: dto.class || undefined,
      address: dto.address || '',
      phoneNumber: dto.phoneNumber || '',
    });

    const saved = await createdStudent.save();
    return (await this.studentModel.findById(saved._id).populate('user').populate('class').exec())!;
  }

  async findAll(query: any = {}): Promise<{
    data: StudentDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filters: any = {};

    // Combined search: search by fullName OR studentCode
    if (query.search) {
      filters.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { studentCode: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Legacy support for separate field search
    if (query.fullName) {
      filters.fullName = { $regex: query.fullName, $options: 'i' };
    }
    if (query.studentCode) {
      filters.studentCode = { $regex: query.studentCode, $options: 'i' };
    }

    // Filters
    if (query.gender) {
      filters.gender = query.gender;
    }
    if (query.class) {
      filters.class = query.class;
    }

    // Pagination
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.studentModel
        .find(filters)
        .populate('user')
        .populate('class')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.studentModel.countDocuments(filters).exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<StudentDocument> {
    const student = await this.studentModel.findById(id).populate('user').populate('class').exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findByCode(studentCode: string): Promise<StudentDocument> {
    const student = await this.studentModel.findOne({ studentCode }).populate('user').populate('class').exec();
    if (!student) {
      throw new NotFoundException(`Student with code ${studentCode} not found`);
    }
    return student;
  }

  async findByUserId(userId: string): Promise<StudentDocument> {
    const student = await this.studentModel.findOne({ user: userId }).populate('user').populate('class').exec();
    if (!student) {
      throw new NotFoundException(`Không tìm thấy hồ sơ sinh viên cho tài khoản này`);
    }
    return student;
  }

  async update(id: string, updateStudentDto: any): Promise<StudentDocument> {
    const student = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .populate('user')
      .populate('class')
      .exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async remove(id: string): Promise<any> {
    const result = await this.studentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return { message: 'Student deleted successfully' };
  }

  async exportExcel(query: any = {}): Promise<Buffer> {
    // Get all matching students (no pagination for export)
    const filters: any = {};
    if (query.search) {
      filters.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { studentCode: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.fullName) {
      filters.fullName = { $regex: query.fullName, $options: 'i' };
    }
    if (query.gender) {
      filters.gender = query.gender;
    }
    if (query.class) {
      filters.class = query.class;
    }

    const students = await this.studentModel
      .find(filters)
      .populate('user')
      .populate('class')
      .sort({ createdAt: -1 })
      .exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DanhSachSinhVien');

    // Define columns
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Mã SV', key: 'studentCode', width: 15 },
      { header: 'Họ và Tên', key: 'fullName', width: 25 },
      { header: 'Ngày Sinh', key: 'dob', width: 15 },
      { header: 'Giới Tính', key: 'gender', width: 12 },
      { header: 'Lớp', key: 'className', width: 15 },
      { header: 'Điện Thoại', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Add rows
    students.forEach((student: any, index) => {
      worksheet.addRow({
        stt: index + 1,
        studentCode: student.studentCode,
        fullName: student.fullName,
        dob: student.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : '',
        gender: student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác',
        className: student.class?.name || 'N/A',
        phone: student.phoneNumber || 'N/A',
        email: student.user?.email || 'N/A',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any;
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';

@Injectable()
export class StudentsService {
  constructor(@InjectModel(Student.name) private studentModel: Model<StudentDocument>) {}

  async create(createStudentDto: any): Promise<StudentDocument> {
    const existingStudent = await this.studentModel.findOne({ studentCode: createStudentDto.studentCode }).exec();
    if (existingStudent) {
      throw new ConflictException(`Student with code ${createStudentDto.studentCode} already exists`);
    }
    const createdStudent = new this.studentModel(createStudentDto);
    return createdStudent.save();
  }

  async findAll(query: any = {}): Promise<StudentDocument[]> {
    const filters: any = {};
    if (query.fullName) {
      filters.fullName = { $regex: query.fullName, $options: 'i' };
    }
    if (query.studentCode) {
      filters.studentCode = query.studentCode;
    }
    if (query.class) {
      filters.class = query.class;
    }

    return this.studentModel.find(filters).populate('user').populate('class').exec();
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

  async update(id: string, updateStudentDto: any): Promise<StudentDocument> {
    const student = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
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
}

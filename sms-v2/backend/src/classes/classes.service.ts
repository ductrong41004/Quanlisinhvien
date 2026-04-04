import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(createClassDto: any): Promise<ClassDocument> {
    const createdClass = new this.classModel(createClassDto);
    return createdClass.save();
  }

  async findAll(): Promise<any[]> {
    const classes = await this.classModel.find().populate('teacher').lean().exec();
    
    // Concurrently aggregate student count for each class
    const counts = await this.studentModel.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } }
    ]);
    
    // Create a map for fast lookup
    const countMap = new Map(counts.map(c => [c._id ? c._id.toString() : 'unassigned', c.count]));

    return classes.map(c => ({
      ...c,
      studentCount: countMap.get(c._id.toString()) || 0
    }));
  }

  async findOne(id: string): Promise<ClassDocument> {
    const cls = await this.classModel.findById(id).populate('teacher').exec();
    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return cls;
  }

  async update(id: string, updateClassDto: any): Promise<ClassDocument> {
    const cls = await this.classModel
      .findByIdAndUpdate(id, updateClassDto, { new: true })
      .exec();
    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return cls;
  }

  async remove(id: string): Promise<any> {
    const result = await this.classModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return { message: 'Class deleted successfully' };
  }

  async assignStudents(classId: string, studentIds: string[]): Promise<any> {
    const targetClass = await this.classModel.findById(classId).exec();
    if (!targetClass) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    
    // Update all matching students to have this class
    const updateResult = await this.studentModel.updateMany(
      { _id: { $in: studentIds } },
      { $set: { class: classId } }
    );
    
    return { 
      message: 'Students assigned successfully', 
      modifiedCount: updateResult.modifiedCount 
    };
  }
}
